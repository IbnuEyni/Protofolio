from app import create_app, db
from app.models import Project, Experience, Skill, Certification

app = create_app()

EXPERIENCE = [
    {
        "role": "AI Agent Systems Engineer",
        "company": "10 Academy",
        "start_date": "2026-02",
        "end_date": None,
        "description": (
            "Built 9 production-grade AI agent systems in 12 weeks across evaluation, orchestration, "
            "and data engineering. Designed centralized orchestration patterns with LangGraph StateGraph "
            "fan-out/fan-in parallelism, published a 250-task domain benchmark on HuggingFace with a "
            "SimPO-trained judge, and reached 35.2% pass@1 on DataAgentBench through 3-layer context "
            "engineering — with zero fine-tuning."
        ),
        "tech_stack": ["Python", "LangGraph", "LangChain", "HuggingFace", "SimPO", "PostgreSQL", "Langfuse", "MCP"],
    },
    {
        "role": "Back-end Developer Project Lead",
        "company": "NextGen Solutions",
        "start_date": "2025-07",
        "end_date": "2026-01",
        "description": (
            "Led the backend development lifecycle from architecture to deployment for a US-based client, "
            "owning authentication, containerisation, and cloud delivery on AWS (Cognito, App Runner, ECR) "
            "with Docker."
        ),
        "tech_stack": ["Python", "AWS Cognito", "AWS App Runner", "AWS ECR", "Docker", "CI/CD"],
    },
    {
        "role": "API Integration & Automation Specialist",
        "company": "ReiSearch",
        "start_date": "2024-11",
        "end_date": "2025-06",
        "description": (
            "Built an automated CRM integration pipeline connecting GoHighLevel and Home Depot, "
            "reducing manual data entry by 90% and improving lead generation by 30%."
        ),
        "tech_stack": ["Python", "GoHighLevel", "REST APIs", "Automation", "Data Integration"],
    },
    {
        "role": "AI Developer",
        "company": "iCog-Labs",
        "start_date": "2024-03",
        "end_date": "2024-10",
        "description": (
            "Built RAG-based search engines and a Neo4j recommendation system, improving retrieval "
            "accuracy by 40%. Enhanced a wellness chatbot with conversational AI, increasing user "
            "retention by 15%."
        ),
        "tech_stack": ["Python", "RAG", "Neo4j", "LangChain", "NLP"],
    },
    {
        "role": "AI Researcher",
        "company": "Ethiopian Artificial Intelligence Institute",
        "start_date": "2023-04",
        "end_date": "2024-03",
        "description": (
            "Refined facial recognition systems (+10% accuracy) and Amharic NLP models "
            "(−12% word error rate) for conversational AI."
        ),
        "tech_stack": ["Python", "Computer Vision", "NLP", "PyTorch", "HuggingFace Transformers"],
    },
    {
        "role": "Flutter Developer",
        "company": "A2SV",
        "start_date": "2021-11",
        "end_date": "2023-04",
        "description": (
            "Architected and launched SkillBridge, an educational platform built with Flutter and Firebase "
            "that scaled to 1,000+ users with offline support and AI-powered feedback. Implemented BLoC "
            "state management and engineered a hybrid exam architecture (local vs. backend evaluation) for "
            "country-specific scoring in Ethiopia and Rwanda, cutting data response time by 60%."
        ),
        "tech_stack": ["Flutter", "Dart", "Firebase", "BLoC", "REST APIs"],
    },
]

