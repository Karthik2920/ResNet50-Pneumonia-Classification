import random
from pathlib import Path

import streamlit as st
from PIL import Image


st.set_page_config(
    page_title="Pneumonia AI Command Center",
    page_icon="🫁",
    layout="wide",
    initial_sidebar_state="collapsed",
)

st.markdown(
    """
    <style>
    .stApp {
        background: radial-gradient(circle at 20% 20%, #1e293b 0%, #0f172a 35%, #020617 100%);
        color: #e2e8f0;
    }
    .block-container {
        max-width: 1400px;
        padding-top: 1.5rem;
        padding-bottom: 2rem;
    }
    .hero {
        background: linear-gradient(90deg, rgba(14,165,233,0.25), rgba(99,102,241,0.25));
        border: 1px solid rgba(148,163,184,0.25);
        border-radius: 20px;
        padding: 1.25rem 1.5rem;
        margin-bottom: 1rem;
        backdrop-filter: blur(8px);
    }
    .hero h1 {
        margin: 0;
        color: #f8fafc;
        font-size: 2rem;
        letter-spacing: 0.2px;
    }
    .hero p {
        margin: 0.4rem 0 0 0;
        color: #cbd5e1;
    }
    .panel {
        border: 1px solid rgba(148,163,184,0.25);
        background: rgba(15, 23, 42, 0.65);
        border-radius: 16px;
        padding: 1rem;
        min-height: 170px;
    }
    .risk-chip {
        display: inline-block;
        margin-top: 0.25rem;
        padding: 0.35rem 0.65rem;
        border-radius: 999px;
        font-weight: 600;
        font-size: 0.9rem;
    }
    .risk-low { background: rgba(34,197,94,0.22); color: #bbf7d0; }
    .risk-mod { background: rgba(234,179,8,0.22); color: #fde68a; }
    .risk-high { background: rgba(249,115,22,0.22); color: #fed7aa; }
    .risk-crit { background: rgba(239,68,68,0.22); color: #fecaca; }
    .stMetric {
        background: rgba(30,41,59,0.45);
        border: 1px solid rgba(148,163,184,0.18);
        padding: 0.6rem;
        border-radius: 12px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    """
    <div class="hero">
        <h1>🫁 Pneumonia AI Command Center</h1>
        <p>Full-screen clinical triage UI (no Gradio). Upload CXR, review confidence, and inspect explainability panels.</p>
    </div>
    """,
    unsafe_allow_html=True,
)


def risk_band(p):
    if p > 0.97:
        return "CRITICAL", "risk-crit", "Immediate radiologist review"
    if p > 0.90:
        return "HIGH", "risk-high", "Urgent review recommended"
    if p > 0.60:
        return "MODERATE", "risk-mod", "Follow-up recommended"
    return "LOW", "risk-low", "Routine monitoring"


left, right = st.columns([1.05, 1.35], gap="large")
with left:
    st.markdown('<div class="panel">', unsafe_allow_html=True)
    uploaded = st.file_uploader(
        "Upload Chest X-ray (PNG/JPG/JPEG)",
        type=["png", "jpg", "jpeg"],
        help="Your original notebook remains unchanged. This is a new, standalone UI.",
    )
    st.markdown("</div>", unsafe_allow_html=True)

    st.markdown('<div class="panel">', unsafe_allow_html=True)
    model_note = "Model mode: demo UI (connect your trained checkpoint later)."
    st.caption(model_note)
    threshold = st.slider("Decision threshold", 0.50, 0.99, 0.90, 0.01)
    st.markdown("</div>", unsafe_allow_html=True)

with right:
    tab1, tab2, tab3 = st.tabs(["Image + Prediction", "Clinical Panel", "Explainability"])

    with tab1:
        col_img, col_pred = st.columns([1.1, 1], gap="large")
        with col_img:
            st.markdown('<div class="panel">', unsafe_allow_html=True)
            if uploaded:
                img = Image.open(uploaded).convert("RGB")
                st.image(img, use_container_width=True)
            else:
                st.info("Upload an X-ray to preview.")
            st.markdown("</div>", unsafe_allow_html=True)

        with col_pred:
            st.markdown('<div class="panel">', unsafe_allow_html=True)
            if uploaded:
                # Demo probability to keep UI runnable without modifying notebook/training pipeline.
                p_pneumonia = round(random.uniform(0.62, 0.99), 4)
                p_normal = round(1 - p_pneumonia, 4)
                band, css_class, guidance = risk_band(p_pneumonia)
                pred = "PNEUMONIA" if p_pneumonia >= threshold else "NORMAL"

                st.metric("Predicted Label", pred)
                c1, c2 = st.columns(2)
                with c1:
                    st.metric("Pneumonia", f"{p_pneumonia:.2%}")
                with c2:
                    st.metric("Normal", f"{p_normal:.2%}")

                st.markdown(
                    f'<span class="risk-chip {css_class}">Risk: {band}</span>',
                    unsafe_allow_html=True,
                )
                st.write(guidance)
            else:
                st.warning("Prediction panel is ready. Upload an image to run.")
            st.markdown("</div>", unsafe_allow_html=True)

    with tab2:
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Sensitivity", "98.7%")
        c2.metric("Specificity", "77.3%")
        c3.metric("PPV", "87.9%")
        c4.metric("NPV", "97.3%")
        st.caption("Values shown from your reported full fine-tuned model metrics.")

    with tab3:
        st.markdown('<div class="panel">', unsafe_allow_html=True)
        st.write("Grad-CAM / LIME output area")
        st.info("Connect your notebook Grad-CAM function here to display overlays in this panel.")
        st.markdown("</div>", unsafe_allow_html=True)

st.divider()
st.caption(
    "Built as a separate file (`app_streamlit.py`) so your existing notebook/code is not overwritten."
)

