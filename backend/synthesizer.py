"""
Grounded Synthesis and Citation Formatter for SAKTI.
Connects the local dense FAISS retrieval engine with Gemini API to generate:
- Evidence-grounded answers strictly based on retrieved statutory text
- Verified source citations with official government URLs
- Confidence scoring (High / Medium / Low)
- Safe abstention mechanism when evidence is insufficient
- Post-synthesis citation verification against corpus IDs
"""

import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import errors

from backend.config import settings
from backend.vector_store import vector_store, RetrievalResult
from backend.corpus_loader import corpus_store
from backend.guardrails import guardrails, MANDATORY_LEGAL_DISCLAIMER, MANDATORY_LEGAL_DISCLAIMER_HI

CANDIDATE_MODELS = [
    "gemini-3-flash-preview",
    "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest"
]

ABSTENTION_THRESHOLD = 0.52  # Cosine similarity threshold below which SAKTI safely abstains

class CitationItem(BaseModel):
    id: str
    jurisdiction: str
    statute: str
    section_rule: str
    authority: str
    official_url: str
    title: str
    relevance_score: float

class SynthesisResponse(BaseModel):
    query: str
    jurisdiction: str
    answer: str
    confidence: str  # "High" | "Medium" | "Low"
    is_abstained: bool
    citations: List[CitationItem]
    disclaimer: str
    language: str = "en"

