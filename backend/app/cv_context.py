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
            "Amir is a Software & AI Engineer with 3+ years of professional experience "
            "specialising in backend systems, REST API design, and applied AI/NLP. "
            "He has worked at NextGen Solutions (Backend Project Lead), A2SV (Flutter Developer), "
            "and iCog-Labs (AI Developer). He is fluent in English and Amharic."
        ),
        keywords=["who", "about", "introduce", "background", "summary", "engineer",
                  "experience", "Amir", "profile", "ማን", "ስለ", "መግለጫ"],
        weight=1.2,
    ),

    # ── Amharic NLP & HuggingFace fine-tuning ────────────────────────────────
    Chunk(
        content=(
            "Amir has deep expertise in Amharic NLP. At iCog-Labs he fine-tuned "
            "HuggingFace transformer models (mBERT, XLM-R) for Amharic text classification, "
            "named-entity recognition (NER), and machine translation. "
            "He reduced the Word Error Rate (WER) by 35% on an Amharic ASR benchmark by "
            "applying data augmentation and language-model rescoring. "
            "He also fine-tuned Helsinki-NLP and NLLB-200 translation models for "
            "Amharic↔English and Amharic↔French pairs, achieving BLEU score improvements "
            "of up to 12 points over baseline. "
            "His work is grounded in the Ge'ez script and the morphological complexity "
            "of Ethiopic languages."
        ),
        keywords=["amharic", "nlp", "huggingface", "fine-tune", "fine-tuning", "transformer",
                  "mbert", "xlm", "xlm-r", "ner", "named entity", "translation", "wer",
                  "word error rate", "asr", "speech", "bleu", "nllb", "helsinki",
                  "geez", "ethiopic", "language model", "አማርኛ", "ትርጉም", "ቋንቋ",
                  "classification", "bert", "multilingual"],
        weight=2.0,
    ),

    # ── Calldi project ────────────────────────────────────────────────────────
    Chunk(
        content=(
            "Calldi is an AI-powered call analytics platform Amir built at iCog-Labs. "
            "It uses speech-to-text (Whisper + custom Amharic ASR) and NLP pipelines to "
            "automatically transcribe, classify, and summarise customer service calls. "
            "The system achieved a 90% reduction in manual data-entry time for call-centre "
            "operators. It integrates a fine-tuned sentiment analysis model and an intent "
            "classifier trained on Amharic and English call transcripts. "
            "Stack: Python, FastAPI, PyTorch, Whisper, PostgreSQL, Docker."
        ),
        keywords=["calldi", "call", "analytics", "speech", "whisper", "asr", "transcribe",
                  "transcription", "sentiment", "intent", "90%", "manual entry", "reduction",
                  "customer service", "call centre", "icog", "iCog-Labs"],
        weight=2.0,
    ),

    # ── RAG & vector search ───────────────────────────────────────────────────
    Chunk(
        content=(
            "Amir has built production RAG (Retrieval-Augmented Generation) systems. "
            "He combines dense vector retrieval (FAISS, sentence-transformers) with "
            "LLM generation (DeepSeek, GPT) for context-grounded Q&A. "
            "He understands chunking strategies, embedding models (all-MiniLM, multilingual-e5), "
            "re-ranking, and prompt engineering to minimise hallucination. "
            "This very chatbot is a RAG system backed by his CV knowledge base."
        ),
        keywords=["rag", "retrieval", "augmented", "generation", "vector", "faiss",
                  "embedding", "sentence-transformer", "rerank", "hallucination",
                  "prompt", "llm", "deepseek", "gpt", "chatbot", "knowledge base",
                  "semantic search", "similarity"],
        weight=1.5,
    ),

    # ── Python ───────────────────────────────────────────────────────────────
    Chunk(
        content=(
            "Python is Amir's primary language (proficiency 5/5, Expert). "
            "He uses it daily for Flask and FastAPI backends, SQLAlchemy ORM, "
            "async programming, data pipelines, and ML/NLP research. "
            "3+ years of production Python including type annotations, packaging, "
            "pytest, and CI/CD integration."
        ),
        keywords=["python", "flask", "fastapi", "sqlalchemy", "async", "backend",
                  "language", "programming", "expert", "proficiency"],
        weight=1.0,
    ),

    # ── Dart / Flutter ───────────────────────────────────────────────────────
    Chunk(
        content=(
            "Dart (proficiency 4/5, Advanced) is Amir's mobile language, used with Flutter. "
            "At A2SV he shipped cross-platform health-tech and ed-tech apps used by 5k+ students "
            "across Africa. He contributed to open-source Flutter packages and integrated "
            "Firebase, REST APIs, and BLoC state management."
        ),
        keywords=["dart", "flutter", "mobile", "cross-platform", "a2sv", "app",
                  "bloc", "firebase", "advanced"],
        weight=1.0,
    ),

    # ── Java ─────────────────────────────────────────────────────────────────
    Chunk(
        content=(
            "Amir has working knowledge of Java (proficiency 3/5, Intermediate) from "
            "academic projects and A2SV competitive-programming. Comfortable with OOP, "
            "collections, and Spring Boot basics."
        ),
        keywords=["java", "spring", "spring boot", "oop", "algorithm", "competitive"],
        weight=0.8,
    ),

    # ── AI / ML general ──────────────────────────────────────────────────────
    Chunk(
        content=(
            "Amir's AI/ML stack: PyTorch (Advanced), TensorFlow (Intermediate), "
            "HuggingFace Transformers (Advanced), scikit-learn, NLTK, spaCy. "
            "He has experience with model fine-tuning, evaluation metrics (F1, BLEU, WER), "
            "dataset curation, and deploying models as REST APIs with FastAPI."
        ),
        keywords=["pytorch", "tensorflow", "scikit", "nltk", "spacy", "model",
                  "training", "evaluation", "f1", "bleu", "metrics", "deploy",
                  "machine learning", "ml", "ai", "deep learning"],
        weight=1.2,
    ),

    # ── Backend & infrastructure ──────────────────────────────────────────────
    Chunk(
        content=(
            "As Backend Project Lead at NextGen Solutions, Amir led 4 engineers building "
            "REST APIs for 10k+ daily active users. He migrated a monolith to microservices "
            "(40% latency reduction), set up CI/CD with GitHub Actions, and managed "
            "PostgreSQL, Redis, and AWS (EC2, S3, RDS) with Docker and docker-compose."
        ),
        keywords=["backend", "api", "rest", "microservices", "postgresql", "redis",
                  "docker", "aws", "ci/cd", "lead", "nextgen", "scalable",
                  "github actions", "ec2", "s3", "rds"],
        weight=1.0,
    ),

    # ── SkillBridge project ───────────────────────────────────────────────────
    Chunk(
        content=(
            "SkillBridge is an AI-powered job-skill matching platform Amir built at A2SV. "
            "It uses a recommendation engine to match job seekers with learning resources, "
            "with real-time progress tracking and employer dashboards. "
            "Scaled to 1,000+ active users. "
            "Stack: Flask, PostgreSQL, React, Redis, Docker."
        ),
        keywords=["skillbridge", "skill bridge", "job", "matching", "recommendation",
                  "1000", "users", "a2sv", "platform"],
        weight=1.5,
    ),

    # ── AI Virtual Tour Guide ─────────────────────────────────────────────────
    Chunk(
        content=(
            "AI-Powered Virtual Tour Guide: a conversational AI for museums and heritage sites "
            "using GPT-based NLP and computer vision for context-aware narration. "
            "Supports voice interaction and multi-language output including Amharic. "
            "Stack: FastAPI, OpenAI API, PyTorch, Flutter, Firebase."
        ),
        keywords=["tour", "guide", "museum", "heritage", "voice", "narration",
                  "computer vision", "multilingual", "amharic voice"],
        weight=1.2,
    ),

    # ── Certifications ────────────────────────────────────────────────────────
    Chunk(
        content=(
            "Certifications: AWS Certified Developer – Associate (2023), "
            "TensorFlow Developer Certificate – Google (2022), "
            "A2SV Software Engineering Programme (2023)."
        ),
        keywords=["certification", "certificate", "aws", "tensorflow", "google",
                  "a2sv", "credential", "certified"],
        weight=0.8,
    ),

    # ── Bilingual / Amharic identity ──────────────────────────────────────────
    Chunk(
        content=(
            "ሹዓይብ ሶፍትዌር እና AI ኢንጂነር ነው። በፓይዘን፣ ፍላስክ፣ ፍላተር እና NLP ልምድ አለው። "
            "በiCog-Labs የአማርኛ NLP ሞዴሎችን አሰልጥኗል። "
            "SkillBridge እና AI Virtual Tour Guide ፕሮጀክቶችን ሰርቷል። "
            "Amir is bilingual — he can discuss his technical work in both English and Amharic."
        ),
        keywords=["amharic", "አማርኛ", "ሹዓይብ", "ኢንጂነር", "bilingual",
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
