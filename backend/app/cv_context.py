"""
RAG knowledge base for the Ask-My-CV chatbot.
Each Chunk carries content + weighted keywords for BM25-style retrieval.
"""
from __future__ import annotations
import re
from dataclasses import dataclass, field
from typing import List


@dataclass
class Chunk:
    content: str
    keywords: List[str] = field(default_factory=list)
    weight: float = 1.0          # boost important chunks


CHUNKS: List[Chunk] = [

    # ── Identity ─────────────────────────────────────────────────────────────
    Chunk(
        content=(
            "Amir Ahmedin Temam is an AI Engineer based in Kigali, Rwanda, specialising in multi-agent "
            "systems, evaluation benchmarks, and production automation pipelines. He shipped 9 AI agent "
            "systems in 12 weeks, and works across LLM integration, RAG architectures, CRM automation, and "
            "centralized agent coordination. Career: AI Agent Systems Engineer at 10 Academy (02/2026–present), "
            "Back-end Developer Project Lead at NextGen Solutions (07/2025–01/2026), API Integration & "
            "Automation Specialist at ReiSearch (11/2024–06/2025), AI Developer at iCog-Labs (03/2024–10/2024), "
            "AI Researcher at the Ethiopian Artificial Intelligence Institute (04/2023–03/2024), and Flutter "
            "Developer at A2SV (11/2021–04/2023). He speaks English and Amharic. "
            "Contact: shuaibamir69@gmail.com · github.com/IbnuEyni · huggingface.co/shuaibam."
        ),
        keywords=["who", "about", "introduce", "background", "summary", "engineer", "experience",
                  "amir", "profile", "contact", "email", "career", "kigali", "ማን", "ስለ", "መግለጫ"],
        weight=1.2,
    ),

    # ── Education ─────────────────────────────────────────────────────────────
    Chunk(
        content=(
            "Education: M.S. in Artificial Intelligence, Carnegie Mellon University Africa (05/2026). "
            "B.S. in Software Engineering and Computing Technologies with an AI major, Addis Ababa "
            "University (07/2024)."
        ),
        keywords=["education", "degree", "university", "masters", "master", "msc", "m.s.", "bachelor",
                  "cmu", "carnegie", "mellon", "addis ababa", "study", "school", "graduate", "ትምህርት"],
        weight=1.5,
    ),

    # ── 10 Academy ────────────────────────────────────────────────────────────
    Chunk(
        content=(
            "At 10 Academy (AI Agent Systems Engineer, 02/2026–present, remote) Amir built 9 production-grade "
            "AI agent systems across evaluation, orchestration, and data engineering. He designed centralized "
            "orchestration patterns using LangGraph StateGraph with fan-out/fan-in parallelism, published a "
            "250-task domain-specific benchmark on HuggingFace with a SimPO-trained judge model, and achieved "
            "35.2% pass@1 on DataAgentBench through 3-layer context engineering with zero fine-tuning."
        ),
        keywords=["10 academy", "academy", "current", "now", "agent", "agents", "agentic", "langgraph",
                  "orchestration", "stategraph", "fan-out", "parallel", "9", "systems"],
        weight=1.8,
    ),

    # ── Oracle Forge ──────────────────────────────────────────────────────────
    Chunk(
        content=(
            "Oracle Forge is a natural-language data analytics agent evaluated on DataAgentBench "
            "(54 queries, 12 datasets, 9 domains). It uses 3-layer knowledge-base injection — schema hints, "
            "then domain knowledge, then a corrections memory — and reaches 35.2% pass@1 against a 54.3% SOTA "
            "ceiling purely through context engineering, without fine-tuning. Repo: github.com/IbnuEyni/oracle-forge."
        ),
        keywords=["oracle", "forge", "dataagentbench", "pass@1", "35.2", "analytics", "text-to-sql",
                  "sql", "context engineering", "natural language", "data agent", "benchmark"],
        weight=2.0,
    ),

    # ── Tenacious Sales Bench ─────────────────────────────────────────────────
    Chunk(
        content=(
            "Tenacious Sales Bench is an agent evaluation benchmark of 250 tasks covering signal grounding, "
            "tone consistency, resource honesty, and workflow correctness, built from real Conversion Engine "
            "failure traces. Amir trained a judge model with SimPO and published both the dataset "
            "(shuaibam/tenacious-bench-v0.1) and the judge models on HuggingFace."
        ),
        keywords=["tenacious", "bench", "benchmark", "evaluation", "eval", "simpo", "judge", "250",
                  "huggingface", "dataset", "preference", "llm-as-judge"],
        weight=2.0,
    ),

    # ── Conversion Engine ─────────────────────────────────────────────────────
    Chunk(
        content=(
            "Conversion Engine is an automated lead-generation system. A 5-signal enrichment pipeline "
            "(Crunchbase, job posts, layoffs, leadership changes, AI-maturity scoring) feeds ICP "
            "classification, signal-grounded email composition, multi-turn conversation management, and CRM "
            "sync. A centralized state machine moves each lead NEW → EMAILED → REPLIED → QUALIFIED → BOOKED. "
            "Integrations include HubSpot, Resend, Cal.com, and Langfuse."
        ),
        keywords=["conversion", "engine", "lead", "leads", "sales", "outreach", "email", "icp",
                  "enrichment", "crunchbase", "state machine", "crm", "hubspot", "cal.com", "resend"],
        weight=2.0,
    ),

    # ── Automaton Auditor ─────────────────────────────────────────────────────
    Chunk(
        content=(
            "Automaton Auditor is a 7-agent 'Digital Courtroom' for code auditing: 3 detective agents "
            "(AST analysis, PDF parsing, vision-based diagram reading), 3 judge personas (Prosecutor, Defense, "
            "Tech Lead), and a deterministic synthesis layer. Using LangGraph fan-out/fan-in parallelism it "
            "audits a repository in 45 seconds for about $0.02."
        ),
        keywords=["automaton", "auditor", "audit", "courtroom", "judge", "detective", "code review",
                  "multi-agent", "45 seconds", "cost", "gemini"],
        weight=2.0,
    ),

    # ── The Ledger ────────────────────────────────────────────────────────────
    Chunk(
        content=(
            "The Ledger is a CQRS / Event-Sourcing backend: a PostgreSQL event store with a cryptographic "
            "audit chain, an MCP server exposing 9 tools and 6 resources, counterfactual what-if analysis, "
            "and 166 tests."
        ),
        keywords=["ledger", "cqrs", "event sourcing", "event store", "mcp", "audit chain", "financial",
                  "counterfactual", "postgresql", "tests"],
        weight=1.8,
    ),

    # ── Client projects ───────────────────────────────────────────────────────
    Chunk(
        content=(
            "Client projects (Flutter + FastAPI): Biiftuu is a restaurant ordering, loyalty, and reservations "
            "app with a Flutter client, FastAPI backend, and Next.js admin — trilingual (English, Amharic, "
            "Afan Oromo) and Dockerized. Kebena Heritage & Connect is an offline-first cultural app (Isar) with "
            "an AI text-to-speech backend, Cloudflare R2 storage, and push notifications. He also built the "
            "Dr. Abdi Specialty Dental Clinic management system (Django, PostgreSQL, Google Cloud Storage)."
        ),
        keywords=["client", "freelance", "biiftuu", "restaurant", "kebena", "heritage", "flutter",
                  "fastapi", "mobile", "app", "dental", "clinic", "oromo", "trilingual", "offline"],
        weight=1.6,
    ),

    # ── Backend / NextGen ─────────────────────────────────────────────────────
    Chunk(
        content=(
            "As Back-end Developer Project Lead at NextGen Solutions (Dallas, remote, 07/2025–01/2026) Amir led "
            "the backend lifecycle from architecture to deployment using AWS Cognito, App Runner, ECR, and "
            "Docker. His backend stack: Python (advanced), FastAPI, Flask, Django, Node.js; PostgreSQL, Neo4j, "
            "MongoDB, DynamoDB; CI/CD and Git."
        ),
        keywords=["backend", "nextgen", "lead", "aws", "cognito", "app runner", "ecr", "docker", "api",
                  "fastapi", "flask", "django", "node", "cloud", "deployment"],
        weight=1.2,
    ),

    # ── ReiSearch / CRM automation ────────────────────────────────────────────
    Chunk(
        content=(
            "At ReiSearch (API Integration & Automation Specialist, Wyoming, remote, 11/2024–06/2025) Amir "
            "built an automated CRM integration pipeline connecting GoHighLevel and Home Depot. It reduced "
            "manual data entry by 90% and improved lead generation by 30%."
        ),
        keywords=["reisearch", "gohighlevel", "home depot", "crm", "integration", "automation", "90%",
                  "manual entry", "lead generation", "30%", "pipeline"],
        weight=1.8,
    ),

    # ── iCog-Labs / RAG ───────────────────────────────────────────────────────
    Chunk(
        content=(
            "At iCog-Labs (AI Developer, Addis Ababa, 03/2024–10/2024) Amir built RAG-based search engines and "
            "a Neo4j recommendation system, improving retrieval accuracy by 40%, and enhanced a wellness "
            "chatbot with conversational AI, increasing user retention by 15%. He works with RAG, LangChain, "
            "OpenAI, Gemini, and Groq APIs."
        ),
        keywords=["icog", "icog-labs", "rag", "retrieval", "search", "neo4j", "recommendation",
                  "chatbot", "wellness", "40%", "retention", "vector", "llm"],
        weight=1.6,
    ),

    # ── EAII / Amharic NLP ────────────────────────────────────────────────────
    Chunk(
        content=(
            "At the Ethiopian Artificial Intelligence Institute (AI Researcher, 04/2023–03/2024) Amir refined "
            "facial recognition systems (+10% accuracy) and Amharic NLP models (12% lower word error rate) for "
            "conversational AI. On HuggingFace (shuaibam) he has published an Amharic hate-speech detection "
            "model (mBERT) and an Amharic–English transcriber including a Vosk speech model."
        ),
        keywords=["amharic", "nlp", "eaii", "institute", "research", "researcher", "facial", "face",
                  "recognition", "wer", "word error rate", "speech", "asr", "mbert", "vosk", "አማርኛ", "ቋንቋ"],
        weight=1.8,
    ),

    # ── A2SV / SkillBridge ────────────────────────────────────────────────────
    Chunk(
        content=(
            "At A2SV (Flutter Developer, 11/2021–04/2023) Amir architected and launched SkillBridge, an "
            "educational platform built with Flutter and Firebase that scaled to 1,000+ users with offline "
            "support and AI-powered feedback. He used BLoC state management and engineered a hybrid exam "
            "architecture (local vs. backend evaluation) for country-specific scoring in Ethiopia and Rwanda, "
            "cutting data response time by 60%."
        ),
        keywords=["a2sv", "skillbridge", "skill bridge", "flutter", "dart", "mobile", "bloc", "firebase",
                  "exam", "education", "1000", "users", "60%", "offline"],
        weight=1.6,
    ),

    # ── Skills ────────────────────────────────────────────────────────────────
    Chunk(
        content=(
            "Skills — AI/Agents: LangChain, LangGraph, OpenAI API, Gemini API, Groq, HuggingFace Transformers. "
            "Patterns: multi-agent orchestration, RAG, CQRS/Event Sourcing, context engineering, evaluation "
            "design. Backend: Python (advanced), FastAPI, Flask, Django, Node.js. Data: PostgreSQL, Neo4j, "
            "MongoDB, DynamoDB, NetworkX, Pydantic. Cloud/DevOps: AWS (Cognito, App Runner, ECR), Docker, Git, "
            "CI/CD. Integrations: GoHighLevel, HubSpot, Resend, Cal.com, Langfuse, LangSmith."
        ),
        keywords=["skills", "stack", "tech", "technologies", "tools", "python", "languages", "frameworks",
                  "patterns", "know", "proficient", "expertise"],
        weight=1.2,
    ),

    # ── Bilingual / Amharic identity ──────────────────────────────────────────
    Chunk(
        content=(
            "አሚር (ሹዓይብ) በኪጋሊ የሚገኝ የAI ኢንጂነር ነው። በመልቲ-ኤጀንት ሲስተሞች፣ በግምገማ ቤንችማርኮች እና በአውቶሜሽን ላይ ይሰራል። "
            "በ10 Academy በ12 ሳምንታት 9 የAI ኤጀንት ሲስተሞችን ገንብቷል። "
            "ከካርኔጊ ሜሎን ዩኒቨርሲቲ አፍሪካ በAI ማስተርስ ዲግሪ አለው። "
            "Amir is bilingual — he can discuss his technical work in both English and Amharic."
        ),
        keywords=["amharic", "አማርኛ", "ሹዓይብ", "አሚር", "ኢንጂነር", "bilingual",
                  "ethiopian", "ethiopia", "ኢትዮጵያ", "geez"],
        weight=1.5,
    ),
]


