# Controlled Residual Depth Adaptation in ResNet50 for Pneumonia Classification

> **DTSC 5082.401 — Capstone Project | Group 5 | University of North Texas**

## Authors
| Name | Role |
|---|---|
| Karthik Saraf | Data Analysis & EDA Lead |
| Manoj Anandhan | Model Architecture & Deployment Lead |
| Fidel Gonzales | Evaluation, Statistics & Fairness Lead |
| Sowmika Yeadhara | Experimental Design & Documentation Lead |

---

## Project Overview

This project investigates how **layer-wise fine-tuning depth** in a pretrained ResNet50 architecture affects pneumonia classification performance on an imbalanced chest X-ray dataset. Rather than treating transfer learning as a fixed implementation detail, fine-tuning depth is treated as a controllable architectural variable — systematically evaluated across three ResNet50 configurations.

---

## Key Results

| Configuration | Accuracy | Precision | Recall | F1 | False Negatives |
|---|---|---|---|---|---|
| Baseline CNN | 0.85 | 0.83 | 0.96 | 0.89 | 17 |
| ResNet50 Frozen (4K params) | 0.86 | 0.95 | 0.82 | 0.88 | 71 |
| ResNet50 Partial FT (14.9M params) | 0.89 | 0.86 | 0.98 | 0.92 | 9 |
| **ResNet50 Full FT (23.5M params)** | **0.88** | **0.85** | **0.98** | **0.91** | **7** |

**Best Model: Full Fine-Tuned ResNet50**
- ROC-AUC: **0.9532**
- Decision Threshold: **0.9** (recall-optimized for clinical screening)
- Sensitivity: **0.9821** | Specificity: 0.7009
- False Negative Rate: **1.79%** (7 missed pneumonia cases in 624)

---

## Project Phases

| Phase | Focus | Key Deliverable |
|---|---|---|
| Phase 1 | Data Acquisition & Wrangling | Dataset validation, integrity checks, class distribution |
| Phase 2 | Exploratory Data Analysis | PCA embeddings, intensity analysis, resolution study |
| Phase 3 | Model Development & Optimization | 4 model configurations, Grad-CAM, threshold tuning |
| Phase 4 | Explainable AI & Deployment | LIME, fairness audit, Gradio interface, monitoring |

---

## Dataset

**Kaggle Chest X-Ray Pneumonia Dataset** (Paul Mooney, 2018)  
https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia

- **Training:** 5,216 images (NORMAL: 1,342 | PNEUMONIA: 3,876)
- **Validation:** 16 images
- **Test:** 624 images
- **Class Imbalance Ratio:** 2.89:1 (PNEUMONIA:NORMAL)
- **Source:** Pediatric patients aged 1–5, Guangzhou Women and Children's Medical Center
- **Annotations:** Two expert physicians, cross-validated by a third reviewer

---

## Tech Stack

```
Python 3.12        PyTorch 2.x         torchvision
ResNet50 (ImageNet) scikit-learn        NumPy / Pandas
Matplotlib          Seaborn             PIL
torchcam (Grad-CAM) LIME                Gradio
Google Colab        CUDA (T4 GPU)       Kaggle API
```

---

## Running the Notebook

### Prerequisites
- Google account (for Google Colab)
- Kaggle account with API credentials (`kaggle.json`)

### Steps

1. **Open notebook in Google Colab**  
   Upload `Full_Project_Group5_Phases1to4.ipynb` to Google Colab  
   *(Runtime → Change runtime type → T4 GPU recommended)*

2. **Upload Kaggle credentials**  
   In the Colab sidebar (Files tab), upload your `kaggle.json`  
   ⚠️ **Never commit `kaggle.json` to GitHub**

3. **Run the fixed install cell first**
   ```python
   !pip install -q --upgrade numpy
   !pip install -q kaggle torchcam
   !pip install -q "lime" --no-deps
   !pip install -q scikit-image gradio
   ```
   Then **Runtime → Restart session** before continuing.

4. **Run all cells top to bottom**  
   Runtime → Run all (Ctrl+F9)

5. **Expected runtime:** ~45–60 minutes on T4 GPU (includes all 4 phases, 3 model training runs, Grad-CAM, LIME, Gradio launch)

---

## Repository Structure

```
├── Full_Project_Group5_Phases1to4.ipynb   # Complete project notebook (Phases 1–4)
├── Phase4_Final_Group5.docx               # Phase 4 written report (APA 7)
├── README.md                              # This file
└── .gitignore                             # Excludes kaggle.json, checkpoints, etc.
```

---

## Model Architecture

```
ResNet50 (pretrained ImageNet)
├── Layer1 — Low-level features: edges, textures (56×56)
├── Layer2 — Mid-level features: shapes, contours (28×28)
├── Layer3 — High-level features: semantic regions (14×14)
├── Layer4 — Domain-specific features (7×7) ← fine-tuned
└── FC      — Binary classifier: [NORMAL, PNEUMONIA]

Residual learning: H(x) = F(x) + x
Total parameters:  ~25.6M
Trainable (Full FT): ~23.5M
```

---

## Training Configuration

```python
Optimizer:      Adam (lr=1e-5, weight_decay=1e-4)
Loss:           CrossEntropyLoss (class-weighted)
Batch size:     32
Epochs:         6 (full FT) / 3 (partial FT)
Gradient clip:  1.0
Threshold:      0.9 (recall-optimized)
Device:         CUDA (Google Colab T4 GPU)
```

---

## Explainability (Phase 4)

- **Grad-CAM** — Layer4 gradient-weighted activation maps; validates model attends to lung parenchyma (not artifacts)
- **LIME** — 500-perturbation superpixel analysis; green regions support PNEUMONIA prediction
- **Threshold sensitivity** — Sweep from 0.30–0.99 showing clinical rationale for threshold = 0.9
- **Fairness audit** — Sensitivity, Specificity, PPV, NPV, ECE (0.3432), demographic limitations
- **Gradio interface** — Real-time X-ray upload with prediction + risk level + Grad-CAM output

---

## Deployment

```
Production API:     POST /api/v1/predict (FastAPI + HTTPS)
Risk stratification:
  CRITICAL  — prob > 0.97  → Immediate radiologist review
  HIGH      — prob > 0.90  → Urgent review
  MODERATE  — prob > 0.60  → Follow-up recommended
  LOW       — prob ≤ 0.60  → No action

Inference latency (T4 GPU):
  Real-time: ~11.8 ms/image
  Batch/32:  ~2.9  ms/image (~310 images/sec)
```

---

## Limitations

- Dataset limited to pediatric patients (ages 1–5) at a single institution — generalizability to adult or diverse populations unvalidated
- ECE = 0.3432 indicates model overconfidence — temperature scaling recommended before probability-level reporting
- No demographic metadata available — formal subgroup fairness auditing not possible with current dataset

---

## References

- He et al. (2016). Deep Residual Learning for Image Recognition. https://arxiv.org/abs/1512.03385
- Rajpurkar et al. (2017). CheXNet: Radiologist-Level Pneumonia Detection. https://arxiv.org/abs/1711.05225
- Selvaraju et al. (2017). Grad-CAM. https://arxiv.org/abs/1610.02391
- Ribeiro et al. (2016). LIME. https://arxiv.org/abs/1602.04938
- Mooney, P. (2018). Chest X-Ray Images (Pneumonia). https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia

---

## License

This project was developed for academic purposes as part of DTSC 5082 at the University of North Texas. Dataset usage is subject to Kaggle dataset license terms.
