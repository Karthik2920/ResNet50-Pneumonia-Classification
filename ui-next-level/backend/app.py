from io import BytesIO
import os

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
import torch.nn as nn
from torchvision import models, transforms


THRESHOLD = float(os.getenv("PNEUMONIA_THRESHOLD", "0.9"))
CHECKPOINT_PATH = os.getenv("MODEL_CHECKPOINT", "backend/model/full_ft_resnet50.pth")

app = FastAPI(title="Pneumonia Inference API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = None
model_error = None


def build_model() -> nn.Module:
    net = models.resnet50(weights=None)
    in_features = net.fc.in_features
    net.fc = nn.Linear(in_features, 2)
    return net


def load_model_once() -> None:
    global model, model_error
    try:
        os.makedirs(os.path.dirname(CHECKPOINT_PATH), exist_ok=True)
        if not os.path.exists(CHECKPOINT_PATH):
            raise FileNotFoundError(f"Checkpoint not found: {CHECKPOINT_PATH}")
        net = build_model()
        state = torch.load(CHECKPOINT_PATH, map_location=device)
        if isinstance(state, dict) and "state_dict" in state:
            state = state["state_dict"]
        net.load_state_dict(state, strict=False)
        net.to(device)
        net.eval()
        model = net
        model_error = None
    except Exception as exc:
        model = None
        model_error = str(exc)


transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)

load_model_once()


@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "device": str(device),
        "model_loaded": model is not None,
        "checkpoint_path": CHECKPOINT_PATH,
        "threshold": THRESHOLD,
        "error": model_error,
    }


@app.post("/reload-model")
def reload_model() -> dict:
    load_model_once()
    return {
        "reloaded": model is not None,
        "checkpoint_path": CHECKPOINT_PATH,
        "error": model_error,
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> dict:
    if model is None:
        raise HTTPException(
            status_code=503,
            detail=(
                f"Model is not loaded. {model_error or 'Unknown model load error.'} "
                "Save checkpoint, then call POST /reload-model once."
            ),
        )

    try:
        raw = await file.read()
        image = Image.open(BytesIO(raw)).convert("RGB")
        x = transform(image).unsqueeze(0).to(device)
        with torch.no_grad():
            logits = model(x)
            probs = torch.softmax(logits, dim=1)[0]
        pneumonia_prob = float(probs[1].item())
        normal_prob = float(probs[0].item())
        prediction = "PNEUMONIA" if pneumonia_prob > THRESHOLD else "NORMAL"
        return {
            "prediction": prediction,
            "pneumonia_probability": pneumonia_prob,
            "normal_probability": normal_prob,
            "threshold": THRESHOLD,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Inference failed: {exc}") from exc
