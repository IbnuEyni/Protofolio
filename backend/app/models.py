from . import db


class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    tech_stack = db.Column(db.ARRAY(db.String))
    url = db.Column(db.String(255))
    github_url = db.Column(db.String(255))
    featured = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "tech_stack": self.tech_stack or [],
            "url": self.url,
            "github_url": self.github_url,
            "featured": self.featured,
        }


class Experience(db.Model):
    __tablename__ = "experience"

    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120), nullable=False)
    start_date = db.Column(db.String(20), nullable=False)
    end_date = db.Column(db.String(20))          # None = present
    description = db.Column(db.Text)
    tech_stack = db.Column(db.ARRAY(db.String))

    def to_dict(self):
        return {
            "id": self.id,
            "role": self.role,
            "company": self.company,
            "start_date": self.start_date,
            "end_date": self.end_date or "Present",
            "description": self.description,
            "tech_stack": self.tech_stack or [],
        }


class Skill(db.Model):
    __tablename__ = "skills"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    category = db.Column(db.String(80))          # e.g. "Language", "Framework", "AI/ML"
    proficiency = db.Column(db.Integer)          # 1–5

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "proficiency": self.proficiency,
        }


class Certification(db.Model):
    __tablename__ = "certifications"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(180), nullable=False)
    issuer = db.Column(db.String(120))
    issued_date = db.Column(db.String(20))
    url = db.Column(db.String(255))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "issuer": self.issuer,
            "issued_date": self.issued_date,
            "url": self.url,
        }
