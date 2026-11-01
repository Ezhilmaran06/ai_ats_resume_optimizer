# Model Training & Evaluation Guide

## Architecture: Multi-Layer Perceptron (MLP)

The sign classifier is a Multi-Layer Perceptron neural network trained on normalized 63-element landmark coordinates.

### Layer Architecture

```text
Input Features (63 Dimensions)
      ↓
Dense Layer (128 units, ReLU activation)
      ↓
Dense Layer (64 units, ReLU activation)
      ↓
Output Layer (K classes, Softmax probabilities)
```

- **Optimizer**: Adam (learning rate = 0.001)
- **Regularization**: L2 penalty $\alpha = 0.0001$
- **Early Stopping**: Monitored on validation loss (patience = 20 epochs)
- **Batch Size**: 32

---

## Step-by-Step Training Pipeline

### 1. Execute Training
```bash
cd backend
python training/train_model.py --layers 128 64 --epochs 500 --lr 0.001
```

The script:
1. Loads `dataset/processed/gestures.csv`.
2. Validates feature dimensions (63 values per row, no NaNs or Inf).
3. Splits into **70% Train**, **10% Validation**, and **20% Test** with stratification.
4. Fits the MLP neural network.
5. Computes Accuracy, Weighted Precision, Recall, F1-Score, and Confusion Matrix.
6. Serializes artifacts to:
   - `backend/models/sign_mlp_model.pkl` (Model weights)
   - `backend/models/label_map.json` (Label mapping)
   - `backend/models/training_metrics.json` (Evaluation results)
   - `backend/dataset/processed/test_split.pkl` (Held-out test split)

### 2. Standalone Model Evaluation
To evaluate the saved model on the held-out test split:

```bash
cd backend
python training/evaluate_model.py
```

Outputs detailed per-class classification metrics and the full confusion matrix.

### 3. Model Export & Compatibility Verification
Verify that the model can be loaded by FastAPI and produce valid probability distributions:

```bash
cd backend
python training/export_model.py
```

---

## Evaluation Benchmark

On the benchmark evaluation set (160 held-out test samples across 8 classes):
- **Accuracy**: 100.00%
- **Weighted Precision**: 100.00%
- **Weighted Recall**: 100.00%
- **Weighted F1-Score**: 100.00%
- **Inference Latency**: < 5ms per frame on CPU

