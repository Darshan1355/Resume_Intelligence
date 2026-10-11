# Dataset Card — CareerMind Evaluation Benchmark & Skill Taxonomy

## 1. Dataset Overview

| Attribute | Details |
| :--- | :--- |
| **Dataset Name** | `CareerMind-Eval-60` (Resume-Job Description Semantic Benchmark) |
| **Dataset File** | [`ml-service/evaluation/benchmark_dataset.json`](file:///c:/Users/Aditya/Desktop/project2/AI%20powerd%20resume%20inteligence/ml-service/evaluation/benchmark_dataset.json) |
| **Total Sample Pairs** | **60 annotated Resume-JD pairs** |
| **Primary Task** | Semantic Textual Similarity (STS) & Binary Job-Fit Classification |
| **Ground Truth Format** | Continuous Score ($[0.0, 100.0]$) and Binary Class ($1 = \text{Qualified } (\ge 60\%), 0 = \text{Unqualified } (< 60\%)$) |
| **Language** | English |
| **PII Content** | **Zero / Fully Anonymized & Synthetic** |

---

## 2. Domain Distribution & Stratification

The benchmark comprises 60 carefully curated pairs across 10 major software engineering and cross-domain sectors:

| Domain | Pair Count | Representation Scenarios |
| :--- | :---: | :--- |
| **Java / Spring Boot Backend** | 5 | Senior exact match, Junior-to-Lead gap, Jakarta EE transfer, Kafka gap |
| **Python / FastAPI / Django** | 5 | Asynchronous FastAPI match, Django-to-FastAPI transfer, Automation-to-Backend gap |
| **Frontend Development (React/Vue/Angular)** | 5 | Senior React match, Angular/Vue to React framework transfer, Web design to SPA gap |
| **Full-Stack Development** | 5 | React + Node.js MERN, Spring Boot + React, Backend-heavy and Frontend-heavy mixes |
| **Machine Learning, DL & NLP** | 5 | NLP transformer specialist, Computer Vision to NLP gap, Tabular ML, Data Analyst gap |
| **DevOps, SRE & Cloud** | 5 | AWS Kubernetes match, Azure-to-AWS transfer, Sysadmin to SRE gap, DevSecOps |
| **Database & Data Engineering** | 5 | Spark/Kafka Data Engineer, MySQL/Postgres DBA, Relational to NoSQL distributed gap |
| **QA & Test Automation (SDET)** | 5 | Java Selenium SDET, Python PyTest automation, Manual-to-Automation gap, Cypress/Jest |
| **Cybersecurity, Systems & Mobile** | 10 | AppSec OWASP, SOC-to-AppSec gap, Android Kotlin, Flutter, Modern C++ Systems, TPM |
| **Cross-Domain Negative Controls (Mismatches)** | 10 | Sales, Nurse, Chef, Graphic Designer, Accountant, Civil Engineer, Hardware Tech |

---

## 3. Ground Truth Annotation Methodology

The benchmark ground truth was annotated following standardized human recruiting evaluation rubrics:

```
┌─────────────────┬─────────────────────────────────────────────────────────────┐
│ Score Band      │ Human Evaluation Rubric                                     │
├─────────────────┼─────────────────────────────────────────────────────────────┤
│ 85.0 – 100.0 pts│ Exact / Strong Match: Core tech stack, seniority, and       │
│                 │ architectural requirements completely satisfied.            │
├─────────────────┼─────────────────────────────────────────────────────────────┤
│ 60.0 – 84.0 pts │ Transferable Match: Strong adjacent skills (e.g. Django     │
│                 │ to FastAPI, AWS to Azure) with solid architectural baseline.│
├─────────────────┼─────────────────────────────────────────────────────────────┤
│ 30.0 – 59.0 pts │ Low / Partial Match: Significant seniority gap, missing     │
│                 │ core frameworks, or sub-domain mismatch (e.g. CV to NLP).   │
├─────────────────┼─────────────────────────────────────────────────────────────┤
│  0.0 – 29.0 pts │ Cross-Domain Mismatch: Unrelated profession or completely   │
│                 │ non-transferable domain (Negative Control baseline).        │
└─────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 4. Canonical Skill Taxonomy Dataset

CareerMind incorporates a curated technical ontology located at [`ml-service/app/taxonomy/skill_taxonomy.py`](file:///c:/Users/Aditya/Desktop/project2/AI%20powerd%20resume%20inteligence/ml-service/app/taxonomy/skill_taxonomy.py):

- **61 Canonical Technical Skills** mapped across **12 Categories**:
  1. *Programming Languages* (Java, Python, JavaScript, TypeScript, C++, Go, C#)
  2. *Backend* (Spring Boot, Spring Security, Hibernate, FastAPI, Django, Flask, Node.js, Express.js, REST APIs, Microservices, System Design, Apache Kafka, RabbitMQ)
  3. *Frontend* (React, Angular, Vue.js, Next.js, HTML5, CSS3, Tailwind CSS, Bootstrap, Redux)
  4. *Database* (SQL, MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch)
  5. *DevOps* (Docker, Kubernetes, CI/CD, Jenkins, GitHub Actions, Terraform)
  6. *Cloud* (AWS, Azure, GCP)
  7. *Deep Learning* (PyTorch, TensorFlow, Keras)
  8. *Machine Learning* (scikit-learn)
  9. *Data Science* (pandas, NumPy)
  10. *NLP* (spaCy, NLTK, Transformers)
  11. *Testing* (JUnit, Mockito, PyTest, Jest)
  12. *Tools* (Git, Maven, Gradle, Linux)
- **180+ Inverted Aliases** handling case variations, versions, abbreviations, and informal spellings.

---

## 5. Dataset Intended Usage & Reproducibility

- **Intended Purpose**: Evaluation and benchmarking of semantic resume parsers, keyword vs dense embedding comparison, ATS explainability testing.
- **Reproducibility**: The evaluation dataset is entirely deterministic, version-controlled in the repository, and runnable in any standard Python environment without external network calls.