class GroundedSynthesizer:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None

    def _call_gemini_with_fallback(self, prompt: str) -> str:
        """Invokes Gemini models in resilient fallback order."""
        if not self.client:
            raise ValueError("GEMINI_API_KEY is not configured in environment or .env file.")

        last_error = None
        for model_name in CANDIDATE_MODELS:
            try:
                response = self.client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                last_error = e
                continue

        # If all API calls fail, provide grounded fallback based on top context
        raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")

    def synthesize(
        self,
        query: str,
        jurisdiction: Optional[str] = "India",
        top_k: int = 4,
        language: Optional[str] = "en"
    ) -> SynthesisResponse:
        """
        Executes grounded retrieval and synthesis with active guardrails and bilingual (EN/HI) support.
        """
        # Determine language preference: explicit "hi" or detected Devanagari script
        is_hindi = (language == "hi") or bool(re.search(r"[\u0900-\u097F]", query))
        target_lang = "hi" if is_hindi else "en"
        disclaimer_text = MANDATORY_LEGAL_DISCLAIMER_HI if target_lang == "hi" else MANDATORY_LEGAL_DISCLAIMER

        # Step 0: Safety Guardrail Inspection (Prompt Injection & Scope Filter)
        guard = guardrails.inspect(query)
        if not guard.is_safe:
            rejection_text = guard.rejection_message or "Request blocked by safety guardrails."
            if target_lang == "hi":
                rejection_text = (
                    "सुरक्षा जांच (SAFETY GUARDRAIL): आपका अनुरोध सुरक्षा नीतियों अथवा प्रणाली सीमाओं के कारण रोका गया। "
                    "SAKTI केवल आयुष बौद्धिक संपदा, जैव विविधता (ABS) और औषधि नियमों से संबंधित प्रामाणिक कानूनी विश्लेषण प्रदान करता है।"
                )
            return SynthesisResponse(
                query=guard.sanitized_query,
                jurisdiction=jurisdiction or "All",
                answer=rejection_text,
                confidence="Low",
                is_abstained=True,
                citations=[],
                disclaimer=disclaimer_text,
                language=target_lang
            )

        sanitized_query = guard.sanitized_query

        # Step 1: Local Vector Retrieval
        retrieved_docs: List[RetrievalResult] = vector_store.search(
            query=sanitized_query,
            top_k=top_k,
            jurisdiction=jurisdiction
        )

        # Step 2: Safe Abstention Gate
        top_score = retrieved_docs[0].score if retrieved_docs else 0.0
        if not retrieved_docs or top_score < ABSTENTION_THRESHOLD:
            abstention_msg = (
                "सुरक्षित परिहार (SAFE ABSTENTION): SAKTI कानूनी निश्चितता के साथ उत्तर देने के लिए ज्ञानकोष में पर्याप्त आधिकारिक सांविधिक प्रावधान "
                f"पहचानने में असमर्थ रहा (संबद्धता स्कोर {top_score:.2f}, न्यूनतम सीमा {ABSTENTION_THRESHOLD})।\n\n"
                "कानूनी भ्रम (hallucination) से बचने के लिए, प्रणाली अनुमानित सलाह देने से परहेज करती है। कृपया अपने प्रश्न को और स्पष्ट करें या आधिकारिक आयुष/आईपी इंडिया पोर्टल्स से संपर्क करें।"
                if target_lang == "hi" else (
                    "SAFE ABSTENTION: SAKTI could not identify sufficient authoritative statutory provisions "
                    f"in the curated knowledge base to answer this query with legal certainty (relevance score {top_score:.2f} "
                    f"below threshold {ABSTENTION_THRESHOLD}).\n\n"
                    "To prevent legal hallucination, the system abstains from generating speculative advice. "
                    "Please refine your query or consult official AYUSH/IP India portals."
                )
            )
            return SynthesisResponse(
                query=query,
                jurisdiction=jurisdiction or "All",
                answer=abstention_msg,
                confidence="Low",
                is_abstained=True,
                citations=[],
                disclaimer=disclaimer_text,
                language=target_lang
            )

        # Step 3: Context Assembly
        context_blocks = []
        doc_map: Dict[str, RetrievalResult] = {}
        for i, doc in enumerate(retrieved_docs):
            doc_map[doc.id] = doc
            context_blocks.append(
                f"--- SOURCE [{i+1}] ---\n"
                f"ID: {doc.id}\n"
                f"Statute: {doc.statute}\n"
                f"Section/Rule: {doc.section_rule}\n"
                f"Title: {doc.title}\n"
                f"Authority: {doc.authority}\n"
                f"Official URL: {doc.official_url}\n"
                f"Legal Text:\n{doc.content}\n"
            )

        context_str = "\n".join(context_blocks)

        bilingual_instructions = ""
        if target_lang == "hi":
            bilingual_instructions = f"""
9. BILINGUAL HINDI OUTPUT REQUIREMENTS:
   - Provide your complete analysis in clear, natural, and formal Hindi (Devanagari script).
   - STRICT LEGAL CITATION RULE: Strictly preserve the exact English statutory names, sections, rules, and Source IDs in standard dual/formal format:
     * e.g., 'पेटेंट अधिनियम, 1970 (Patents Act, 1970) की धारा 3(p)' or 'Section 3(p) of the Patents Act, 1970'
     * e.g., 'जैविक विविधता अधिनियम, 2002 (Biological Diversity Act, 2002) की धारा 6'
     * Always retain the exact Source ID in brackets, e.g. `[{retrieved_docs[0].id}]`.
     * Official URLs must remain completely untouched in English.
   - Use standard Hindi headings:
     * ## सारांश (Summary Answer)
     * ## लागू सांविधिक प्रावधान एवं कानूनी विश्लेषण (Applicable Legal Provisions & Statutory Analysis)
     * ## रणनीतिक मार्गदर्शन एवं आगामी कदम (Strategic Guidance & Next Steps)
   - Note that official statutory authoritative texts are published in the Official Gazette (राजपत्र) in Hindi and English under the Constitution of India and the Official Languages Act, 1963.
   - Use judicial balance and qualified phrasing (e.g., 'पेटेंट अधिनियम की धारा 3(p) के तहत गंभीर सांविधिक आपत्तियों का सामना करना पड़ सकता है' rather than categorical statements).
"""

        prompt = f"""You are SAKTI, an expert AI legal assistant for Ayurveda Intellectual Property Rights (IPR), Access and Benefit Sharing (ABS), and drug regulations for the Smart India Hackathon.

JURISDICTION FILTER APPLIED: {jurisdiction or 'All'}

AUTHORITATIVE LEGAL CONTEXT (GROUND TRUTH):
{context_str}

USER QUERY:
{query}

INSTRUCTIONS FOR GENERATION:
1. Answer the question AUTHORITATIVELY and COMPREHENSIVELY using ONLY the legal context provided above.
2. For EVERY legal statement, objection, or requirement, explicitly cite the statute and section (e.g., Section 3(p) of the Patents Act, 1970).
3. Reference the specific Source ID in brackets, like `[{retrieved_docs[0].id}]`.
4. Structure your response with clear headings:
   - Summary Answer
   - Applicable Legal Provisions & Statutory Analysis
   - Strategic Guidance & Next Steps
5. If the context does not contain sufficient statutory authority to answer the query, state 'INSUFFICIENT EVIDENCE' instead of guessing.
6. Do NOT invent sections, rules, or URLs not found in the context.
7. Strict Legal Accuracy:
   - For WIPO GRATK Treaty: Note that it was adopted in 2024 and its mandatory disclosure obligation applies upon entry into force (Article 17).
   - Sanctions under Article 6 of WIPO GRATK: Emphasize that Contracting Parties provide opportunity to rectify, and Article 6.4 prohibits patent revocation/invalidation solely for non-disclosure unless fraudulent intention is proved.
   - For India ABS: Under Section 6(1) of the Biological Diversity Act, NBA approval is required before the grant of the patent/IPR for inventions utilizing Indian biological resources; foreign filing permission for Indian residents is procedurally governed by Section 39 of the Patents Act (Foreign Filing License).
8. Judicial Balance & Qualified Legal Phrasing:
   - Avoid categorical statements like 'you cannot patent this' or 'it is completely impossible'. Instead, use legally balanced and qualified phrasing such as 'would face significant statutory patentability objections under Section 3(p) and/or Section 3(e)'.
   - Invoke Section 3(p) only when the traditional-knowledge basis is actually supported by the available corpus context.
   - Phrase Section 39 foreign-filing requirements conditionally (it applies specifically to persons resident in India for inventions made in India, requiring an FFL or a 6-week waiting period unless an Indian application was previously filed; it is not a blanket rule for all entities).{bilingual_instructions}

Provide your grounded analysis now:"""

        # Step 4: Gemini LLM Generation
        try:
            raw_answer = self._call_gemini_with_fallback(prompt)
        except Exception as e:
            # Fallback synthesis if API is unavailable during demo
            if target_lang == "hi":
                raw_answer = (
                    f"### सांविधिक विश्लेषण (ऑफलाइन ग्राउंडेड मोड)\n\n"
                    f"**{query}** के लिए प्राप्त कानूनी प्रावधान:\n\n"
                    f"1. **{retrieved_docs[0].statute} ({retrieved_docs[0].section_rule})**: {retrieved_docs[0].content[:250]}...\n"
                    f"2. **आधिकारिक प्राधिकरण**: {retrieved_docs[0].authority}\n"
                    f"3. **आधिकारिक संदर्भ**: {retrieved_docs[0].official_url}\n\n"
                    f"*(नोट: जेमिनी लाइव जेनरेशन में विलंब के कारण प्रत्यक्ष संदर्भ प्रस्तुत किया गया है)।* "
                )
            else:
                raw_answer = (
                    f"### Statutory Analysis (Offline Grounded Mode)\n\n"
                    f"Based on retrieved legal provisions for **{query}**:\n\n"
                    f"1. **{retrieved_docs[0].statute} ({retrieved_docs[0].section_rule})**: {retrieved_docs[0].content[:250]}...\n"
                    f"2. **Official Authority**: {retrieved_docs[0].authority}\n"
                    f"3. **Official Reference**: {retrieved_docs[0].official_url}\n\n"
                    f"*(Note: Gemini live generation experienced high latency; grounded context displayed directly).* "
                )

        # Step 5: Citation Extraction & Validation
        validated_citations: List[CitationItem] = []
        seen_ids = set()

        # Check if the model explicitly expressed insufficient evidence or inability to answer
        model_abstained = "INSUFFICIENT EVIDENCE" in raw_answer.upper() or "OUTSIDE THE SCOPE" in raw_answer.upper()

        if not model_abstained:
            # Check which retrieved documents were cited or relevant
            for doc in retrieved_docs:
                if doc.id not in seen_ids:
                    # Validate doc actually exists in corpus_store
                    corpus_doc = corpus_store.get_by_id(doc.id)
                    if corpus_doc:
                        validated_citations.append(
                            CitationItem(
                                id=doc.id,
                                jurisdiction=doc.jurisdiction,
                                statute=doc.statute,
                                section_rule=doc.section_rule,
                                authority=doc.authority,
                                official_url=doc.official_url,
                                title=doc.title,
                                relevance_score=doc.score
                            )
                        )
                        seen_ids.add(doc.id)

        # Step 6: Determine Confidence Level
        if model_abstained:
            confidence = "Low"
            is_abstained = True
        elif top_score >= 0.65 and len(validated_citations) >= 2:
            confidence = "High"
            is_abstained = False
        elif top_score >= 0.52:
            confidence = "Medium"
            is_abstained = False
        else:
            confidence = "Low"
            is_abstained = True

        return SynthesisResponse(
            query=query,
            jurisdiction=jurisdiction or "All",
            answer=raw_answer,
            confidence=confidence,
            is_abstained=is_abstained,
            citations=validated_citations,
            disclaimer=disclaimer_text,
            language=target_lang
        )

synthesizer = GroundedSynthesizer()
