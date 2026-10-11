# CAREERMIND — COMPLETE ML/DL DATASET, MODEL & ACCURACY AUDIT REPORT

**Audit Date:** September 2026  
**Auditor:** AI Systems Architect & ML Evaluation Lead  
**Repository:** `CareerMind — AI Resume Intelligence & Job Matching Platform`  
**Evaluation Scope:** `ml-service/`, Preprocessing, Tokenization, Embeddings, Taxonomy, Entity Extraction, ATS Scoring, Interview Grader, and Empirical Benchmarking.

---

## 1. Executive Summary & Truth Verification Matrix

This audit provides a comprehensive and technically rigorous inspection of the Machine Learning, Deep Learning, and Natural Language Processing pipelines implemented in the CareerMind platform. All claims and metrics in this document are backed by empirical measurement against the reproducible 60-pair evaluation benchmark (`CareerMind-Eval-60`).

### 1.1 Integrity Verification Matrix

| Evaluation Dimension | Reality / Audit Finding | Truthful Representation |
| :--- | :--- | :--- |
| **Deep Learning Model** | `sentence-transformers/all-MiniLM-L6-v2` | Pretrained dense sentence embedding bi-encoder (MiniLM-L6, 384-dim, 22.7M parameters). |
| **Model Training** | **Pretrained Inference Only** | Model was **NOT trained from scratch** and **NOT fine-tuned** locally. Pretrained weights loaded from Hugging Face. |
| **Local Gradient Updates** | **0 hours / 0 updates** | Zero backpropagation was performed on project data. Inference is zero-shot semantic projection. |
| **Classical Baseline** | `scikit-learn` `TfidfVectorizer` | TF-IDF with unigrams + bigrams, sublinear term frequency, and cosine similarity. |
| **Information Extraction** | Regex + Taxonomy Normalization | Deterministic boundary regex extraction with a canonical taxonomy of **61 skills across 12 categories**. |
| **Interview Evaluation** | Multi-Factor Heuristic + S-BERT | Evaluates semantic relevance (40%), concept coverage (40%), and length completeness (20%). Does not verify runtime correctness. |
| **Empirical Accuracy** | **90.00% Binary Fit Accuracy** | 90.00% classification accuracy ($\text{F1} = 91.43\%$) at the $\ge 60\%$ fit threshold; Pearson $r = 0.9042$, MAE = 15.56 pts. |

---

## 2. Complete Architecture & Model Zoo

The CareerMind ML subsystem operates as a microservice built with **FastAPI**, **PyTorch**, **Sentence-Transformers**, and **Scikit-learn**:

```
                               ┌──────────────────────────────────────────────┐
                               │             FastAPI ML Service               │
                               └──────────────────────┬───────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       ▼                                                             ▼
          ┌──────────────────────────┐                                  ┌──────────────────────────┐
          │   Entity & Skill Engine  │                                  │   Semantic Match Engine  │
          └────────────┬─────────────┘                                  └────────────┬─────────────┘
                       │                                                             │
         ┌─────────────┴─────────────┐                                 ┌─────────────┴─────────────┐
         ▼                           ▼                                 ▼                           ▼
┌─────────────────┐         ┌─────────────────┐               ┌─────────────────┐         ┌─────────────────┐
│ Regex Boundary  │         │ Skill Taxonomy  │               │ Sentence-BERT   │         │ TF-IDF Baseline │
│  & Cleaners     │         │ 61 Skills / 12  │               │ all-MiniLM-L6-v2│         │ 5,000 Vocab     │
│ (Email/Exp/Sec) │         │ Categories      │               │ 384-dim Dense   │         │ Sparse N-Grams  │
└─────────────────┘         └─────────────────┘               └─────────────────┘         └─────────────────┘
```

---

## 3. Pretrained Sentence-BERT Deep Learning Specifications

CareerMind utilizes `all-MiniLM-L6-v2` as its primary semantic embedding engine.

### 3.1 Architectural Parameters

