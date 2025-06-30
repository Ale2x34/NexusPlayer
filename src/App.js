import React, { useState } from "react";
import Login from "./components/Login";  // Ton composant formulaire login
import Home from "./Home";

function buildApiUrl(host, user, pass, action, extra = "") {
  return `${host}/player_api.php?username=${user}&password=${pass}&action=${action}${extra}`;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFav] = useState([]);
  const [history, setHist] = useState([]);

  const handleLogin = async ({ url, user: username, pass }) => {
    setLoading(true);
    try {
      // Vérifier compte actif
      const resUser = await fetch(buildApiUrl(url, username, pass, "user_info"));
      const info = await resUser.json();

      if (!info.user_info || info.user_info.status !== "Active") {
        alert("Compte Xtream inactif ou invalide.");
        setLoading(false);
        return;
      }

      // Récupérer catégories live et live streams
      const catsRes = await fetch(buildApiUrl(url, username, pass, "get_live_categories"));
      const liveCategories = await catsRes.json();

      const liveRes = await fetch(buildApiUrl(url, username, pass, "get_live_streams"));
      const live = await liveRes.json();

      const liveWithCat = live.map(c => ({
        ...c,
        category_name: (liveCategories.find(cat => cat.category_id === c.category_id) || {}).category_name || "Autres",
      }));

      // Même pour films
      const filmCatsRes = await fetch(buildApiUrl(url, username, pass, "get_vod_categories"));
      const filmCategories = await filmCatsRes.json();

      const filmsRes = await fetch(buildApiUrl(url, username, pass, "get_vod_streams"));
      const films = await filmsRes.json();

      const filmsWithCat = films.map(f => ({
        ...f,
        category_name: (filmCategories.find(cat => cat.category_id === f.category_id) || {}).category_name || "Autres",
      }));

      // Et pour séries
      const seriesCatsRes = await fetch(buildApiUrl(url, username, pass, "get_series_categories"));
      const seriesCategories = await seriesCatsRes.json();

      const seriesRes = await fetch(buildApiUrl(url, username, pass, "get_series"));
      const series = await seriesRes.json();

      const seriesWithCat = series.map(s => ({
        ...s,
        category_name: (seriesCategories.find(cat => cat.category_id === s.category_id) || {}).category_name || "Autres",
      }));

      setUser({
        host: url,
        username,
        password: pass,
        live: liveWithCat,
        films: filmsWithCat,
        series: seriesWithCat,
        mode: "xtream",
        user_info: info.user_info,
      });
    } catch (err) {
      alert("Erreur de connexion ou données Xtream non accessibles. Vérifie les codes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Login onLogin={handleLogin} loading={loading} />;

  return (
    <Home
      user={user}
      onLogout={() => setUser(null)}
      favorites={favorites}
      setFavorites={setFav}
      history={history}
      setHistory={setHist}
    />
  );
}

