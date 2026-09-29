"""
Dense Vector Store and Retrieval Engine for SAKTI.
Uses dense embeddings (Gemini embedding-001) + FAISS (IndexFlatIP with normalized cosine similarity)
with jurisdiction filtering (India vs International) and full metadata preservation.
"""

import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np
import faiss
from google import genai

from backend.config import settings
from backend.corpus_loader import corpus_store, CorpusDocument

VECTOR_STORE_DIR = Path(__file__).resolve().parent.parent / "data" / "vector_store"
INDEX_FILE = VECTOR_STORE_DIR / "faiss.index"
METADATA_FILE = VECTOR_STORE_DIR / "metadata.json"
VECTORS_FILE = VECTOR_STORE_DIR / "vectors.npy"

class RetrievalResult:
    def __init__(self, document: Dict[str, Any], score: float):
        self.id = document["id"]
        self.jurisdiction = document["jurisdiction"]
        self.statute = document["statute"]
        self.section_rule = document["section_rule"]
        self.authority = document["authority"]
        self.official_url = document["official_url"]
        self.title = document.get("title", "")
        self.category = document.get("category", "")
        self.content = document["content"]
        self.score = float(score)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "jurisdiction": self.jurisdiction,
            "statute": self.statute,
            "section_rule": self.section_rule,
            "authority": self.authority,
            "official_url": self.official_url,
            "title": self.title,
            "category": self.category,
            "content": self.content,
            "score": round(self.score, 4)
        }

class DenseVectorStore:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.embedding_model = "gemini-embedding-001"
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None
        self.index: Optional[faiss.IndexFlatIP] = None
        self.metadata: List[Dict[str, Any]] = []
        self.vectors: Optional[np.ndarray] = None
        self.dimension = 3072

        # Auto-load existing index if available
        self.load()

    def get_embedding(self, text: str) -> np.ndarray:
        """Generates a normalized 3072-dim embedding for a single text."""
        if not self.client:
            raise ValueError("Gemini API key is not configured in environment or settings.")
        
        response = self.client.models.embed_content(
            model=self.embedding_model,
            contents=text
        )
        vec = np.array(response.embeddings[0].values, dtype=np.float32)
        # L2-normalize so inner product equals cosine similarity
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec

    def build_from_corpus(self, force_rebuild: bool = False) -> int:
        """Embeds all documents in the corpus and builds the FAISS index."""
        VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
        
        if not force_rebuild and INDEX_FILE.exists() and METADATA_FILE.exists():
            print("[*] Loading cached FAISS index from disk...")
            self.load()
            return len(self.metadata)

        docs = corpus_store.get_all()
        if not docs:
            corpus_store.load()
            docs = corpus_store.get_all()

        print(f"[*] Embedding {len(docs)} corpus documents using {self.embedding_model}...")
        vectors_list = []
        metadata_list = []

        for i, doc in enumerate(docs):
            # Rich document text representation for optimal semantic indexing
            search_text = (
                f"Statute: {doc.statute}\n"
                f"Section: {doc.section_rule} - {doc.title or ''}\n"
                f"Jurisdiction: {doc.jurisdiction}\n"
                f"Authority: {doc.authority}\n"
                f"Content: {doc.content}"
            )
            print(f"  [{i+1}/{len(docs)}] Embedding {doc.id} ({doc.section_rule})...")
            vec = self.get_embedding(search_text)
            vectors_list.append(vec)

            metadata_list.append({
                "id": doc.id,
                "jurisdiction": doc.jurisdiction,
                "statute": doc.statute,
                "section_rule": doc.section_rule,
                "authority": doc.authority,
                "official_url": doc.official_url,
                "title": doc.title or "",
                "category": doc.category or "",
                "content": doc.content
            })

        self.vectors = np.vstack(vectors_list)
        self.dimension = self.vectors.shape[1]

        # Build FAISS IndexFlatIP (Cosine similarity)
        self.index = faiss.IndexFlatIP(self.dimension)
        self.index.add(self.vectors)
        self.metadata = metadata_list

        # Save to disk
        faiss.write_index(self.index, str(INDEX_FILE))
        np.save(str(VECTORS_FILE), self.vectors)
        with open(METADATA_FILE, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, indent=2, ensure_ascii=False)

        print(f"[OK] Successfully indexed {len(self.metadata)} documents in FAISS at {INDEX_FILE}")
        return len(self.metadata)

    def load(self) -> bool:
        """Loads index and metadata from disk cache if present."""
        if INDEX_FILE.exists() and METADATA_FILE.exists():
            self.index = faiss.read_index(str(INDEX_FILE))
            with open(METADATA_FILE, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)
            if VECTORS_FILE.exists():
                self.vectors = np.load(str(VECTORS_FILE))
            return True
        return False

    def search(
        self,
        query: str,
        top_k: int = 5,
        jurisdiction: Optional[str] = None
    ) -> List[RetrievalResult]:
        """
        Searches the index for query text with optional jurisdiction filtering.
        jurisdiction: 'India', 'International', or None (searches both).
        """
        if self.index is None or not self.metadata:
            # Try loading or building
            if not self.load():
                self.build_from_corpus()

        query_vec = self.get_embedding(query).reshape(1, -1)
        
        # Retrieve more candidates if filtering is applied
        k_search = min(len(self.metadata), top_k * 3 if jurisdiction else top_k)
        scores, indices = self.index.search(query_vec, k_search)

        results: List[RetrievalResult] = []
        for idx, score in zip(indices[0], scores[0]):
            if idx == -1:
                continue
            doc = self.metadata[idx]
            
            # Apply jurisdiction filter if specified
            if jurisdiction:
                if doc["jurisdiction"].strip().lower() != jurisdiction.strip().lower():
                    continue

            results.append(RetrievalResult(doc, float(score)))
            if len(results) >= top_k:
                break

        return results

vector_store = DenseVectorStore()