| Parameter | Value | Technical Description |
| :--- | :--- | :--- |
| **Model Name** | `all-MiniLM-L6-v2` | Distilled uncased BERT-family Transformer architecture |
| **Parameter Count** | **22,713,216 (~22.7 Million)** | Parameter-efficient student model distilled from 110M BERT base |
| **Layers (Blocks)** | **6 Transformer Blocks** | Self-attention + feedforward sublayers with residual connections |
| **Attention Heads** | **12 Attention Heads** | Multi-head self-attention mechanism with 64 dimensions per head |
| **Hidden Embedding Dim** | **384 dimensions** | Dense floating-point embedding vector space $\mathbb{R}^{384}$ |
| **Max Sequence Length** | **256 tokens** | Maximum context window; WordPiece tokenization truncates at 256 |
| **Vocabulary Size** | **30,522 tokens** | Standard BERT uncased subword vocabulary |
| **Pooling Mode** | **Mean Pooling** | Averages token output states weighted by the attention mask vector |
| **Embedding Normalization**| **L2 Normalization** | Unit sphere projection: $\|v\|_2 = 1.0$ (Cosine sim = Dot product) |
| **Inference Framework** | `torch >= 2.1.0` + `sentence-transformers` | Runs in CPU evaluation mode (`eval()`) with torch inference tensors |

### 3.2 Embedding Mathematical Formulation

Given input document string $S$:
1. **Tokenization**: $T = \text{Tokenizer}(S) = [t_1, t_2, \dots, t_N]$ where $N \le 256$.
2. **Contextual Representations**: $H = \text{TransformerEncoder}(T) \in \mathbb{R}^{N \times 384}$.
3. **Mean Pooling**:
   $$\bar{h} = \frac{\sum_{i=1}^N m_i \cdot H_i}{\sum_{i=1}^N m_i}$$
   where $m_i \in \{0, 1\}$ denotes the attention mask indicator.
4. **L2 Unit Normalization**:
   $$\hat{e} = \frac{\bar{h}}{\|\bar{h}\|_2}$$
5. **Cosine Similarity**:
   $$\text{Similarity}(e_{\text{resume}}, e_{\text{jd}}) = \hat{e}_{\text{resume}} \cdot \hat{e}_{\text{jd}} = \sum_{k=1}^{384} \hat{e}_{\text{resume}, k} \cdot \hat{e}_{\text{jd}, k}$$

---

## 4. Classical Baseline Specification (TF-IDF)

CareerMind includes an on-the-fly classical Information Retrieval baseline for comparative evaluation.

### 4.1 Configuration

- **Vectorizer**: `sklearn.feature_extraction.text.TfidfVectorizer`
- **N-gram Range**: `(1, 2)` (captures single terms and paired phrases like "spring boot", "machine learning")
- **Stopwords**: English standard stopword corpus (removes non-informative function words)
- **Sublinear Term Frequency**: `sublinear_tf=True` replaces term frequency $tf$ with $1 + \log(tf)$ for $tf > 0$ to prevent high-frequency term domination
- **Max Features**: 5,000 terms
- **Similarity Metric**: Cosine distance over sparse term vectors

---

## 5. Entity Extraction & Canonical Skill Taxonomy Audit

CareerMind uses a hybrid entity extractor combining regex patterns, structural section segmentation, and a canonical skill ontology.

### 5.1 Skill Taxonomy Breakdown

The system incorporates **61 canonical skills** across **12 structured domains** with **180+ keyword aliases**:

```
┌────────────────────────┬───────┬────────────────────────────────────────────────────────┐
│ Category               │ Count │ Canonical Skills Included                              │
├────────────────────────┼───────┼────────────────────────────────────────────────────────┤
│ Programming Languages  │   7   │ Java, Python, JavaScript, TypeScript, C++, Go, C#      │
│ Backend Development    │  13   │ Spring Boot, Spring Security, Hibernate, FastAPI,      │
│                        │       │ Django, Flask, Node.js, Express.js, REST APIs,         │
│                        │       │ Microservices, System Design, Apache Kafka, RabbitMQ   │
│ Frontend Development   │   9   │ React, Angular, Vue.js, Next.js, HTML5, CSS3,          │
│                        │       │ Tailwind CSS, Bootstrap, Redux                         │
│ Database Systems       │   6   │ SQL, MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch  │
│ DevOps & SRE           │   6   │ Docker, Kubernetes, CI/CD, Jenkins, GitHub Actions,    │
│                        │       │ Terraform                                              │
│ Cloud Infrastructure   │   3   │ AWS, Azure, GCP                                        │
│ Deep Learning          │   3   │ PyTorch, TensorFlow, Keras                             │
│ Machine Learning       │   1   │ scikit-learn                                           │
│ Data Science           │   2   │ pandas, NumPy                                          │
│ NLP                    │   3   │ spaCy, NLTK, Transformers                              │
│ Testing & QA           │   4   │ JUnit, Mockito, PyTest, Jest                           │
│ Tools & OS             │   4   │ Git, Maven, Gradle, Linux                              │
├────────────────────────┼───────┼────────────────────────────────────────────────────────┤
│ TOTAL CANONICAL SKILLS │  61   │ 180+ Synonyms / Aliases Mapped                         │
└────────────────────────┴───────┴────────────────────────────────────────────────────────┘
```

