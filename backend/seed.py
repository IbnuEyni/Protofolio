from app import create_app, db
from app.models import Project, Experience, Skill, Certification

app = create_app()

EXPERIENCE = [
    {
        "role": "Backend Project Lead",
        "company": "NextGen Solutions",
        "start_date": "2025-06",
        "end_date": None,
        "description": (
            "Led backend architecture and development of scalable REST APIs. "
            "Managed a team of 4 engineers, drove code reviews, and established CI/CD pipelines. "
            "Migrated legacy monolith to microservices, reducing average response time by 40%."
        ),
        "tech_stack": ["Java", "Spring Boot", "PostgreSQL", "Docker", "Redis", "AWS"],
    },
    {
        "role": "Flutter Developer",
        "company": "A2SV",
        "start_date": "2024-04",
        "end_date": None,
        "description": (
            "Developed cross-platform mobile applications for social-impact projects across Africa. "
            "Collaborated with international teams to ship features for health-tech and ed-tech products "
            "used by 2k+ students. Contributed to open-source Flutter packages maintained by A2SV."
        ),
        "tech_stack": ["Flutter", "Dart", "Firebase", "REST APIs", "Git"],
    },
    {
        "role": "API Integration and Data Solutions Specialist",
        "company": "Calldi",
        "start_date": "2024-12",
        "end_date": "2025-07",
        "description": (
            "Spearheaded the integration of GoHighLevel CRM and the Home Depot website, automating property uploads. "
            "Reduced manual data entry by 90% and improved lead generation by 30%."
        ),
        "tech_stack": ["GoHighLevel CRM", "REST APIs", "Python", "Automation", "Data Integration"],
    },
    {
        "role": "AI Developer",
        "company": "iCog-Labs",
        "start_date": "2024-08",
        "end_date": "2024-12",
        "description": (
            "Built RAG-based search engines and a Neo4j recommendation system, improving information retrieval "
            "accuracy by 40%. Enhanced a wellness chatbot, increasing user retention by 15%."
        ),
        "tech_stack": ["Python", "RAG", "Neo4j", "LangChain", "NLP", "Docker"],
    },
    {
        "role": "AI Researcher",
        "company": "Ethiopian Artificial Intelligence Institute",
        "start_date": "2023-01",
        "end_date": "2024-08",
        "description": (
            "Refined facial recognition systems, improving identification accuracy by 10%. "
            "Advanced Amharic NLP models, reducing word error rate by 12% for conversational AI."
        ),
        "tech_stack": ["Python", "Computer Vision", "NLP", "PyTorch", "TensorFlow", "HuggingFace Transformers"],
    },
]

PROJECTS = [
    # ── Featured ──────────────────────────────────────────────────────────────
    {
        "title": "Brownfield Cartographer",
        "description": (
            "An automated intelligence tool that maps complex multi-language codebases (Python, SQL, YAML) "
            "into a directed knowledge graph. Uses PageRank to identify architectural hubs, SCC to detect "
            "circular dependencies, and an LLM-driven Semanticist Agent to infer business purpose of code "
            "with file-path citations — enabling engineers to query data lineage and blast radius of any change."
        ),
        "tech_stack": ["Python", "NetworkX", "AST", "LangChain", "PostgreSQL", "PageRank", "dbt", "PySpark"],
        "url": None,
        "github_url": "https://github.com/IbnuEyni/10AcWeek4",
        "featured": True,
    },
    {
        "title": "Automaton Auditor",
        "description": (
            "A production-grade parallel multi-agent system that automates code auditing via a judicial process. "
            "Three detective agents (AST analysis, PDF parsing, vision-based diagram reading) feed three judge "
            "personas (Prosecutor, Defense, Tech Lead) whose scores are deterministically synthesized by a Chief "
            "Justice layer — eliminating AI hallucination bias and generating structured markdown audit reports "
            "2.5x faster than sequential processing."
        ),
        "tech_stack": ["Python", "LangGraph", "LangSmith", "Gemini", "Pydantic", "AST", "uv", "Multi-Agent"],
        "url": None,
        "github_url": "https://github.com/IbnuEyni/10Acweek2/tree/main/automatoin-auditor",
        "featured": True,
    },
    {
        "title": "Document Intelligence Refinery",
        "description": (
            "A 5-stage agentic pipeline that eliminates enterprise dark data by classifying, extracting, and "
            "indexing PDFs based on complexity. Features confidence-gated escalation (cheap tools fail → powerful "
            "tools take over), semantic chunking into Logical Document Units, a hierarchical PageIndex for "
            "section-aware navigation, and spatial provenance on every answer (Document ID + Page + Bounding Box)."
        ),
        "tech_stack": ["Python", "Gemini Vision", "pdfplumber", "Docling", "Pydantic", "uv", "RAG", "Vector Search"],
        "url": None,
        "github_url": "https://github.com/IbnuEyni/10AcWeek3",
        "featured": True,
    },
    {
        "title": "Dr. Abdi Specialty Dental Clinic",
        "description": (
            "Production-ready clinic management system with a public-facing website and private staff portal. "
            "Features role-based access control across doctor, reception, and admin roles. Includes multi-file "
            "medical history timeline with image/video/PDF uploads, real-time patient search with AJAX pagination, "
            "JWT-based password reset, Telegram bot notifications, and automatic storage switching between local "
            "filesystem and Google Cloud Storage."
        ),
        "tech_stack": ["Django", "PostgreSQL", "Docker", "Gunicorn", "Nginx", "Google Cloud Storage", "JWT", "Telegram Bot API"],
        "url": "https://drabdidentalclinic.com/",
        "github_url": None,
        "featured": True,
    },
    # ── Non-featured ──────────────────────────────────────────────────────────
    {
        "title": "Immutable Financial Ledger",
        "description": (
            "An enterprise Event Sourcing + CQRS system that redefines financial auditability. Every state change "
            "is an immutable PostgreSQL event with SHA-256 hash chaining for tamper-evidence. Fault-tolerant "
            "ProjectionDaemons build read-optimized views, a counterfactual what-if engine replays transactions "
            "under hypothetical conditions, and an automated regulatory package generator consolidates all audit "
            "artifacts — backed by 166+ tests covering concurrency invariants."
        ),
        "tech_stack": ["Python 3.14", "PostgreSQL", "Event Sourcing", "CQRS", "Pydantic", "SHA-256", "uv", "Async"],
        "url": None,
        "github_url": "https://github.com/IbnuEyni/10Acweek5/tree/main/ledger",
        "featured": False,
    },
    {
        "title": "AI-Powered Multilingual Virtual Tour Guide",
        "description": (
            "A Python Flask web application featuring 360° virtual tours of Ethiopian destinations. "
            "Implements multilingual voice interaction by integrating Google Cloud APIs and a fine-tuned "
            "Hugging Face translation model, enabling tourists to explore heritage sites in their native language."
        ),
        "tech_stack": ["Python", "Flask", "Google Cloud APIs", "HuggingFace", "Speech-to-Text", "NLP", "360° Media"],
        "url": None,
        "github_url": "https://github.com/semirhamid/ImmersiQuest",
        "featured": False,
    },
    {
        "title": "Amharic NLP Toolkit",
        "description": (
            "Fine-tuned transformer models for Amharic text classification and named-entity recognition, "
            "targeting low-resource language understanding for one of Africa's most widely spoken languages."
        ),
        "tech_stack": ["Python", "PyTorch", "HuggingFace", "FastAPI"],
        "url": None,
        "github_url": "https://github.com/IbnuEyni/amharic-nlp",
        "featured": False,
    },
]

