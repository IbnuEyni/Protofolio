from __future__ import annotations
import os
import requests
from .cv_context import retrieve, detect_language

DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"

SYSTEM_EN = """\
You are "Amir's CV Terminal" — a precise, technical AI assistant embedded in \
Amir's software engineering portfolio. You answer questions about his skills, \
projects, and experience strictly from the CV context below.

Rules:
- Be concise (≤ 150 words) but technically accurate.
- If asked about Amharic NLP, mention WER reduction, HuggingFace fine-tuning, \
  and the specific models (mBERT, XLM-R, NLLB-200) where relevant.
- If asked about Calldi, mention the 90% reduction in manual entry.
- If asked about SkillBridge, mention the 1,000+ users.
- If the answer is not in the context, say so clearly — do not hallucinate.
- Respond in the same language the user writes in (English or Amharic).

--- CV CONTEXT ---
{context}
--- END CONTEXT ---
"""

SYSTEM_AM = """\
እርስዎ "የሹዓይብ CV ተርሚናል" ነዎት — በሹዓይብ የሶፍትዌር ፖርትፎሊዮ ውስጥ የተቀመጠ ትክክለኛ AI ረዳት። \
ስለ ክህሎቶቹ፣ ፕሮጀክቶቹ እና ልምዱ ጥያቄዎችን ከዚህ በታች ካለው CV አውድ ብቻ ይመልሱ።

ህጎች:
- አጭር (≤ 150 ቃላት) ነገር ግን ቴክኒካዊ ትክክለኛ ይሁኑ።
- ስለ አማርኛ NLP ሲጠየቁ፣ WER ቅነሳ፣ HuggingFace fine-tuning እና ሞዴሎቹን (mBERT, XLM-R) ይጥቀሱ።
- ስለ Calldi ሲጠየቁ፣ 90% የእጅ ግቤት ቅነሳ ይጥቀሱ።
- መልሱ በአውዱ ውስጥ ከሌለ፣ ግልጽ ያድርጉ — አይፈጥሩ።
- ተጠቃሚው በጻፈው ቋንቋ (አማርኛ ወይም እንግሊዝኛ) ይመልሱ።

--- CV አውድ ---
{context}
--- አውድ ማብቂያ ---
"""


def ask(question: str, history: list[dict] | None = None) -> dict:
    """
    Returns {"answer": str, "lang": "en"|"am", "sources": [str]}.
    history: list of {"role": "user"|"assistant", "content": str}
    """
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        raise EnvironmentError("DEEPSEEK_API_KEY is not set.")

    lang    = detect_language(question)
    chunks  = retrieve(question, top_k=4)
    context = "\n\n".join(chunks)
    system  = (SYSTEM_AM if lang == "am" else SYSTEM_EN).format(context=context)

    messages = [{"role": "system", "content": system}]

    # inject last 4 turns of history for multi-turn context
    for turn in (history or [])[-4:]:
        if turn.get("role") in ("user", "assistant") and turn.get("content"):
            messages.append({"role": turn["role"], "content": turn["content"]})

    messages.append({"role": "user", "content": question})

    response = requests.post(
        DEEPSEEK_API_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": "deepseek-chat",
            "messages": messages,
            "max_tokens": 300,
            "temperature": 0.25,
        },
        timeout=30,
    )
    response.raise_for_status()
    answer = response.json()["choices"][0]["message"]["content"].strip()

    # surface which chunks were used as source labels
    source_labels = []
    for chunk in chunks:
        if "Calldi" in chunk:
            source_labels.append("Calldi")
        elif "SkillBridge" in chunk:
            source_labels.append("SkillBridge")
        elif "Amharic" in chunk or "አማርኛ" in chunk:
            source_labels.append("Amharic NLP")
        elif "NextGen" in chunk:
            source_labels.append("NextGen Solutions")
        elif "A2SV" in chunk:
            source_labels.append("A2SV")

    return {"answer": answer, "lang": lang, "sources": list(dict.fromkeys(source_labels))}
