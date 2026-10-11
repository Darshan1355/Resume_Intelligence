import os
import json
import math
import numpy as np
from typing import Dict, List, Any
from app.baseline.tfidf_matcher import TfidfMatcher
from app.embeddings.transformer_service import TransformerService

def calculate_spearman_rho(x: List[float], y: List[float]) -> float:
    """Calculates Spearman rank correlation coefficient."""
    n = len(x)
    if n <= 1:
        return 0.0

    def get_ranks(seq):
        indexed = sorted(enumerate(seq), key=lambda item: item[1])
        ranks = [0.0] * n
        i = 0
        while i < n:
            j = i
            while j < n - 1 and indexed[j][1] == indexed[j + 1][1]:
                j += 1
            rank = (i + j + 2) / 2.0
            for k in range(i, j + 1):
                ranks[indexed[k][0]] = rank
            i = j + 1
        return ranks

    rx = get_ranks(x)
    ry = get_ranks(y)

    mean_rx = sum(rx) / n
    mean_ry = sum(ry) / n

    num = sum((rx[i] - mean_rx) * (ry[i] - mean_ry) for i in range(n))
    den_x = math.sqrt(sum((rx[i] - mean_rx) ** 2 for i in range(n)))
    den_y = math.sqrt(sum((ry[i] - mean_ry) ** 2 for i in range(n)))

    if den_x * den_y == 0:
        return 0.0
    return num / (den_x * den_y)

def calculate_classification_metrics(y_true_binary: List[int], y_pred_scores: List[float], threshold: float = 60.0) -> Dict[str, float]:
    """
    Computes Accuracy, Precision, Recall, F1 for binary match classification at threshold.
    """
    tp = fp = tn = fn = 0
    for yt, score in zip(y_true_binary, y_pred_scores):
        yp = 1 if score >= threshold else 0
        if yt == 1 and yp == 1:
            tp += 1
        elif yt == 0 and yp == 1:
            fp += 1
        elif yt == 0 and yp == 0:
            tn += 1
        elif yt == 1 and yp == 0:
            fn += 1

    total = len(y_true_binary)
    accuracy = (tp + tn) / total if total > 0 else 0.0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    return {
        "accuracy": round(accuracy * 100.0, 2),
        "precision": round(precision * 100.0, 2),
        "recall": round(recall * 100.0, 2),
        "f1": round(f1 * 100.0, 2),
        "tp": tp,
        "fp": fp,
        "tn": tn,
        "fn": fn
    }

