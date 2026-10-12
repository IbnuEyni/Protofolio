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
- Lead with concrete numbers from the context (e.g. 9 agent systems in 12 weeks, \
  35.2% pass@1 on DataAgentBench, 250-task benchmark, 90% less manual entry).
- Never invent metrics, employers, dates, or models that are not in the context.
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
- ከአውዱ ውስጥ ያሉ ቁጥሮችን ይጠቀሙ (ለምሳሌ በ12 ሳምንታት 9 የAI ኤጀንት ሲስተሞች፣ 35.2% pass@1)።
- በአውዱ ውስጥ የሌሉ ቁጥሮችን፣ ቀጣሪዎችን ወይም ቀኖችን አይፍጠሩ።
- መልሱ በአውዱ ውስጥ ከሌለ፣ ግልጽ ያድርጉ — አይፈጥሩ።
- ተጠቃሚው በጻፈው ቋንቋ (አማርኛ ወይም እንግሊዝኛ) ይመልሱ።

--- CV አውድ ---
{context}
--- አውድ ማብቂያ ---
"""

SOURCE_MARKERS = [
    ("Oracle Forge",            "Oracle Forge"),
    ("Tenacious Sales Bench",   "Tenacious Bench"),
    ("Conversion Engine is",    "Conversion Engine"),
    ("Automaton Auditor",       "Automaton Auditor"),
    ("The Ledger",              "The Ledger"),
    ("Client projects",         "Client Projects"),
    ("Education:",              "Education"),
    ("At 10 Academy",           "10 Academy"),
    ("NextGen",                 "NextGen Solutions"),
    ("ReiSearch",               "ReiSearch"),
    ("iCog-Labs",               "iCog-Labs"),
    ("Ethiopian Artificial",    "Amharic NLP"),
    ("SkillBridge",             "SkillBridge"),
    ("Skills —",                "Skills"),
]


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

    # surface which chunks were used as source labels (first marker wins)
    source_labels = []
    for chunk in chunks:
        label = next((lbl for marker, lbl in SOURCE_MARKERS if marker in chunk), None)
        if label:
            source_labels.append(label)

    return {"answer": answer, "lang": lang, "sources": list(dict.fromkeys(source_labels))}
