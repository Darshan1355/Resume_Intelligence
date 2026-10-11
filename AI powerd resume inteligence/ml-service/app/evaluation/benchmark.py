import numpy as np
from app.evaluation.eval_dataset import EVALUATION_DATASET
from app.baseline.tfidf_matcher import TfidfMatcher
from app.embeddings.transformer_service import TransformerService

def run_benchmark():
    """
    Evaluates Classical NLP (TF-IDF) vs Deep Learning (Transformer) on the labeled dataset.
    Calculates Mean Absolute Error (MAE) and Pearson correlation against ground truth.
    """
    tfidf = TfidfMatcher()
    transformer = TransformerService.get_instance()

    human_scores = []
    tfidf_scores = []
    transformer_scores = []

    print("=" * 80)
    print("CAREERMIND ML BENCHMARK: TF-IDF BASELINE VS SENTENCE-BERT TRANSFORMER")
    print("=" * 80)

    for i, item in enumerate(EVALUATION_DATASET, 1):
        h = item["human_match_score"]
        r = item["resume"]
        j = item["job_description"]

        # TF-IDF Score
        t_score = tfidf.calculate_score(r, j)

        # Transformer Score
        e_r = transformer.encode(r)
        e_j = transformer.encode(j)
        tr_sim = transformer.calculate_cosine_similarity(e_r, e_j)
        tr_score = round(tr_sim * 100.0, 1)

        human_scores.append(h)
        tfidf_scores.append(t_score)
        transformer_scores.append(tr_score)

        print(f"\n[Case {i}: {item['domain']}]")
        print(f"  Ground Truth Human Score: {h:.1f}")
        print(f"  TF-IDF Baseline Score:    {t_score:.1f} (Error: {abs(t_score - h):.1f})")
        print(f"  Transformer S-BERT Score: {tr_score:.1f} (Error: {abs(tr_score - h):.1f})")

    # Calculate MAE
    mae_tfidf = float(np.mean(np.abs(np.array(tfidf_scores) - np.array(human_scores))))
    mae_transformer = float(np.mean(np.abs(np.array(transformer_scores) - np.array(human_scores))))

    # Calculate Pearson correlation
    corr_tfidf = float(np.corrcoef(tfidf_scores, human_scores)[0, 1])
    corr_transformer = float(np.corrcoef(transformer_scores, human_scores)[0, 1])

    print("\n" + "=" * 80)
    print("EMPIRICAL EVALUATION SUMMARY")
    print("=" * 80)
    print(f"  Metric                       TF-IDF Baseline    Sentence-BERT")
    print(f"  Mean Absolute Error (MAE):   {mae_tfidf:6.2f} pts        {mae_transformer:6.2f} pts")
    print(f"  Pearson Correlation (r):     {corr_tfidf:6.3f}            {corr_transformer:6.3f}")
    print("=" * 80)

    return {
        "mae_tfidf": mae_tfidf,
        "mae_transformer": mae_transformer,
        "corr_tfidf": corr_tfidf,
        "corr_transformer": corr_transformer
    }

if __name__ == "__main__":
    run_benchmark()
