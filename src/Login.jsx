import React, { useState } from "react";
import { parseM3U } from "./m3uParser";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("xtream");
  const [form, setForm] = useState({ url: "", user: "", pass: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "m3u" && form.url) {
      try {
        const response = await fetch(form.url);
        if (!response.ok) throw new Error("Lien M3U inaccessible");
        const text = await response.text();
        const channels = parseM3U(text);
        if (!channels || channels.length === 0) {
          throw new Error("Aucune chaîne trouvée dans ce lien M3U");
        }
        setLoading(false);
        onLogin({ ...form, mode, channels });
      } catch (err) {
        setError(
          "Impossible de lire ce lien M3U. Vérifie que l'adresse est correcte ou réessaie plus tard."
        );
        setLoading(false);
      }
    } else if (mode === "xtream" && form.url && form.user && form.pass) {
      setLoading(false);
      onLogin({ ...form, mode });
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
          <div className="flex mb-6">
            <button
              onClick={() => setMode("xtream")}
              className={`flex-1 py-2 rounded-xl text-lg font-semibold transition-all ${
                mode === "xtream"
                  ? "bg-pink-500 text-white"
                  : "bg-neutral-700 text-gray-300"
              }`}
            >
              Xtream Codes
            </button>
            <button
              onClick={() => setMode("m3u")}
              className={`flex-1 py-2 rounded-xl ml-2 text-lg font-semibold transition-all ${
                mode === "m3u"
                  ? "bg-pink-500 text-white"
                  : "bg-neutral-700 text-gray-300"
              }`}
            >
              Lien M3U
            </button>
          </div>
          <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
            <input
              name="url"
              type="text"
              placeholder={
                mode === "xtream"
                  ? "http://serveur:port"
                  : "Lien M3U complet (http...)"
              }
              className="px-4 py-3 rounded-xl bg-neutral-700 text-white"
              onChange={handleChange}
              required
              value={form.url}
            />
            {mode === "xtream" && (
              <>
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
              </>
            )}
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

