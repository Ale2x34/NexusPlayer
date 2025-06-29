import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DetailModal({
  item,
  host,
  username,
  password,
  onClose,
  onPlay,
  isFav,
  onFav,
}) {
  const [episodes, setEpisodes] = useState([]);
  const [showUnavailable, setShowUnavailable] = useState(false);

  // Type de contenu
  const isSerie = !!item.series_id;
  const isFilm = !isSerie && (item.stream_type === "movie" || (item.stream_id && item.category_name && (item.category_name.toLowerCase().includes("film") || item.category_name.toLowerCase().includes("movie"))));
  const isLive = !isSerie && !isFilm;

  // Lien pour film/direct
  const streamUrl = item.stream_id
    ? isFilm
      ? `${host}/movie/${username}/${password}/${item.stream_id}.mp4`
      : `${host}/live/${username}/${password}/${item.stream_id}.m3u8`
    : "";

  // Épisodes séries
  useEffect(() => {
    if (!isSerie) return;
    fetch(
      `${host}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${item.series_id}`
    )
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.episodes)) setEpisodes(data.episodes);
        else if (data.episodes && typeof data.episodes === "object") {
          let all = [];
          Object.values(data.episodes).forEach(seasonArr => {
            if (Array.isArray(seasonArr)) all = all.concat(seasonArr);
          });
          setEpisodes(all);
        } else setEpisodes([]);
      });
  }, [item, host, username, password, isSerie]);

  function copyLink(link) {
    navigator.clipboard.writeText(link);
    alert("Lien copié !");
  }

  // Gestion des boutons
  function handleWatch() {
    setShowUnavailable(true);
  }

  function handlePlayLive() {
    onPlay({ ...item, url: streamUrl });
  }

  const episodesToDisplay = Array.isArray(episodes) ? episodes : [];

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Popup indisponible */}
      <AnimatePresence>
        {showUnavailable && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-neutral-800 p-8 rounded-xl shadow-2xl max-w-xs text-center">
              <div className="text-xl font-bold text-pink-400 mb-2">Indisponible !</div>
              <div className="text-white mb-4">
                Les films et séries ne sont pas accessibles directement dans le navigateur.<br/>
                <span className="text-pink-300">Cliquez sur “Copier VLC” pour lire dans VLC !</span>
              </div>
              <button
                onClick={() => setShowUnavailable(false)}
                className="bg-pink-500 px-4 py-2 rounded font-bold text-white hover:bg-pink-600"
              >
                OK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fenêtre de détails */}
      <motion.div
        className="bg-neutral-900 rounded-2xl max-w-lg w-full p-6 shadow-xl relative"
        initial={{ scale: 0.8, y: 60 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 60 }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-black/60 rounded-full p-2 z-10 text-white"
        >
          ✕
        </button>
        <div className="flex gap-4">
          <img
            src={item.stream_icon || item.cover || "https://cdn-icons-png.flaticon.com/512/65/65000.png"}
            alt={item.name}
            className="rounded-lg w-32 h-44 object-cover"
          />
          <div className="flex-1">
            <div className="text-xl font-bold text-pink-400">{item.name}</div>
            <div className="text-xs text-gray-300">{item.category_name}</div>
            <div className="my-2 text-gray-200 text-sm line-clamp-6" style={{ maxHeight: 90, overflow: 'auto' }}>
              {item.plot || item.description || "Aucune description."}
            </div>
            <div className="flex gap-2 mt-2">
              {/* "Regarder" : direct = OK, sinon popup */}
              {isLive && streamUrl && (
                <button
                  onClick={handlePlayLive}
                  className="bg-pink-500 px-4 py-1 rounded text-white font-bold hover:bg-pink-600"
                >
                  Regarder
                </button>
              )}
              {(isFilm || isSerie) && streamUrl && (
                <button
                  onClick={handleWatch}
                  className="bg-pink-500 px-4 py-1 rounded text-white font-bold hover:bg-pink-600"
                >
                  Regarder
                </button>
              )}
              {streamUrl && (
                <button
                  onClick={() => copyLink(streamUrl)}
                  className="bg-neutral-700 px-4 py-1 rounded text-white hover:bg-neutral-600"
                >
                  Copier VLC
                </button>
              )}
              <button
                onClick={onFav}
                className={`px-2 py-1 rounded ${isFav ? "bg-yellow-400 text-black" : "bg-neutral-700 text-white"}`}
              >
                {isFav ? "★ Favori" : "☆ Favori"}
              </button>
            </div>
          </div>
        </div>
        {/* Affichage épisodes */}
        {isSerie && (
          <div className="mt-6">
            <div className="font-bold text-pink-300 mb-2">Épisodes</div>
            <div className="max-h-48 overflow-auto space-y-1">
              {episodesToDisplay.length === 0 && (
                <div className="text-gray-400 text-center">Aucun épisode trouvé.</div>
              )}
              {episodesToDisplay.map((ep, i) => {
                const episodeUrl = `${host}/series/${username}/${password}/${ep.container_extension || "mp4"}/${ep.id}.${ep.container_extension || "mp4"}`;
                return (
                  <div
                    key={ep.id || ep.episode_id || i}
                    className="flex items-center justify-between bg-neutral-800 p-2 rounded cursor-pointer hover:bg-pink-800/30"
                  >
                    <span className="text-white">{ep.title || ep.episode_num}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyLink(episodeUrl)}
                        className="bg-neutral-700 px-2 py-1 rounded text-white hover:bg-neutral-600 text-xs"
                      >
                        Copier VLC
                      </button>
                      <button
                        onClick={handleWatch}
                        className="bg-pink-500 px-2 py-1 rounded text-white hover:bg-pink-600 text-xs font-bold"
                      >
                        Regarder
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}



