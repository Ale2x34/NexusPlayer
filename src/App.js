import React, { useState, useEffect } from "react";
import Home from "./Home";

function buildApiUrl(host, user, pass, action, extra = "") {
  return `${host}/player_api.php?username=${user}&password=${pass}&action=${action}${extra}`;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFav] = useState([]);
  const [history, setHist] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const host = "http://smartchoice.pro"; // Mets ici ton host Xtream
      const username = "U97H77U5"; // Mets ici ton username
      const password = "HWZT27"; // Mets ici ton password

      try {
        // Vérifier compte actif
        const resUser = await fetch(buildApiUrl(host, username, password, "user_info"));
        const userInfo = await resUser.json();
        if (!userInfo.user_info || userInfo.user_info.status !== "Active") {
          throw new Error("Compte Xtream inactif");
        }

        // Récupérer catégories live et live streams
        const resCats = await fetch(buildApiUrl(host, username, password, "get_live_categories"));
        const liveCategories = await resCats.json();

        const resLive = await fetch(buildApiUrl(host, username, password, "get_live_streams"));
        const liveStreams = await resLive.json();

        // Ajouter nom catégorie dans les streams live
        const liveWithCat = liveStreams.map(stream => ({
          ...stream,
          category_name:
            (liveCategories.find(cat => cat.category_id === stream.category_id) || {}).category_name ||
            "Autres",
        }));

        // Même chose pour films
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

        // Et pour séries
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

        // Mettre dans state utilisateur
        setUser({
          host,
          username,
          password,
          live: liveWithCat,
          films: filmsWithCat,
          series: seriesWithCat,
          mode: "xtream",
        });

      } catch (err) {
        console.error("Erreur lors de la récupération Xtream:", err);
        alert("Erreur de connexion ou données Xtream non accessibles. Vérifie les codes.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div className="text-white p-4">Chargement des chaînes IPTV…</div>;

  if (!user) return <div className="text-red-400 p-4">Impossible de charger les données.</div>;

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

