from flask import Blueprint, jsonify, request
from . import db
from .models import Project, Experience, Skill, Certification
from .chat import ask
from .auth import require_auth

bp = Blueprint("main", __name__)


# ── Health ────────────────────────────────────────────────────────────────────

@bp.get("/api/health")
def health():
    return jsonify({"status": "ok"})


# ── Auth check ────────────────────────────────────────────────────────────────

@bp.post("/api/admin/login")
def admin_login():
    body = request.get_json(silent=True) or {}
    import os
    token = os.getenv("ADMIN_TOKEN", "")
    if body.get("token") == token and token:
        return jsonify({"ok": True})
    return jsonify({"error": "Invalid token"}), 401


# ── Projects ──────────────────────────────────────────────────────────────────

@bp.get("/api/projects")
def get_projects():
    return jsonify([p.to_dict() for p in
                    Project.query.order_by(Project.featured.desc(), Project.id).all()])

@bp.get("/api/projects/<int:pid>")
def get_project(pid):
    return jsonify(Project.query.get_or_404(pid).to_dict())

@bp.post("/api/projects")
@require_auth
def create_project():
    data = request.get_json(silent=True) or {}
    p = Project(
        title=data.get("title", ""),
        description=data.get("description"),
        tech_stack=data.get("tech_stack", []),
        url=data.get("url"),
        github_url=data.get("github_url"),
        featured=bool(data.get("featured", False)),
    )
    db.session.add(p)
    db.session.commit()
    return jsonify(p.to_dict()), 201

@bp.put("/api/projects/<int:pid>")
@require_auth
def update_project(pid):
    p = Project.query.get_or_404(pid)
    data = request.get_json(silent=True) or {}
    for field in ("title", "description", "tech_stack", "url", "github_url", "featured"):
        if field in data:
            setattr(p, field, data[field])
    db.session.commit()
    return jsonify(p.to_dict())

@bp.delete("/api/projects/<int:pid>")
@require_auth
def delete_project(pid):
    p = Project.query.get_or_404(pid)
    db.session.delete(p)
    db.session.commit()
    return jsonify({"deleted": pid})


# ── Experience ────────────────────────────────────────────────────────────────

@bp.get("/api/experience")
def get_experience():
    return jsonify([e.to_dict() for e in
                    Experience.query.order_by(Experience.start_date.desc()).all()])

@bp.get("/api/experience/<int:eid>")
def get_experience_by_id(eid):
    return jsonify(Experience.query.get_or_404(eid).to_dict())

@bp.post("/api/experience")
@require_auth
def create_experience():
    data = request.get_json(silent=True) or {}
    e = Experience(
        role=data.get("role", ""),
        company=data.get("company", ""),
        start_date=data.get("start_date", ""),
        end_date=data.get("end_date") or None,
        description=data.get("description"),
        tech_stack=data.get("tech_stack", []),
    )
    db.session.add(e)
    db.session.commit()
    return jsonify(e.to_dict()), 201

@bp.put("/api/experience/<int:eid>")
@require_auth
def update_experience(eid):
    e = Experience.query.get_or_404(eid)
    data = request.get_json(silent=True) or {}
    for field in ("role", "company", "start_date", "end_date", "description", "tech_stack"):
        if field in data:
            setattr(e, field, data[field] or None if field == "end_date" else data[field])
    db.session.commit()
    return jsonify(e.to_dict())

@bp.delete("/api/experience/<int:eid>")
@require_auth
def delete_experience(eid):
    e = Experience.query.get_or_404(eid)
    db.session.delete(e)
    db.session.commit()
    return jsonify({"deleted": eid})


# ── Skills ────────────────────────────────────────────────────────────────────

@bp.get("/api/skills")
def get_skills():
    return jsonify([s.to_dict() for s in
                    Skill.query.order_by(Skill.category, Skill.proficiency.desc()).all()])

@bp.get("/api/skills/<string:category>")
def get_skills_by_category(category):
    return jsonify([s.to_dict() for s in
                    Skill.query.filter(Skill.category.ilike(category))
                    .order_by(Skill.proficiency.desc()).all()])


