# Model Card — CareerMind NLP & Deep Learning Engines

## 1. Model Overview

CareerMind employs a dual-tier NLP architecture combining a classical bag-of-words baseline (**TF-IDF + N-Gram Cosine Similarity**) and a deep pretrained dense bi-encoder (**Sentence-BERT: `all-MiniLM-L6-v2`**) to quantify semantic alignment between candidate resumes, job specifications, and technical interview responses.

---

## 2. Deep Learning Model Specification (`all-MiniLM-L6-v2`)

| Parameter | Specification |
| :--- | :--- |
| **Model Identifier** | `sentence-transformers/all-MiniLM-L6-v2` |
| **Base Architecture** | MiniLM-L6-H384-uncased (6-layer distilled BERT architecture) |
| **Model Type** | Dense Sentence Embedding Bi-Encoder |
| **Parameter Count** | **22.7 Million parameters** (22,713,216 weights) |
| **Embedding Dimension** | **384 dimensions** (dense float32 vectors) |
| **Hidden Layers / Transformer Blocks** | 6 layers |
| **Attention Heads** | 12 heads |
| **Vocabulary Size** | 30,522 WordPiece tokens |
| **Max Sequence Length** | **256 tokens** (longer texts are cleanly chunked/truncated) |
| **Pooling Strategy** | Mean Pooling over output token representations with attention masking |
| **Vector Normalization** | Unit L2 Normalization ($\|v\|_2 = 1.0$) |
| **Distance Metric** | Cosine Similarity: $\text{sim}(u, v) = \frac{u \cdot v}{\|u\|_2 \|v\|_2} = u \cdot v$ |
| **Deployment Mode** | **Pretrained Inference Only** (Loaded via `sentence-transformers>=2.3.0` / `torch>=2.1.0`) |
| **Fine-Tuning on Local Data** | **None** (Zero local gradient updates / zero local fine-tuning) |

---

## 3. Classical Baseline Model Specification (TF-IDF)

| Parameter | Specification |
| :--- | :--- |
| **Implementation** | `sklearn.feature_extraction.text.TfidfVectorizer` |
| **Vocabulary Bounds** | `max_features=5000` |
| **N-gram Range** | `(1, 2)` (Unigrams and Bigrams) |
| **Stopwords Removal** | English standard stopword corpus |
| **Sublinear TF Scaling** | `sublinear_tf=True` ($1 + \log(\text{tf})$ dampening term frequency dominance) |
| **Vector Representation** | Sparse vector in vocabulary space $\mathbb{R}^{5000}$ |
| **Distance Metric** | Cosine Similarity between sparse document vectors |

---

## 4. Entity Extraction & Skill Taxonomy Engine

| Component | Specification |
| :--- | :--- |
| **Taxonomy Scope** | **61 canonical skills** across **12 technical domains** |
| **Alias & Variant Coverage** | 180+ keyword aliases, synonyms, and framework aliases (e.g. `k8s` $\to$ `Kubernetes`, `react.js` $\to$ `React`) |
| **Matching Technique** | Regex word-boundary multi-token prioritized matching with context snippet extraction |
| **Skill Gap Categorization** | `MATCHED` (1.0 weight), `PARTIAL` (0.7 weight via skill affinity map), `MISSING` (0.0 weight) |

---

## 5. Interview Answer Evaluation Engine

| Dimension | Evaluation Mechanism | Weight |
| :--- | :--- | :--- |
| **Semantic Relevance** | Cosine similarity between candidate answer and ideal benchmark/question embedding | 40% |
| **Concept Coverage** | Exact & synonym containment of mandatory architectural and technical concepts | 40% |
| **Completeness** | Token length and technical term density heuristic normalized to target explanation depth | 20% |
| **Composite Score** | Weighted sum: $0.40 \cdot \text{Relevance} + 0.40 \cdot \text{Concepts} + 0.20 \cdot \text{Completeness}$ | 100% |

> **Audit Note on Interview Evaluation:** The interview grader measures *semantic closeness and conceptual coverage*, not definitive mathematical or runtime correctness. It is designed as an automated screening and preparation tool.

---

## 6. Training Data & Pretraining Transparency

1. **Pretraining Corpus**: `all-MiniLM-L6-v2` was pretrained by Sentence-Transformers / Hugging Face researchers on over **1 Billion sentence pairs** spanning 32+ large-scale datasets including MS-MARCO, SNLI, MNLI, Quora Question Pairs, Reddit comments, StackExchange, and WikiAnswers.
2. **Local Fine-Tuning**: **No custom weights or domain fine-tuning was performed in this project.** The system leverages zero-shot dense semantic inference of the pretrained model.

---

## 7. Model Limitations & Ethical Considerations

1. **Length Truncation**: Inputs exceeding 256 WordPiece tokens are truncated. CareerMind handles this by pre-processing resumes into structured sections (Experience, Skills, Education).
2. **Keyword Gaming Resistance**: While TF-IDF is vulnerable to keyword stuffing, the Sentence-BERT bi-encoder resists simple keyword repetition by evaluating contextual semantic geometry.
3. **No Factual Verification**: The model does not verify if claims on a resume are true in reality; it assesses relevance against the job description.
