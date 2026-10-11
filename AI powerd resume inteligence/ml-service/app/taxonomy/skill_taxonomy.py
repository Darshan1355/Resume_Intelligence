from typing import Dict, List, Optional, Tuple

class SkillTaxonomy:
    """
    Comprehensive Canonical Skill Taxonomy and Normalization Engine.
    Maps variations, aliases, and synonyms to canonical skill categories.
    """

    CATEGORIES = [
        "Programming Languages",
        "Backend",
        "Frontend",
        "Database",
        "Cloud",
        "DevOps",
        "Data Science",
        "Machine Learning",
        "Deep Learning",
        "NLP",
        "Testing",
        "Tools",
        "Frameworks"
    ]

    # Canonical Skill -> (Category, [Aliases/Synonyms/Variations])
    TAXONOMY_MAP: Dict[str, Tuple[str, List[str]]] = {
        "Java": ("Programming Languages", ["java", "core java", "java 8", "java 11", "java 17", "java 21", "j2ee"]),
        "Python": ("Programming Languages", ["python", "python3", "python 3", "py"]),
        "JavaScript": ("Programming Languages", ["javascript", "js", "ecmascript", "es6", "es2020"]),
        "TypeScript": ("Programming Languages", ["typescript", "ts"]),
        "C++": ("Programming Languages", ["c++", "cpp"]),
        "Go": ("Programming Languages", ["go", "golang"]),
        "C#": ("Programming Languages", ["c#", "csharp", ".net"]),
        "SQL": ("Database", ["sql", "transact-sql", "pl/sql", "ansi sql"]),

        "Spring Boot": ("Backend", ["spring boot", "springboot", "spring-boot", "spring framework", "spring mvc", "spring cloud"]),
        "Spring Security": ("Backend", ["spring security", "spring-security", "oauth2", "jwt"]),
        "Hibernate": ("Backend", ["hibernate", "jpa", "spring data jpa", "orm"]),
        "FastAPI": ("Backend", ["fastapi", "fast-api", "uvicorn", "pydantic"]),
        "Django": ("Backend", ["django", "django rest framework", "drf"]),
        "Flask": ("Backend", ["flask"]),
        "Node.js": ("Backend", ["node.js", "nodejs", "node"]),
        "Express.js": ("Backend", ["express", "express.js", "expressjs"]),
        "REST APIs": ("Backend", ["rest", "rest api", "rest apis", "restful", "restful api"]),
        "Microservices": ("Backend", ["microservices", "microservice architecture", "micro-services"]),
        "System Design": ("Backend", ["system design", "distributed systems", "high availability", "scalability"]),
        "Apache Kafka": ("Backend", ["kafka", "apache kafka", "event-driven", "message queue"]),
        "RabbitMQ": ("Backend", ["rabbitmq", "rabbit-mq", "amqp"]),

        "React": ("Frontend", ["react", "react.js", "reactjs", "react native"]),
        "Angular": ("Frontend", ["angular", "angularjs", "angular 2+"]),
        "Vue.js": ("Frontend", ["vue", "vue.js", "vuejs"]),
        "Next.js": ("Frontend", ["next.js", "nextjs", "next"]),
        "HTML5": ("Frontend", ["html", "html5"]),
        "CSS3": ("Frontend", ["css", "css3", "sass", "scss", "less"]),
        "Tailwind CSS": ("Frontend", ["tailwind", "tailwindcss", "tailwind css"]),
        "Bootstrap": ("Frontend", ["bootstrap", "bootstrap 5"]),
        "Redux": ("Frontend", ["redux", "redux toolkit", "rtk"]),

        "MySQL": ("Database", ["mysql", "mysql 8"]),
        "PostgreSQL": ("Database", ["postgresql", "postgres", "psql"]),
        "MongoDB": ("Database", ["mongodb", "mongo", "nosql"]),
        "Redis": ("Database", ["redis", "in-memory cache", "caching"]),
        "Elasticsearch": ("Database", ["elasticsearch", "elastic search", "elk"]),

        "Docker": ("DevOps", ["docker", "containerization", "containers", "docker-compose", "docker compose"]),
        "Kubernetes": ("DevOps", ["kubernetes", "k8s"]),
        "CI/CD": ("DevOps", ["ci/cd", "ci-cd", "continuous integration", "continuous deployment"]),
        "Jenkins": ("DevOps", ["jenkins"]),
        "GitHub Actions": ("DevOps", ["github actions", "github action", "gh actions"]),
        "Terraform": ("DevOps", ["terraform", "iac", "infrastructure as code"]),

        "AWS": ("Cloud", ["aws", "amazon web services", "ec2", "s3", "lambda", "rds"]),
        "Azure": ("Cloud", ["azure", "microsoft azure"]),
        "GCP": ("Cloud", ["gcp", "google cloud", "google cloud platform"]),

        "PyTorch": ("Deep Learning", ["pytorch", "torch"]),
        "TensorFlow": ("Deep Learning", ["tensorflow", "tf"]),
        "Keras": ("Deep Learning", ["keras"]),
        "scikit-learn": ("Machine Learning", ["scikit-learn", "sklearn", "ml"]),
        "pandas": ("Data Science", ["pandas"]),
        "NumPy": ("Data Science", ["numpy"]),
        "spaCy": ("NLP", ["spacy"]),
        "NLTK": ("NLP", ["nltk"]),
        "Transformers": ("NLP", ["transformers", "hugging face", "huggingface", "bert", "sentence-bert", "sbert", "llm"]),

        "JUnit": ("Testing", ["junit", "junit 5", "junit4"]),
        "Mockito": ("Testing", ["mockito"]),
        "PyTest": ("Testing", ["pytest"]),
        "Jest": ("Testing", ["jest"]),

        "Git": ("Tools", ["git", "github", "gitlab", "version control"]),
        "Maven": ("Tools", ["maven", "mvn"]),
        "Gradle": ("Tools", ["gradle"]),
        "Linux": ("Tools", ["linux", "unix", "bash", "shell scripting"])
    }

    # Inverted map: alias -> (canonical_name, category)
    _ALIAS_MAP: Dict[str, Tuple[str, str]] = {}

    @classmethod
    def get_alias_map(cls) -> Dict[str, Tuple[str, str]]:
        if not cls._ALIAS_MAP:
            for canonical, (category, aliases) in cls.TAXONOMY_MAP.items():
                cls._ALIAS_MAP[canonical.lower()] = (canonical, category)
                for alias in aliases:
                    cls._ALIAS_MAP[alias.lower()] = (canonical, category)
        return cls._ALIAS_MAP

    @classmethod
    def normalize_skill(cls, raw_skill: str) -> Optional[Tuple[str, str]]:
        """
        Normalize a raw skill string to (Canonical Name, Category).
        Example: 'springboot' -> ('Spring Boot', 'Backend')
        """
        if not raw_skill:
            return None
        cleaned = raw_skill.strip().lower()
        alias_map = cls.get_alias_map()
        return alias_map.get(cleaned, None)
