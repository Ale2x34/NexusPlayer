import React, { useState, useEffect } from "react";
import Login from "./components/Login"; // Assure-toi que c'est bien le nouveau Login avec m3u + xtream
import Home from "./Home";
import { getFavorites, getHistory, setFavorites, setHistory } from "./utils/storage";

function buildApiUrl(host, user, pass, action, extra = "") {
  return `${host}/player_api.php?username=${user}&password=${pass}&action=${action}${extra}`;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFav] = useState(getFavorites());
  const [history, setHist] = useState(getHistory());

  useEffect(() => { setFavorites(favorites); }, [favorites]);
  useEffect(() => { setHistory(history); }, [history]);

  const handleLogin = async (params) => {
    setLoading(true);

    if (params.mode === "m3u") {
      setUser({
        host: "",
        username: "",
        password: "",
        live: params.channels,
        films: [],
        series: [],
        mode: "m3u",
        m3u_url: params.url,
      });
      setLoading(false);
      return;
    }

    const host = params.url, username = params.user, password = params.pass;
    try {
      const res = await fetch(buildApiUrl(host, username, password, "user_info"));
      const info = await res.json();

      if (!info.user_info || info.user_info.status !== "Active") {
        setLoading(false);
        throw new Error("Compte Xtream inactif");
      }

      const catsRes = await fetch(buildApiUrl(host, username, password, "get_live_categories"));
      const liveCategories = await catsRes.json();

      const liveRes = await fetch(buildApiUrl(host, username, password, "get_live_streams"));
      const live = await liveRes.json();

      const liveWithCat = live.map(c => ({
        ...c,
        category_name:
          (liveCategories.find(cat => cat.category_id === c.category_id) || {}).category_name || "Autres",
      }));

      const filmCatsRes = await fetch(buildApiUrl(host, username, password, "get_vod_categories"));
      const filmCategories = await filmCatsRes.json();

      const filmsRes = await fetch(buildApiUrl(host, username, password, "get_vod_streams"));
      const films = await filmsRes.json();

      const filmsWithCat = films.map(f => ({
        ...f,
        category_name:
          (filmCategories.find(cat => cat.category_id === f.category_id) || {}).category_name || "Autres",
      }));

      const seriesCatsRes = await fetch(buildApiUrl(host, username, password, "get_series_categories"));
      const seriesCategories = await seriesCatsRes.json();

      const seriesRes = await fetch(buildApiUrl(host, username, password, "get_series"));
      const series = await seriesRes.json();

      const seriesWithCat = series.map(s => ({
        ...s,
        category_name:
          (seriesCategories.find(cat => cat.category_id === s.category_id) || {}).category_name || "Autres",
      }));

      setUser({
        host,
        username,
        password,
        live: liveWithCat,
        films: filmsWithCat,
        series: seriesWithCat,
        mode: "xtream",
        user_info: info.user_info, // IMPORTANT : on stocke user_info ici
      });
      setLoading(false);
    } catch (e) {
      setLoading(false);
      alert(e.message || "Erreur lors de la connexion");
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