PROJECTS = [
    # ── Featured ──────────────────────────────────────────────────────────────
    {
        "title": "Oracle Forge",
        "description": (
            "A natural-language data analytics agent evaluated on DataAgentBench (54 queries, 12 datasets, "
            "9 domains). A 3-layer knowledge injection — schema hints → domain knowledge → corrections "
            "memory — reaches 35.2% pass@1 against a 54.3% SOTA ceiling through pure context engineering, "
            "with zero fine-tuning."
        ),
        "tech_stack": ["Python", "LangGraph", "Context Engineering", "PostgreSQL", "MongoDB", "Evaluation"],
        "url": None,
        "github_url": "https://github.com/IbnuEyni/oracle-forge",
        "featured": True,
    },
    {
        "title": "Tenacious Sales Bench",
        "description": (
            "An agent evaluation benchmark of 250 tasks covering signal grounding, tone consistency, "
            "resource honesty, and workflow correctness — built from real Conversion Engine failure traces. "
            "Ships with a SimPO-trained judge model, both published on HuggingFace."
        ),
        "tech_stack": ["Python", "HuggingFace", "SimPO", "Unsloth", "Evaluation", "LLM-as-Judge"],
        "url": "https://huggingface.co/datasets/shuaibam/tenacious-bench-v0.1",
        "github_url": "https://github.com/IbnuEyni/tenacious-sales-bench",
        "featured": True,
    },
    {
        "title": "Conversion Engine",
        "description": (
            "An automated lead-generation system with a 5-signal enrichment pipeline (Crunchbase, job posts, "
            "layoffs, leadership changes, AI-maturity scoring), ICP classification, signal-grounded email "
            "composition, multi-turn conversation management, and CRM sync — driven by a centralized state "
            "machine: NEW → EMAILED → REPLIED → QUALIFIED → BOOKED."
        ),
        "tech_stack": ["Python", "LangGraph", "Multi-Agent", "HubSpot", "Resend", "Cal.com", "Langfuse"],
        "url": None,
        "github_url": "https://github.com/IbnuEyni/Conversion-Engine",
        "featured": True,
    },
    {
        "title": "Automaton Auditor",
        "description": (
            "A 7-agent \"Digital Courtroom\" for code auditing: three detective agents (AST analysis, PDF "
            "parsing, vision-based diagram reading) feed three judge personas (Prosecutor, Defense, Tech Lead), "
            "whose verdicts are combined by a deterministic synthesis layer. LangGraph fan-out/fan-in "
            "parallelism audits a repository in 45 seconds for $0.02."
        ),
        "tech_stack": ["Python", "LangGraph", "LangSmith", "Gemini", "Pydantic", "AST", "Multi-Agent"],
        "url": None,
        "github_url": "https://github.com/IbnuEyni/10Acweek2/tree/main/automatoin-auditor",
        "featured": True,
    },
    {
        "title": "The Ledger",
        "description": (
            "A CQRS / Event-Sourcing backend: a PostgreSQL event store with a cryptographic (SHA-256) audit "
            "chain, fault-tolerant projections, counterfactual what-if analysis that replays history under "
            "hypothetical conditions, and an MCP server exposing 9 tools and 6 resources — backed by 166 tests."
        ),
        "tech_stack": ["Python", "PostgreSQL", "Event Sourcing", "CQRS", "MCP", "Pydantic", "Async"],
        "url": None,
        "github_url": "https://github.com/IbnuEyni/10Acweek5",
        "featured": True,
    },
    {
        "title": "Biiftuu",
        "description": (
            "Client project: a restaurant ordering, loyalty, and reservations app. Flutter mobile client, "
            "FastAPI backend, and Next.js admin dashboard — trilingual (English, Amharic, Afan Oromo) and "
            "fully Dockerized."
        ),
        "tech_stack": ["Flutter", "FastAPI", "Next.js", "Docker", "i18n"],
        "url": None,
        "github_url": None,
        "featured": True,
    },
    # ── Non-featured ──────────────────────────────────────────────────────────
    {
        "title": "Kebena Heritage & Connect",
        "description": (
            "Client project: an offline-first cultural app built on Isar, with an AI text-to-speech backend, "
            "Cloudflare R2 media storage, and push notifications."
        ),
        "tech_stack": ["Flutter", "Isar", "FastAPI", "Text-to-Speech", "Cloudflare R2"],
        "url": None,
        "github_url": None,
        "featured": False,
    },
    {
        "title": "Brownfield Cartographer",
        "description": (
            "Maps multi-language codebases (Python, SQL, YAML) into a directed knowledge graph. PageRank "
            "surfaces architectural hubs, SCC detection finds circular dependencies, and an LLM Semanticist "
            "agent infers the business purpose of code with file-path citations — so engineers can query "
            "data lineage and the blast radius of any change."
        ),
        "tech_stack": ["Python", "NetworkX", "AST", "LangChain", "PageRank"],
        "url": None,
        "github_url": "https://github.com/IbnuEyni/10AcWeek4",
        "featured": False,
    },
    {
        "title": "Document Intelligence Refinery",
        "description": (
            "A 5-stage agentic pipeline that classifies, extracts, and indexes PDFs by complexity. "
            "Confidence-gated escalation hands hard pages to stronger tools, semantic chunking produces "
            "Logical Document Units, and every answer carries spatial provenance (document, page, bounding box)."
        ),
        "tech_stack": ["Python", "Gemini Vision", "Docling", "pdfplumber", "RAG", "Pydantic"],
        "url": None,
        "github_url": "https://github.com/IbnuEyni/10AcWeek3",
        "featured": False,
    },
    {
        "title": "Dr. Abdi Specialty Dental Clinic",
        "description": (
            "Production clinic management system with a public website and private staff portal: role-based "
            "access for doctors, reception, and admins, a multi-file medical history timeline, real-time "
            "patient search, JWT password reset, Telegram notifications, and Google Cloud Storage."
        ),
        "tech_stack": ["Django", "PostgreSQL", "Docker", "Nginx", "Google Cloud Storage", "Telegram Bot API"],
        "url": "https://drabdidentalclinic.com/",
        "github_url": None,
        "featured": False,
    },
    {
        "title": "Amharic Speech & Language Models",
        "description": (
            "Open models for low-resource Amharic: an mBERT hate-speech classifier and an Amharic–English "
            "transcriber (including a Vosk speech model), published on HuggingFace."
        ),
        "tech_stack": ["Python", "HuggingFace", "PyTorch", "NLP", "Speech-to-Text"],
        "url": "https://huggingface.co/shuaibam",
        "github_url": None,
        "featured": False,
    },
    {
        "title": "AI-Powered Multilingual Virtual Tour Guide",
        "description": (
            "A Flask web app with 360° virtual tours of Ethiopian destinations and multilingual voice "
            "interaction, combining Google Cloud APIs with a fine-tuned HuggingFace translation model."
        ),
        "tech_stack": ["Python", "Flask", "Google Cloud APIs", "HuggingFace", "Speech-to-Text"],
        "url": None,
        "github_url": "https://github.com/semirhamid/ImmersiQuest",
        "featured": False,
    },
]

