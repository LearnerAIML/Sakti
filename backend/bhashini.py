"""Optional Bhashini (ULCA) translation adapter. Disabled unless BHASHINI_USER_ID and BHASHINI_API_KEY are set.
Two-step pipeline flow (config lookup, then compute). It never raises into the app: on any failure it returns None.
NOTE: written from the public ULCA pipeline description; not verified against the live service by the SAKTI authors."""
import os
from typing import Optional
import httpx

CONFIG_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline"
PIPELINE_ID = os.getenv("BHASHINI_PIPELINE_ID", "64392f96daac500b55c543cd")


def configured() -> bool:
    return bool(os.getenv("BHASHINI_USER_ID") and os.getenv("BHASHINI_API_KEY"))


def translate(text: str, target: str, source: str = "en") -> Optional[str]:
    if not configured() or not text.strip():
        return None
    try:
        headers = {"userID": os.environ["BHASHINI_USER_ID"], "ulcaApiKey": os.environ["BHASHINI_API_KEY"], "Content-Type": "application/json"}
        lang = {"sourceLanguage": source, "targetLanguage": target}
        cfg = httpx.post(CONFIG_URL, headers=headers, timeout=15, json={
            "pipelineTasks": [{"taskType": "translation", "config": {"language": lang}}],
            "pipelineRequestConfig": {"pipelineId": PIPELINE_ID}}).json()
        url = cfg["pipelineInferenceAPIEndPoint"]["callbackUrl"]
        key = cfg["pipelineInferenceAPIEndPoint"]["inferenceApiKey"]
        service = cfg["pipelineResponseConfig"][0]["config"][0]["serviceId"]
        out = httpx.post(url, headers={key["name"]: key["value"], "Content-Type": "application/json"}, timeout=60, json={
            "pipelineTasks": [{"taskType": "translation", "config": {"language": lang, "serviceId": service}}],
            "inputData": {"input": [{"source": text[:4000]}]}}).json()
        return out["pipelineResponse"][0]["output"][0]["target"]
    except Exception:
        return None
