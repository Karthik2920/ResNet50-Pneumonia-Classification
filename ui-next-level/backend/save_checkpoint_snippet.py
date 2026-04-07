"""
Save-only snippet for notebook use.

Run these lines in the notebook AFTER training `model_resnet`.
This does not retrain or modify your existing training code.
"""

import os
import torch

export_path = "/Users/karthikchary/Desktop/Projects/Pnuemonia/ResNet50-Pneumonia-Classification/ui-next-level/backend/model/full_ft_resnet50.pth"
os.makedirs(os.path.dirname(export_path), exist_ok=True)
torch.save(model_resnet.state_dict(), export_path)
print(f"Checkpoint saved to: {export_path}")