SKILLS = [
    # Languages
    {"name": "Python",       "category": "Language",    "proficiency": 5},
    {"name": "TypeScript",   "category": "Language",    "proficiency": 3},
    {"name": "Dart",         "category": "Language",    "proficiency": 4},
    {"name": "SQL",          "category": "Language",    "proficiency": 4},
    # Frameworks
    {"name": "FastAPI",      "category": "Framework",   "proficiency": 5},
    {"name": "Flask",        "category": "Framework",   "proficiency": 4},
    {"name": "Django",       "category": "Framework",   "proficiency": 4},
    {"name": "Node.js",      "category": "Framework",   "proficiency": 3},
    {"name": "Next.js",      "category": "Framework",   "proficiency": 3},
    {"name": "Flutter",      "category": "Framework",   "proficiency": 4},
    # AI / Agents
    {"name": "LangGraph",                "category": "AI/ML", "proficiency": 5},
    {"name": "LangChain",                "category": "AI/ML", "proficiency": 5},
    {"name": "OpenAI API",               "category": "AI/ML", "proficiency": 5},
    {"name": "Gemini API",               "category": "AI/ML", "proficiency": 4},
    {"name": "Groq",                     "category": "AI/ML", "proficiency": 4},
    {"name": "HuggingFace Transformers", "category": "AI/ML", "proficiency": 4},
    {"name": "RAG",                      "category": "AI/ML", "proficiency": 5},
    # Data
    {"name": "PostgreSQL",   "category": "Data",        "proficiency": 5},
    {"name": "Neo4j",        "category": "Data",        "proficiency": 4},
    {"name": "MongoDB",      "category": "Data",        "proficiency": 4},
    {"name": "DynamoDB",     "category": "Data",        "proficiency": 3},
    {"name": "Pydantic",     "category": "Data",        "proficiency": 5},
    {"name": "NetworkX",     "category": "Data",        "proficiency": 4},
    # Cloud / DevOps
    {"name": "Docker",       "category": "DevOps",      "proficiency": 5},
    {"name": "AWS",          "category": "DevOps",      "proficiency": 4},
    {"name": "Git",          "category": "DevOps",      "proficiency": 5},
    {"name": "CI/CD",        "category": "DevOps",      "proficiency": 4},
    {"name": "GCP",          "category": "DevOps",      "proficiency": 3},
    # Integrations & observability
    {"name": "LangSmith",    "category": "Integrations", "proficiency": 4},
    {"name": "Langfuse",     "category": "Integrations", "proficiency": 4},
    {"name": "GoHighLevel",  "category": "Integrations", "proficiency": 5},
    {"name": "HubSpot",      "category": "Integrations", "proficiency": 4},
    {"name": "Resend",       "category": "Integrations", "proficiency": 4},
    {"name": "Cal.com",      "category": "Integrations", "proficiency": 4},
]

CERTIFICATIONS = []


def seed():
    with app.app_context():
        db.drop_all()
        db.create_all()

        db.session.bulk_insert_mappings(Experience, EXPERIENCE)
        db.session.bulk_insert_mappings(Project, PROJECTS)
        db.session.bulk_insert_mappings(Skill, SKILLS)
        if CERTIFICATIONS:
            db.session.bulk_insert_mappings(Certification, CERTIFICATIONS)
        db.session.commit()

        print(f"✓ {len(EXPERIENCE)} experience records")
        print(f"✓ {len(PROJECTS)} projects")
        print(f"✓ {len(SKILLS)} skills")
        print(f"✓ {len(CERTIFICATIONS)} certifications")


if __name__ == "__main__":
    seed()
