"""Optional-extension router aggregator (identical in every Improvement zip).
Each improvement provides a module below; modules that are not installed are skipped."""
import importlib
from fastapi import APIRouter

router = APIRouter()

_MODULES = ["ext_dossier", "ext_abs", "ext_graph", "ext_eval", "ext_compare", "ext_lang"]

for _name in _MODULES:
    try:
        _mod = importlib.import_module(f"backend.{_name}")
    except ModuleNotFoundError as exc:
        if exc.name != f"backend.{_name}":
            raise
        continue
    router.include_router(_mod.router)
