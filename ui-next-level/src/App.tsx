import { Activity, Brain, FolderKanban, Settings, ShieldCheck, Sparkles, UploadCloud, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { NavLink, Route, Routes } from "react-router-dom";
import { useState, type ChangeEvent } from "react";

const metrics = [
  { label: "Sensitivity", value: "98.7%" },
  { label: "Specificity", value: "77.3%" },
  { label: "PPV", value: "87.9%" },
  { label: "NPV", value: "97.3%" },
];

const navItems = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/cases", label: "Cases", icon: FolderKanban },
  { to: "/insights", label: "Insights", icon: Brain },
  { to: "/settings", label: "Settings", icon: Settings },
];

function DashboardPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    prediction: string;
    pneumonia_probability: number;
    normal_probability: number;
  } | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setSubmitted(false);
    setError(null);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await fetch("http://localhost:8000/predict", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Prediction request failed");
      setResult(data);
      setSubmitted(true);
    } catch (e) {
      setSubmitted(false);
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6 rounded-3xl border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-emerald-50 p-8 shadow-sm backdrop-blur-xl"
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Clinical Decision Support</p>
        <h1 className="mb-3 text-4xl font-extrabold leading-tight md:text-5xl">AI Pneumonia Screening Console</h1>
        <p className="max-w-2xl text-slate-600">
          Professional radiology workflow for triage, explainability, and confidence monitoring.
        </p>
      </motion.section>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {metrics.map((m, i) => (
          <motion.article
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-xl"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">{m.label}</p>
            <h3 className="mt-1 text-2xl font-bold">{m.value}</h3>
          </motion.article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <motion.article initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <UploadCloud className="h-5 w-5 text-emerald-300" />
            Upload Workspace
          </h2>
          <label className="grid h-64 cursor-pointer place-items-center rounded-2xl border border-dashed border-emerald-300/70 bg-emerald-50/30 text-slate-500 hover:bg-emerald-50/50">
            <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} className="hidden" />
            <div className="text-center">
              <p className="font-semibold text-emerald-700">Click to upload chest X-ray</p>
              <p className="mt-1 text-sm text-slate-500">PNG, JPG, JPEG</p>
            </div>
          </label>
          {selectedFile ? (
            <p className="mt-3 text-sm text-slate-600">
              Selected file: <span className="font-semibold">{selectedFile.name}</span>
            </p>
          ) : null}
          {previewUrl ? <img src={previewUrl} alt="Uploaded X-ray preview" className="mt-3 max-h-64 w-full rounded-xl border border-slate-200 object-contain" /> : null}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || loading}
            className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? "Submitting..." : "Submit for Analysis"}
          </button>
        </motion.article>

        <motion.article initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Brain className="h-5 w-5 text-emerald-300" />
            AI Insight Core
          </h2>
          <p className="mb-3 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-300/60">
            Live API mode
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Prediction</p>
              <p className="text-3xl font-extrabold text-emerald-600">{submitted && result ? result.prediction : "WAITING"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">Confidence</p>
              <div className="h-2 rounded-full bg-slate-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: submitted && result ? `${(result.pneumonia_probability * 100).toFixed(1)}%` : "0%" }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-400"
                />
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {submitted && result ? `${(result.pneumonia_probability * 100).toFixed(2)}%` : "--"}
              </p>
            </div>
            {submitted ? (
              <span className="inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-300/60">
                PREDICTION COMPLETE
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-300">
                READY FOR SUBMISSION
              </span>
            )}
            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
          </div>
        </motion.article>
      </section>
    </>
  );
}

function CasesPage() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur-xl">
      <h1 className="text-3xl font-bold">Case Queue</h1>
      <p className="mt-2 text-slate-600">View incoming studies, triage status, and review timeline.</p>
    </section>
  );
}

function InsightsPage() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur-xl">
      <h1 className="text-3xl font-bold">Insights</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {[{ icon: Activity, t: "Realtime Monitoring", d: "Live status stream with event tracing." },
          { icon: ShieldCheck, t: "Clinical Guardrails", d: "Decision thresholds and risk governance." },
          { icon: Zap, t: "Explainability Engine", d: "Grad-CAM and rationale overlays module." }].map((f) => (
          <article key={f.t} className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur-xl">
            <f.icon className="mb-3 h-5 w-5 text-emerald-300" />
            <h3 className="text-lg font-semibold">{f.t}</h3>
            <p className="mt-1 text-sm text-slate-600">{f.d}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SettingsPage() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur-xl">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-2 text-slate-600">Configure threshold policy, alerts, and deployment parameters.</p>
    </section>
  );
}

function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(132,204,22,0.12),transparent_38%)]" />
      <div className="relative mx-auto max-w-7xl px-6 py-10">
        <motion.header
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/90 px-5 py-3 shadow-sm backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="h-5 w-5 text-emerald-300" />
            PneumoniaOS Ultra UI
          </div>
          <nav className="hidden gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300/60"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <span className="inline-flex items-center gap-1.5">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>
          <button className="rounded-lg bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-300/60">
            Live Console
          </button>
        </motion.header>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App