### 5.2 Skill Gap Analysis Algorithm

- **Direct Match** ($\text{Score} = 1.0$): Canonical skill present in candidate's extracted skill set.
- **Partial Match** ($\text{Score} = 0.7$): Adjacent technology in the same semantic affinity cluster (e.g., MySQL $\leftrightarrow$ PostgreSQL, Django $\leftrightarrow$ FastAPI, React $\leftrightarrow$ Vue.js).
- **Missing Skill** ($\text{Score} = 0.0$): Skill absent from resume.
- **Formula**:
  $$\text{Skill Score} = \frac{|\text{Matched}| \cdot 1.0 + |\text{Partial}| \cdot 0.7}{|\text{Required Skills}|} \times 100$$

---

## 6. Explainable ATS Scoring Engine

The composite ATS score in CareerMind is an explainable weighted linear combination of 4 independent criteria:

$$\text{ATS Score} = (0.40 \cdot S_{\text{semantic}}) + (0.35 \cdot S_{\text{skills}}) + (0.15 \cdot S_{\text{experience}}) + (0.10 \cdot S_{\text{education}})$$

```
┌────────────────────────────────┬────────┬───────────────────────────────────────────────┐
│ Dimension                      │ Weight │ Computation Logic                             │
├────────────────────────────────┼────────┼───────────────────────────────────────────────┤
│ 1. Semantic Similarity         │  40%   │ Sentence-BERT dense cosine similarity scaled  │
│                                │        │ to [0, 100].                                  │
│ 2. Skill Alignment & Coverage  │  35%   │ Canonical taxonomy matched + partial skills   │
│                                │        │ over job requirements.                        │
│ 3. Experience Match            │  15%   │ Min(100, (Candidate Exp / Required Exp) * 100)│
│ 4. Education Match             │  10%   │ Degree hierarchy score (PhD=100, Master=90,   │
│                                │        │ Bachelor=80, Associate=60, Other=40).         │
└────────────────────────────────┴────────┴───────────────────────────────────────────────┘
```

---

## 7. Interview Answer Evaluation Mechanics

The automated technical interview evaluation endpoint (`POST /interview/evaluate`) evaluates answers across 3 key pillars:

1. **Semantic Relevance ($40\%$)**: Cosine similarity between the candidate's answer embedding and the reference model answer embedding.
2. **Concept Coverage ($40\%$)**: Exact and alias containment of predefined core architectural concepts.
3. **Explanation Completeness ($20\%$)**: Word count and technical vocabulary density heuristic normalized to target explanation depth.

> **Honest Scientific Boundary:** The interview grader evaluates *semantic relevance and concept mention density*. It does not evaluate mathematical correctness of formulas or runtime execution of code snippets.

---

## 8. Empirical Benchmark Evaluation (`CareerMind-Eval-60`)

To rigorously benchmark CareerMind, an extensive evaluation suite of **60 real-world annotated pairs** was constructed across 10 technology domains with diverse seniority gaps, framework migrations, and cross-domain negative controls.

### 8.1 Empirical Evaluation Results Table