def run_evaluation(dataset_path: str = None) -> Dict[str, Any]:
    if dataset_path is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        dataset_path = os.path.join(base_dir, "benchmark_dataset.json")

    with open(dataset_path, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    tfidf = TfidfMatcher()
    transformer = TransformerService.get_instance()

    human_scores: List[float] = []
    y_true_binary: List[int] = []
    tfidf_scores: List[float] = []
    transformer_scores: List[float] = []
    domains: List[str] = []

    print("=" * 90)
    print(f"CAREERMIND EMPIRICAL ML BENCHMARK RUNNER (N = {len(dataset)} EVALUATION PAIRS)")
    print("=" * 90)

    for item in dataset:
        h = float(item["human_match_score"])
        yt = int(item.get("ground_truth_class", 1 if h >= 60.0 else 0))
        r = item["resume"]
        j = item["job_description"]
        d = item.get("domain", "General")

        t_score = tfidf.calculate_score(r, j)

        e_r = transformer.encode(r)
        e_j = transformer.encode(j)
        tr_sim = transformer.calculate_cosine_similarity(e_r, e_j)
        tr_score = round(tr_sim * 100.0, 1)

        human_scores.append(h)
        y_true_binary.append(yt)
        tfidf_scores.append(t_score)
        transformer_scores.append(tr_score)
        domains.append(d)

    # Statistical Regression Metrics
    arr_h = np.array(human_scores)
    arr_t = np.array(tfidf_scores)
    arr_tr = np.array(transformer_scores)

    mae_tfidf = float(np.mean(np.abs(arr_t - arr_h)))
    mae_transformer = float(np.mean(np.abs(arr_tr - arr_h)))

    mse_tfidf = float(np.mean((arr_t - arr_h) ** 2))
    mse_transformer = float(np.mean((arr_tr - arr_h) ** 2))

    rmse_tfidf = float(np.sqrt(mse_tfidf))
    rmse_transformer = float(np.sqrt(mse_transformer))

    pearson_tfidf = float(np.corrcoef(arr_t, arr_h)[0, 1])
    pearson_transformer = float(np.corrcoef(arr_tr, arr_h)[0, 1])

    spearman_tfidf = calculate_spearman_rho(tfidf_scores, human_scores)
    spearman_transformer = calculate_spearman_rho(transformer_scores, human_scores)

    # Classification Metrics @ threshold = 60.0%
    cls_tfidf = calculate_classification_metrics(y_true_binary, tfidf_scores, threshold=60.0)
    cls_transformer = calculate_classification_metrics(y_true_binary, transformer_scores, threshold=60.0)

    print("\n" + "=" * 90)
    print("1. CONTINUOUS SIMILARITY & REGRESSION METRICS")
    print("=" * 90)
    print(f"  {'Metric':<35} | {'TF-IDF Baseline':<20} | {'Sentence-BERT (all-MiniLM-L6-v2)':<30}")
    print("-" * 90)
    print(f"  {'Mean Absolute Error (MAE)':<35} | {mae_tfidf:<20.2f} | {mae_transformer:<30.2f}")
    print(f"  {'Mean Squared Error (MSE)':<35} | {mse_tfidf:<20.2f} | {mse_transformer:<30.2f}")
    print(f"  {'Root Mean Squared Error (RMSE)':<35} | {rmse_tfidf:<20.2f} | {rmse_transformer:<30.2f}")
    print(f"  {'Pearson Correlation (r)':<35} | {pearson_tfidf:<20.4f} | {pearson_transformer:<30.4f}")
    print(f"  {'Spearman Rank Correlation (rho)':<35} | {spearman_tfidf:<20.4f} | {spearman_transformer:<30.4f}")

    print("\n" + "=" * 90)
    print("2. BINARY MATCH CLASSIFICATION METRICS (Threshold >= 60.0%)")
    print("=" * 90)
    print(f"  {'Metric':<35} | {'TF-IDF Baseline':<20} | {'Sentence-BERT (all-MiniLM-L6-v2)':<30}")
    print("-" * 90)
    print(f"  {'Accuracy':<35} | {cls_tfidf['accuracy']:>6.2f}%              | {cls_transformer['accuracy']:>6.2f}%")
    print(f"  {'Precision':<35} | {cls_tfidf['precision']:>6.2f}%              | {cls_transformer['precision']:>6.2f}%")
    print(f"  {'Recall':<35} | {cls_tfidf['recall']:>6.2f}%              | {cls_transformer['recall']:>6.2f}%")
    print(f"  {'F1 Score':<35} | {cls_tfidf['f1']:>6.2f}%              | {cls_transformer['f1']:>6.2f}%")
    print(f"  {'Confusion Matrix [TP/FP/TN/FN]':<35} | {cls_tfidf['tp']}/{cls_tfidf['fp']}/{cls_tfidf['tn']}/{cls_tfidf['fn']:<15} | {cls_transformer['tp']}/{cls_transformer['fp']}/{cls_transformer['tn']}/{cls_transformer['fn']:<25}")
    print("=" * 90)

    # Domain Breakdown
    unique_domains = sorted(list(set(domains)))
    print("\n" + "=" * 90)
    print("3. DOMAIN-BY-DOMAIN MAE BREAKDOWN")
    print("=" * 90)
    print(f"  {'Domain':<35} | {'Pairs':<6} | {'TF-IDF MAE':<12} | {'S-BERT MAE':<12} | {'Winner':<10}")
    print("-" * 90)
    for dom in unique_domains:
        idxs = [i for i, d in enumerate(domains) if d == dom]
        dom_h = arr_h[idxs]
        dom_t = arr_t[idxs]
        dom_tr = arr_tr[idxs]
        dom_mae_t = float(np.mean(np.abs(dom_t - dom_h)))
        dom_mae_tr = float(np.mean(np.abs(dom_tr - dom_h)))
        winner = "S-BERT" if dom_mae_tr < dom_mae_t else ("TF-IDF" if dom_mae_t < dom_mae_tr else "Tie")
        print(f"  {dom:<35} | {len(idxs):<6} | {dom_mae_t:<12.2f} | {dom_mae_tr:<12.2f} | {winner:<10}")
    print("=" * 90)

    results = {
        "num_samples": len(dataset),
        "continuous_metrics": {
            "mae_tfidf": round(mae_tfidf, 3),
            "mae_transformer": round(mae_transformer, 3),
            "mse_tfidf": round(mse_tfidf, 3),
            "mse_transformer": round(mse_transformer, 3),
            "rmse_tfidf": round(rmse_tfidf, 3),
            "rmse_transformer": round(rmse_transformer, 3),
            "pearson_tfidf": round(pearson_tfidf, 4),
            "pearson_transformer": round(pearson_transformer, 4),
            "spearman_tfidf": round(spearman_tfidf, 4),
            "spearman_transformer": round(spearman_transformer, 4)
        },
        "classification_metrics": {
            "tfidf": cls_tfidf,
            "transformer": cls_transformer
        }
    }

    # Save results to json for reproducible inspection
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "benchmark_results.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    return results

if __name__ == "__main__":
    run_evaluation()