# ── Retriever ─────────────────────────────────────────────────────────────────

def _tokenise(text: str) -> List[str]:
    """Lowercase unigrams + bigrams."""
    words = re.findall(r"[\w']+", text.lower())
    bigrams = [f"{words[i]} {words[i+1]}" for i in range(len(words) - 1)]
    return words + bigrams


def retrieve(question: str, top_k: int = 4) -> List[str]:
    """
    Weighted keyword-overlap retrieval.
    Scores each chunk by (matching_keywords / total_keywords) * chunk.weight,
    always prepends the identity chunk, deduplicates.
    """
    tokens = set(_tokenise(question))
    scored = []
    for chunk in CHUNKS:
        hits = sum(1 for kw in chunk.keywords if kw in tokens or kw in question.lower())
        score = (hits / max(len(chunk.keywords), 1)) * chunk.weight
        scored.append((score, chunk.content))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = [text for _, text in scored[:top_k]]

    # always include identity
    identity = CHUNKS[0].content
    if identity not in top:
        top.append(identity)

    return top


def detect_language(text: str) -> str:
    """Heuristic: if >15% of chars are Ethiopic unicode block → Amharic."""
    ethiopic = sum(1 for c in text if "\u1200" <= c <= "\u137f")
    return "am" if ethiopic / max(len(text), 1) > 0.15 else "en"