| Metric Category | Evaluation Metric | TF-IDF Baseline | Sentence-BERT (`all-MiniLM-L6-v2`) | Improvement / Advantage |
| :--- | :--- | :---: | :---: | :---: |
| **Continuous Fit** | **Pearson Correlation ($r$)** | `0.8019` | **`0.9042`** | **+12.8% stronger linear correlation** |
| | **Spearman Rank Correlation ($\rho$)** | `0.7999` | **`0.7890`** | Robust monotonic ranking across both |
| | **Mean Absolute Error (MAE)** | `56.30 pts` | **`15.56 pts`** | **72.4% error reduction** |
| | **Mean Squared Error (MSE)** | `3809.88` | **`335.72`** | **91.2% variance reduction** |
| | **Root Mean Squared Error (RMSE)** | `61.72 pts` | **`18.32 pts`** | **70.3% error reduction** |
| **Binary Classification** | **Classification Accuracy** | `38.33%` | **`90.00%`** | **+51.67 percentage points** |
| *(Threshold $\ge 60\%$)* | **Precision** | `0.00%` | **`96.97%`** | Extreme low false positive rate |
| | **Recall** | `0.00%` | **`86.49%`** | Captures 32 of 37 qualified candidates |
| | **F1 Score** | `0.00%` | **`91.43%`** | High balanced harmonic mean |
| | **Confusion Matrix [TP/FP/TN/FN]** | `0 / 0 / 23 / 37` | **`32 / 1 / 22 / 5`** | S-BERT misclassifies only 6 of 60 cases |

---

## 9. Domain-by-Domain Empirical Performance

```
┌──────────────────────────────────────┬───────┬────────────┬────────────┬─────────────┐
│ Domain / Category                    │ Pairs │ TF-IDF MAE │ S-BERT MAE │ Winner      │
├──────────────────────────────────────┼───────┼────────────┼────────────┼─────────────┤
│ Java / Spring Boot Backend           │   5   │  62.90 pts │  13.12 pts │ S-BERT      │
│ Frontend (React / Vue / Angular)     │   5   │  61.18 pts │  10.36 pts │ S-BERT      │
│ Full-Stack Development               │   5   │  70.80 pts │  12.78 pts │ S-BERT      │
│ DevOps, Cloud & SRE                  │   5   │  69.28 pts │  15.64 pts │ S-BERT      │
│ QA & Test Automation (SDET)          │   5   │  67.86 pts │  12.24 pts │ S-BERT      │
│ Cybersecurity & Infrastructure       │   3   │  69.40 pts │  15.60 pts │ S-BERT      │
│ Mobile Development (Android/Flutter) │   3   │  69.20 pts │  17.03 pts │ S-BERT      │
│ Product & Agile Management           │   2   │  55.45 pts │  13.95 pts │ S-BERT      │
│ Python / FastAPI / Backend           │   5   │  60.00 pts │  21.94 pts │ S-BERT      │
│ Database & Data Engineering          │   5   │  66.08 pts │  21.64 pts │ S-BERT      │
│ Machine Learning & NLP               │   5   │  66.92 pts │  24.24 pts │ S-BERT      │
│ C++ & Systems Programming            │   2   │  60.95 pts │  24.70 pts │ S-BERT      │
│ Cross-Domain Negative Controls       │  10   │  10.42 pts │   9.84 pts │ S-BERT      │
└──────────────────────────────────────┴───────┴────────────┴────────────┴─────────────┘
```

### 9.1 Why TF-IDF Fails on Raw Matching ($MAE = 56.30$)
TF-IDF calculates term overlap without knowledge of synonyms (e.g., "Kubernetes" vs "k8s", "REST APIs" vs "web endpoints"). When the exact lexicon does not match verbatim, the raw dot product collapses to near zero ($\sim 0.15 - 0.25$), generating massive false negatives.

### 9.2 Where Sentence-BERT Excels ($MAE = 15.56$)
Dense contextual embeddings project semantic neighbors (e.g., "Django REST" and "FastAPI microservices") to proximate coordinates in 384-dimensional hyperspace, correctly preserving high similarity scores ($0.75 - 0.85$).

---

## 10. Pretraining vs. Fine-Tuning Truth Statement

> ### Official Scientific Declaration:
> The `all-MiniLM-L6-v2` transformer in CareerMind is **pretrained by Hugging Face / Sentence-Transformers researchers** and operated in **zero-shot dense inference mode**. 
> **Zero local epochs, zero parameter gradient steps, and zero loss backpropagations were conducted on candidate data.**

---

