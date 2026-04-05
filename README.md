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

Test-set metrics below match the comparison table in [`Phase_4_XAI_MD_RFS.ipynb`](Phase_4_XAI_MD_RFS.ipynb). Precision, recall, and F1 are reported for the **PNEUMONIA** (positive) class.

| Configuration | Accuracy | Precision (P) | Recall (P) | F1 (P) | False Negatives |
|---|---|---|---|---|---|
| CNN (Baseline, ~6.4M params) | 0.83 | 0.81 | 0.96 | 0.88 | 15 |
| ResNet50 Frozen (~4K params) | 0.86 | 0.94 | 0.83 | 0.88 | 66 |
| **ResNet50 Partial FT (~14.9M params)** | **0.92** | **0.90** | **0.97** | **0.94** | 10 |
| ResNet50 Full FT (~23.5M params) | 0.91 | 0.88 | 0.99 | 0.93 | **5** |

**Takeaway:** Partial fine-tuning reaches the **highest accuracy** (0.92) and **strongest F1** (0.94) on this split. Full fine-tuning at decision threshold **0.9** minimizes **missed pneumonia** (5 false negatives) and is used for the Phase 4 screening-style analysis and deployment demo.

**Full Fine-Tuned ResNet50 (threshold = 0.9, test set)**
- ROC-AUC: **0.9634**
- Sensitivity (pneumonia recall): **0.9872**
- Specificity (normal recall): **0.7735**
- PPV: **0.8790** | NPV: **0.9731**
- Missed pneumonia: **5** of 390 positive test cases (~**1.28%** of pneumonia cases)

---

## Project Phases

| Phase | Focus | Key Deliverable |
|---|---|---|
| Phase 1 | Data Acquisition & Wrangling | Dataset validation, integrity checks, class distribution |
| Phase 2 | Exploratory Data Analysis | PCA embeddings, intensity analysis, resolution study |
| Phase 3 | Model Development & Optimization | Four models, metric comparison table, confusion matrices + ROC per model, validation vs test generalization check, Grad-CAM, threshold = 0.9 for ResNet evaluations |
| Phase 4 | Explainable AI & Deployment | Grad-CAM, LIME, global ROC/probability plots, threshold sweep, calibration (ECE), clinical metrics, **Gradio** demo, report **`Phase4_XAI_MD_Final_RFS_Group5.docx`** |

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
   Upload [`Phase_4_XAI_MD_RFS.ipynb`](Phase_4_XAI_MD_RFS.ipynb) to Google Colab (complete Phases 1–4).  
   *(Runtime → Change runtime type → T4 GPU recommended)*

2. **Upload Kaggle credentials**  
   In the Colab sidebar (Files tab), upload your `kaggle.json`  
   ⚠️ **Never commit `kaggle.json` to GitHub**

3. **Run the install cells at the start of the notebook** (order matters; the notebook pins or upgrades NumPy first to satisfy LIME / OpenCV / SHAP, then installs the rest):
   ```python
   !pip install -q "numpy>=2.0.0"
   !pip install -q kaggle torchcam
   !pip install -q "lime" --no-deps
   !pip install -q scikit-image
   ```
   If Colab warns about NumPy version conflicts, use **Runtime → Restart session** (the notebook may also include a hard-restart cell) before continuing.

4. **Gradio** is installed in the Phase 4 section (`!pip install -q gradio`) before the demo cell. You can install it earlier with `!pip install -q gradio` if you prefer one block up front.

5. **Run all cells top to bottom**  
   Runtime → Run all (Ctrl+F9)

6. **Expected runtime:** ~45–60 minutes on T4 GPU (includes all 4 phases, model training runs, Grad-CAM, LIME, Gradio launch)

---

## Repository Structure

```
├── Phase_4_XAI_MD_RFS.ipynb              # Complete project notebook (Phases 1–4) — primary; Gradio UI here
├── Phase_4_XAI_Deployment_RFS.ipynb      # Alternate Colab export (full pipeline; fewer cells)
├── Phase4_XAI_MD_Final_RFS_Group5.docx   # Phase 4 final report (XAI, fairness, Gradio) — Group 5
├── Phase4_v4.docx                        # Earlier Phase 4 draft (optional)
├── README.md
└── .gitignore
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

- **Grad-CAM** — Layer4 gradient-weighted maps; sanity-check that high-attribution regions align with lung fields
- **LIME** — Superpixel perturbations highlighting regions that push the prediction toward PNEUMONIA
- **Global behavior** — Side-by-side predicted-probability histograms by true class and ROC curve (reports ROC-AUC **0.9634** for the full fine-tuned model)
- **Threshold sensitivity** — Precision, recall, and F1 vs threshold (e.g. recall **0.9872** at **0.9**; best F1 near **0.93** at a slightly lower threshold)
- **Calibration** — Reliability diagram, calibration gap shading, Expected Calibration Error **ECE = 0.3421**
- **Clinical metrics panel** — Bar chart for sensitivity, specificity, PPV, NPV, and balanced accuracy; written fairness discussion (dataset has no demographics for subgroup testing)
- **Gradio** — Implemented in the notebook; see the next section and **`Phase4_XAI_MD_Final_RFS_Group5.docx`**.

---

## Gradio deployment (Phase 4)

The notebook implements a **`gr.Blocks`** app (title *Pneumonia Detection — Group 5*) wired to the **full fine-tuned ResNet50** at threshold **0.9**:

- **`gr.Image`** (PIL) for chest X-ray upload  
- **`gr.Label`** for class probabilities / confidence  
- **`gr.Textbox`** for **risk level** (same clinical bands as in the notebook)  
- **`gr.Image`** for **Grad-CAM** overlay on the uploaded study  
- **`demo.launch(share=True)`** — exposes a temporary public URL (typical for **Google Colab** demos; link lifetime follows [Gradio](https://www.gradio.app/) sharing rules — use **`gradio deploy`** or **Hugging Face Spaces** for durable hosting)

Rationale, screenshots, and deployment notes are in the Phase 4 report: [**`Phase4_XAI_MD_Final_RFS_Group5.docx`**](Phase4_XAI_MD_Final_RFS_Group5.docx).

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
- ECE ≈ **0.34** indicates poor probability calibration — temperature scaling or similar post-hoc calibration is recommended before treating scores as literal risk
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
