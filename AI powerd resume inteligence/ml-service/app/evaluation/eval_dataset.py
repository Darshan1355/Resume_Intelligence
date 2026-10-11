"""
Labeled ML Evaluation Benchmark Dataset.
Pairs of (Resume Text, Job Description, Human Match Ground Truth Score 0-100).
"""

EVALUATION_DATASET = [
    {
        "domain": "Java Backend Engineer",
        "resume": "Senior Java Software Engineer with 6 years of experience building scalable backend microservices using Spring Boot, Spring Security, Hibernate, MySQL, Kafka, and Docker. Led architectural redesign reducing API latency by 40%.",
        "job_description": "We are looking for a Senior Java Developer with strong expertise in Spring Boot, REST APIs, Microservices, MySQL, and Kafka. Experience in cloud deployment and Docker containerization is required.",
        "human_match_score": 95.0
    },
    {
        "domain": "Full-Stack React & Node",
        "resume": "Full Stack Developer proficient in React.js, TypeScript, Tailwind CSS, Node.js, Express, and PostgreSQL. Created modern responsive dashboards and integrated RESTful APIs with JWT authentication.",
        "job_description": "Seeking a Frontend/Fullstack Engineer skilled in React, JavaScript/TypeScript, modern CSS frameworks, and backend Node.js APIs with relational database experience.",
        "human_match_score": 92.0
    },
    {
        "domain": "Machine Learning / NLP Engineer",
        "resume": "ML/NLP Engineer experienced in PyTorch, Hugging Face Transformers, Sentence-BERT, spaCy, and scikit-learn. Implemented semantic search, named entity recognition, and document similarity pipelines with FastAPI.",
        "job_description": "Hiring an AI/NLP Specialist to design transformer-based embedding pipelines, semantic similarity algorithms, and text extraction services using PyTorch and FastAPI.",
        "human_match_score": 96.0
    },
    {
        "domain": "DevOps & Cloud Engineer",
        "resume": "DevOps Engineer with deep experience in AWS (EC2, S3, RDS, Lambda), Docker, Kubernetes, Terraform, CI/CD pipelines with GitHub Actions, and Linux infrastructure management.",
        "job_description": "Looking for a Cloud DevOps Engineer to build automated CI/CD pipelines, manage Kubernetes clusters on AWS, and maintain infrastructure as code using Terraform.",
        "human_match_score": 94.0
    },
    {
        "domain": "Cross-Domain Mismatch (Frontend applying to Data Science/NLP)",
        "resume": "Frontend UI Developer with 2 years of experience crafting user interfaces with HTML5, CSS3, Bootstrap, and basic JavaScript. Worked on marketing websites and landing pages.",
        "job_description": "Deep Learning Scientist needed for training large language models, PyTorch distributed computing, fine-tuning BERT transformers, and high-performance vector retrieval systems.",
        "human_match_score": 18.0
    },
    {
        "domain": "Cross-Domain Mismatch (Mobile Developer applying to Backend Microservices)",
        "resume": "iOS Swift Developer with 3 years building consumer mobile apps, Swift UI, CoreData, and App Store releases.",
        "job_description": "Principal Backend Architect for Java Spring Boot microservices, high-throughput distributed database sharding, and Kafka streaming pipelines.",
        "human_match_score": 25.0
    }
]
