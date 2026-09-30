"""
Corpus Loader Utility for SAKTI.
Loads, validates, and filters authoritative legal documents from data/corpus/.
"""

import json
from pathlib import Path
from typing import List, Dict, Optional
from pydantic import BaseModel, Field

class CorpusDocument(BaseModel):
    id: str
    jurisdiction: str  # "India" | "International"
    statute: str
    section_rule: str
    authority: str
    official_url: str
    content: str
    title: Optional[str] = None
    category: Optional[str] = None
    source_type: Optional[str] = None
    effective_date: Optional[str] = None
    last_verified: Optional[str] = None
    verification_status: Optional[str] = None

class CorpusStore:
    def __init__(self, corpus_dir: Optional[Path] = None):
        if corpus_dir is None:
            self.corpus_dir = Path(__file__).resolve().parent.parent / "data" / "corpus"
        else:
            self.corpus_dir = Path(corpus_dir)
        self.documents: Dict[str, CorpusDocument] = {}
        self.load()

    def load(self):
        """Loads all JSON provisions from the corpus directory."""
        if not self.corpus_dir.exists():
            return

        for file_path in self.corpus_dir.glob("*.json"):
            if file_path.name == "corpus_index.json":
                continue
            try:
                data = json.loads(file_path.read_text(encoding="utf-8"))
                doc = CorpusDocument(**data)
                self.documents[doc.id] = doc
            except Exception as e:
                print(f"[Warning] Failed to load {file_path.name}: {e}")

    def get_all(self) -> List[CorpusDocument]:
        return list(self.documents.values())

    def filter(self, jurisdiction: Optional[str] = None, category: Optional[str] = None) -> List[CorpusDocument]:
        results = list(self.documents.values())
        if jurisdiction:
            results = [d for d in results if d.jurisdiction.lower() == jurisdiction.lower()]
        if category:
            results = [d for d in results if d.category and d.category.lower() == category.lower()]
        return results

    def get_by_id(self, doc_id: str) -> Optional[CorpusDocument]:
        return self.documents.get(doc_id)

corpus_store = CorpusStore()
