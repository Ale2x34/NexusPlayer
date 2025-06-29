import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ url: "", user: "", pass: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (form.url && form.user && form.pass) {
      setLoading(false);
      onLogin({ ...form, mode: "xtream" });
    } else {
      setError("Merci de remplir tous les champs nécessaires !");
      setLoading(false);
    }
  };

  // ---- Fond Netflix ----
  const backgroundStyle = {
    minHeight: "100vh",
    background: "linear-gradient(120deg, #0f2027 0%, #2c5364 100%)",
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 0,
    overflow: "hidden"
  };
  const motifStyle = {
    background:
      "radial-gradient(ellipse at 40% 0%, rgba(255,0,90,0.16) 0%, transparent 80%)," +
      "radial-gradient(ellipse at 70% 90%, rgba(155,0,255,0.11) 0%, transparent 70%)",
    position: "fixed",
    inset: 0,
    zIndex: 1,
    pointerEvents: "none",
    userSelect: "none"
  };

  return (
    <div>
      <div style={backgroundStyle} />
      <div style={motifStyle} />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-5xl font-bold text-white mb-6 font-mono drop-shadow-lg text-center">
          NexusPlayer<span className="text-pink-400">IPTV</span>
        </h1>
        <div className="bg-neutral-800/95 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
          <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
            <input
              name="url"
              type="text"
              placeholder="http://serveur:port"
              className="px-4 py-3 rounded-xl bg-neutral-700 text-white"
              onChange={handleChange}
              required
              value={form.url}
            />
            <input
              name="user"
              type="text"
              placeholder="Nom d'utilisateur"
              className="px-4 py-3 rounded-xl bg-neutral-700 text-white"
              onChange={handleChange}
              required
              value={form.user}
            />
            <input
              name="pass"
              type="password"
              placeholder="Mot de passe"
              className="px-4 py-3 rounded-xl bg-neutral-700 text-white"
              onChange={handleChange}
              required
              value={form.pass}
            />
            <button
              className="bg-pink-500 hover:bg-pink-700 transition-all text-xl py-3 rounded-xl font-bold text-white mt-4"
              type="submit"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
            {error && (
              <div className="text-red-400 mt-2 text-center font-semibold">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
