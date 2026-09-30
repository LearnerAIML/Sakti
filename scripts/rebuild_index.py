"""Re-embed the corpus after adding/editing files: python scripts/rebuild_index.py  (needs GEMINI_API_KEY)."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from backend.vector_store import vector_store
print("Indexed", vector_store.build_from_corpus(force_rebuild=True), "documents")
