import React, { useState } from "react";
import Login from "./components/Login"; // Crée ce composant si pas déjà fait
import Home from "./Home";

function buildApiUrl(host, user, pass, action, extra = "") {
  return `${host}/player_api.php?username=${user}&password=${pass}&action=${action}${extra}`;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFav] = useState([]);
  const [history, setHist] = useState([]);

  async function handleLogin({ url: host, user: username, pass: password }) {
    setLoading(true);
    try {
      // Vérifier compte actif
      const resUser = await fetch(buildApiUrl(host, username, password, "user_info"));
      const userInfo = await resUser.json();
      if (!userInfo.user_info || userInfo.user_info.status !== "Active") {
        alert("Compte Xtream inactif ou invalide.");
        setLoading(false);
        return;
      }

      // Récupérer catégories live et live streams
      const resCats = await fetch(buildApiUrl(host, username, password, "get_live_categories"));
      const liveCategories = await resCats.json();

      const resLive = await fetch(buildApiUrl(host, username, password, "get_live_streams"));
      const liveStreams = await resLive.json();

      const liveWithCat = liveStreams.map(stream => ({
        ...stream,
        category_name:
          (liveCategories.find(cat => cat.category_id === stream.category_id) || {}).category_name ||
          "Autres",
      }));

      // Films
      const resFilmCats = await fetch(buildApiUrl(host, username, password, "get_vod_categories"));
      const filmCategories = await resFilmCats.json();

      const resFilms = await fetch(buildApiUrl(host, username, password, "get_vod_streams"));
      const films = await resFilms.json();

      const filmsWithCat = films.map(film => ({
        ...film,
        category_name:
          (filmCategories.find(cat => cat.category_id === film.category_id) || {}).category_name ||
          "Autres",
      }));

      // Séries
      const resSeriesCats = await fetch(buildApiUrl(host, username, password, "get_series_categories"));
      const seriesCategories = await resSeriesCats.json();

      const resSeries = await fetch(buildApiUrl(host, username, password, "get_series"));
      const series = await resSeries.json();

      const seriesWithCat = series.map(serie => ({
        ...serie,
        category_name:
          (seriesCategories.find(cat => cat.category_id === serie.category_id) || {}).category_name ||
          "Autres",
      }));

      setUser({
        host,
        username,
        password,
        live: liveWithCat,
        films: filmsWithCat,
        series: seriesWithCat,
        mode: "xtream",
      });
    } catch (error) {
      alert("Erreur de connexion ou données Xtream non accessibles.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (!user)
    return <Login onLogin={handleLogin} loading={loading} />;

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