SKILLS = [
    # Languages
    {"name": "Python",       "category": "Language",         "proficiency": 5},
    {"name": "TypeScript",   "category": "Language",         "proficiency": 4},
    {"name": "SQL",          "category": "Language",         "proficiency": 4},
    {"name": "Dart",         "category": "Language",         "proficiency": 4},
    {"name": "Java",         "category": "Language",         "proficiency": 3},
    # Frameworks
    {"name": "Flask",        "category": "Framework",        "proficiency": 5},
    {"name": "FastAPI",      "category": "Framework",        "proficiency": 4},
    {"name": "Django",       "category": "Framework",        "proficiency": 4},
    {"name": "Next.js",      "category": "Framework",        "proficiency": 4},
    {"name": "Flutter",      "category": "Framework",        "proficiency": 4},
    {"name": "Spring Boot",  "category": "Framework",        "proficiency": 3},
    # AI / ML
    {"name": "NLP",                      "category": "AI/ML", "proficiency": 5},
    {"name": "HuggingFace Transformers", "category": "AI/ML", "proficiency": 5},
    {"name": "LangChain",                "category": "AI/ML", "proficiency": 5},
    {"name": "LangGraph",                "category": "AI/ML", "proficiency": 5},
    {"name": "PyTorch",                  "category": "AI/ML", "proficiency": 4},
    {"name": "TensorFlow",               "category": "AI/ML", "proficiency": 4},
    # Databases
    {"name": "PostgreSQL",   "category": "Database",         "proficiency": 5},
    {"name": "Redis",        "category": "Database",         "proficiency": 4},
    # DevOps / Infra
    {"name": "Docker",       "category": "DevOps",           "proficiency": 5},
    {"name": "GCP",          "category": "DevOps",           "proficiency": 4},
    {"name": "AWS",          "category": "DevOps",           "proficiency": 3},
    # Data Engineering
    {"name": "PySpark",      "category": "Data Engineering", "proficiency": 4},
    {"name": "dbt",          "category": "Data Engineering", "proficiency": 4},
    {"name": "NetworkX",     "category": "Data Engineering", "proficiency": 4},
    # Tools
    {"name": "Pydantic",     "category": "Tools",            "proficiency": 5},
]

CERTIFICATIONS = [
    {
        "title": "AWS Certified Developer – Associate",
        "issuer": "Amazon Web Services",
        "issued_date": "2023-11",
        "url": "https://aws.amazon.com/certification/",
    },
    {
        "title": "TensorFlow Developer Certificate",
        "issuer": "Google",
        "issued_date": "2022-08",
        "url": "https://www.tensorflow.org/certificate",
    }
]


def seed():
    with app.app_context():
        db.drop_all()
        db.create_all()

        db.session.bulk_insert_mappings(Experience, EXPERIENCE)
        db.session.bulk_insert_mappings(Project, PROJECTS)
        db.session.bulk_insert_mappings(Skill, SKILLS)
        db.session.bulk_insert_mappings(Certification, CERTIFICATIONS)
        db.session.commit()

        print(f"✓ {len(EXPERIENCE)} experience records")
        print(f"✓ {len(PROJECTS)} projects")
        print(f"✓ {len(SKILLS)} skills")
        print(f"✓ {len(CERTIFICATIONS)} certifications")


if __name__ == "__main__":
    seed()