@bp.get("/api/skills/graph")
def get_skills_graph():
    """Return nodes + links for the Skills Network visualisation.

    Links connect languages to the frameworks / tools that use them,
    derived from well-known relationships stored as a static map so the
    graph stays meaningful even when the DB only has flat skill rows.
    """
    skills = Skill.query.all()
    skill_map = {s.name: s for s in skills}

    # language → frameworks/tools that depend on it
    EDGES = [
        ("Python",     "Flask"),
        ("Python",     "FastAPI"),
        ("Python",     "PyTorch"),
        ("Python",     "TensorFlow"),
        ("Python",     "HuggingFace Transformers"),
        ("Dart",       "Flutter"),
        ("Java",       "Spring Boot"),
        ("TypeScript", "Next.js"),
        ("SQL",        "PostgreSQL"),
        ("Python",     "NLP"),
    ]

    # collect only nodes that exist in the DB or are referenced in edges
    node_names = set(skill_map.keys())
    for src, tgt in EDGES:
        node_names.add(src)
        node_names.add(tgt)

    PROFICIENCY_LABELS = {
        1: "Beginner", 2: "Elementary", 3: "Intermediate",
        4: "Advanced",  5: "Expert"
    }

    nodes = []
    for name in node_names:
        s = skill_map.get(name)
        prof = s.proficiency if s else 3
        cat  = s.category    if s else "Other"
        nodes.append({
            "id":          name,
            "name":        name,
            "category":    cat,
            "proficiency": prof,
            "label":       f"{PROFICIENCY_LABELS.get(prof, 'Intermediate')} {name}",
        })

    links = [
        {"source": src, "target": tgt}
        for src, tgt in EDGES
        if src in node_names and tgt in node_names
    ]

    return jsonify({"nodes": nodes, "links": links})

@bp.post("/api/skills")
@require_auth
def create_skill():
    data = request.get_json(silent=True) or {}
    s = Skill(
        name=data.get("name", ""),
        category=data.get("category"),
        proficiency=int(data.get("proficiency", 3)),
    )
    db.session.add(s)
    db.session.commit()
    return jsonify(s.to_dict()), 201

@bp.put("/api/skills/<int:sid>")
@require_auth
def update_skill(sid):
    s = Skill.query.get_or_404(sid)
    data = request.get_json(silent=True) or {}
    for field in ("name", "category", "proficiency"):
        if field in data:
            setattr(s, field, data[field])
    db.session.commit()
    return jsonify(s.to_dict())

@bp.delete("/api/skills/<int:sid>")
@require_auth
def delete_skill(sid):
    s = Skill.query.get_or_404(sid)
    db.session.delete(s)
    db.session.commit()
    return jsonify({"deleted": sid})


# ── Certifications ────────────────────────────────────────────────────────────

@bp.get("/api/certifications")
def get_certifications():
    return jsonify([c.to_dict() for c in
                    Certification.query.order_by(Certification.issued_date.desc()).all()])

@bp.post("/api/certifications")
@require_auth
def create_certification():
    data = request.get_json(silent=True) or {}
    c = Certification(
        title=data.get("title", ""),
        issuer=data.get("issuer"),
        issued_date=data.get("issued_date"),
        url=data.get("url"),
    )
    db.session.add(c)
    db.session.commit()
    return jsonify(c.to_dict()), 201

@bp.put("/api/certifications/<int:cid>")
@require_auth
def update_certification(cid):
    c = Certification.query.get_or_404(cid)
    data = request.get_json(silent=True) or {}
    for field in ("title", "issuer", "issued_date", "url"):
        if field in data:
            setattr(c, field, data[field])
    db.session.commit()
    return jsonify(c.to_dict())

@bp.delete("/api/certifications/<int:cid>")
@require_auth
def delete_certification(cid):
    c = Certification.query.get_or_404(cid)
    db.session.delete(c)
    db.session.commit()
    return jsonify({"deleted": cid})


# ── Chat ──────────────────────────────────────────────────────────────────────

@bp.post("/api/chat")
def chat():
    body     = request.get_json(silent=True) or {}
    question = (body.get("question") or "").strip()
    history  = body.get("history") or []
    if not question:
        return jsonify({"error": "question is required"}), 400
    if len(question) > 500:
        return jsonify({"error": "question too long (max 500 chars)"}), 400
    if not isinstance(history, list):
        history = []
    try:
        result = ask(question, history)
        return jsonify(result)
    except EnvironmentError as e:
        return jsonify({"error": str(e)}), 503
    except Exception as exc:
        return jsonify({"error": "Failed to get a response. Please try again."}), 500