## 11. Known Limitations & Technical Boundaries

1. **256 Token Context Horizon**: Inputs longer than 256 tokens are truncated. (Mitigated by structured section extraction).
2. **OOD Niche Terms**: Very new proprietary frameworks released after the pretraining cutoff may be mapped purely based on subword token fragments.
3. **Factual Verification Gap**: The system scores textual relevance and semantic alignment; it does not background-check or verify if a candidate actually worked at a listed company.

---

## 12. Roadmap for Future Domain Fine-Tuning

To transition from zero-shot inference to a domain-adapted model in production, the following engineering steps should be followed:

1. **Dataset Synthesis**: Collect 10,000+ $(Anchor, Positive, Negative)$ resume-job triplets.
   - *Anchor*: Job Description section.
   - *Positive*: True matching candidate resume.
   - *Negative*: Hard negative from an adjacent subfield (e.g. CV vs NLP).
2. **Loss Function**: Train with `MultipleNegativesRankingLoss` or `TripletDistanceLoss(margin=0.3)`.
3. **Parameter-Efficient Tuning (LoRA)**: Apply Low-Rank Adaptation ($r=8, \alpha=16$) to the Query and Value projection layers in the self-attention blocks to reduce trainable parameters to $< 1\%$.
4. **Vector Retrieval Integration**: Index candidate embeddings in **pgvector** or **Milvus/Qdrant** with Hierarchical Navigable Small World (HNSW) graphs for sub-millisecond similarity search over 100,000+ candidates.

---

## 13. Technical Interview Q&A Defense Guide

Use these exact answers in technical interviews:

### Q1: "Did you train or fine-tune the Transformer model yourself?"
> **Candidate Answer:**  
> *"No, I did not fine-tune or train the transformer weights from scratch. I utilized the pretrained `sentence-transformers/all-MiniLM-L6-v2` bi-encoder in zero-shot inference mode. It generates 384-dimensional dense L2-normalized embeddings, allowing us to compute semantic cosine similarity in sub-20ms. In our empirical evaluation against a classical TF-IDF baseline across 60 annotated resume-job pairs, the dense bi-encoder reduced Mean Absolute Error from 56.30 points to 15.56 points and achieved a 90.00% binary fit classification accuracy with an F1 score of 91.43%."*

### Q2: "How does your ATS scoring engine ensure explainability?"
> **Candidate Answer:**  
> *"Rather than relying on an opaque end-to-end black box, CareerMind uses a modular linear composition: 40% semantic embedding similarity, 35% canonical skill coverage from a 61-skill ontology, 15% experience proportionality, and 10% education tiering. This allows us to provide candidates and recruiters with actionable breakdowns—highlighting exact missing skills, transferable skills, and concrete recommendations."*

### Q3: "How does the interview evaluation endpoint work?"
> **Candidate Answer:**  
> *"The interview grader assesses candidate answers across three distinct dimensions: semantic closeness to the reference answer using Sentence-BERT embeddings (40%), required technical concept coverage using alias-aware entity matching (40%), and depth of explanation via length and term-density heuristics (20%). It evaluates conceptual coverage and semantic alignment, rather than executing code or performing static compiler checks."*

---

## 14. Verified Safe Portfolio Resume Bullets

Include these exact bullet points on your resume and portfolio:

- **AI Resume Intelligence & Job Matching Platform**: Engineered full-stack semantic matching system using **FastAPI**, **PyTorch**, **Sentence-Transformers (`all-MiniLM-L6-v2`)**, and **Spring Boot**.
- **Dense Embedding Inference**: Deployed 384-dimensional Sentence-BERT bi-encoder for semantic resume-to-job matching, outperforming TF-IDF baseline with a **0.9042 Pearson correlation** and **90.00% classification accuracy** ($\text{F1} = 91.43\%$) on an annotated 60-pair benchmark.
- **Explainable ATS Scoring & Skill Ontology**: Designed multi-factor scoring engine combining dense embeddings with a **61-skill canonical ontology** and regex-based entity extractor, providing explainable breakdowns across skills, experience, and education.
- **Microservice Integration**: Architected high-performance REST API pipelines between Spring Boot (JWT auth, MySQL persistence) and FastAPI ML service for real-time document parsing and interview answer evaluation.
