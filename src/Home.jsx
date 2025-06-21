import React, { useState } from "react";
import Navbar from "./components/Navbar";
import VideoPlayer from "./components/VideoPlayer";
import DetailModal from "./components/DetailModal";
import { motion, AnimatePresence } from "framer-motion";

// Renvoie la liste des catégories/groupe selon le mode
function getCategories(list, mode) {
  if (mode === "m3u")
    return ["Toutes", ...Array.from(new Set((list || []).map(e => e.group || "Autres")))];
  return ["Toutes", ...Array.from(new Set((list || []).map(e => e.category_name || "Autres")))];
}

// Utilitaire de comparaison favoris (M3U = url unique, Xtream = stream_id)
function isFav(item, favs, mode) {
  if (mode === "m3u") return favs.some(f => f.url === item.url);
  return favs.some(f => f.stream_id === item.stream_id);
}

// Historique idem
function isHist(item, hist, mode) {
  if (mode === "m3u") return hist.some(h => h.url === item.url);
  return hist.some(h => h.stream_id === item.stream_id);
}

// Fonction calculant le nombre de jours restants
function getRemainingDays(user_info) {
  if (!user_info || !user_info.exp_date) return null;
  const expDate = new Date(user_info.exp_date);
  if (isNaN(expDate)) return null;
  const now = new Date();
  const diffMs = expDate.getTime() - now.getTime();
  return diffMs > 0 ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : 0;
}

export default function Home({ user, onLogout, favorites, setFavorites, history, setHistory }) {
  const [tab, setTab] = useState("direct");
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Toutes");

  const { host, username, password, live, films, series, mode, user_info } = user;

  const tabs =
    mode === "m3u"
      ? [
          { key: "direct", label: "Direct" },
          { key: "favoris", label: "Favoris" },
          { key: "history", label: "Continuer" },
        ]
      : [
          { key: "direct", label: "Direct" },
          { key: "films", label: "Films" },
          { key: "series", label: "Séries" },
          { key: "favoris", label: "Favoris" },
          { key: "history", label: "Continuer" },
        ];

  let currentList =
    tab === "direct"
      ? live
      : tab === "films"
      ? films
      : tab === "series"
      ? series
      : tab === "favoris"
      ? favorites
      : tab === "history"
      ? history
      : [];

  const categories = getCategories(currentList, mode);

  const filtered = currentList.filter(item => {
    const itemCat = mode === "m3u" ? item.group : item.category_name;
    const catMatch = cat === "Toutes" || (itemCat || "Autres").toLowerCase() === cat.toLowerCase();
    const searchMatch = (item.name || item.title || "").toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  function getUrl(item, type = tab) {
    if (!item) return "";
    if (item.url) return item.url;
    if (type === "direct" || item.stream_type === "live")
      return `${host}/live/${username}/${password}/${item.stream_id}.m3u8`;
    if (type === "films" || item.stream_type === "movie")
      return `${host}/movie/${username}/${password}/${item.stream_id}.mp4`;
    return "";
  }

  function toggleFav(item) {
    if (mode === "m3u") {
      if (favorites.some(f => f.url === item.url))
        setFavorites(favorites.filter(f => f.url !== item.url));
      else setFavorites([{ ...item }, ...favorites]);
    } else {
      if (favorites.some(f => f.stream_id === item.stream_id))
        setFavorites(favorites.filter(f => f.stream_id !== item.stream_id));
      else setFavorites([{ ...item }, ...favorites]);
    }
  }

  function addHistory(item) {
    if (mode === "m3u") {
      const idx = history.findIndex(h => h.url === item.url);
      let newHist = [...history];
      if (idx > -1) newHist.splice(idx, 1);
      newHist.unshift({ ...item, lastWatch: Date.now() });
      setHistory(newHist.slice(0, 15));
    } else {
      const idx = history.findIndex(h => h.stream_id === item.stream_id && h.name === item.name);
      let newHist = [...history];
      if (idx > -1) newHist.splice(idx, 1);
      newHist.unshift({ ...item, lastWatch: Date.now() });
      setHistory(newHist.slice(0, 15));
    }
  }

  // Calcule les jours restants
  const remainingDays = getRemainingDays(user_info);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-950 to-black">
      <Navbar onLogout={onLogout} appName="NexusPlayerIPTV" />
      <div className="px-6 mt-6 text-white font-semibold text-lg">
        Temps restant du compte : {remainingDays !== null ? remainingDays + " jour(s)" : "Indisponible"}
      </div>
      <div className="flex flex-col px-6 mt-4">
        {/* Onglets + Animations */}
        <div className="flex space-x-8 mb-8 text-2xl font-bold">
          {tabs.map(t => (
            <motion.button
              layout
              key={t.key}
              className={`py-2 transition-all ${
                tab === t.key ? "text-pink-500 border-b-4 border-pink-500" : "text-gray-300"
              }`}
              onClick={() => {
                setTab(t.key);
                setCat("Toutes");
                setSearch("");
              }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {t.label}
            </motion.button>
          ))}
        </div>
        {/* Catégories */}
        {tab !== "favoris" && tab !== "history" && (
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((c, i) => (
              <motion.button
                layout
                key={i}
                className={`px-3 py-1 rounded-lg ${
                  cat === c ? "bg-pink-500 text-white" : "bg-neutral-700 text-gray-300"
                }`}
                onClick={() => setCat(c)}
                whileTap={{ scale: 0.95 }}
              >
                {c}
              </motion.button>
            ))}
          </div>
        )}
        {/* Recherche */}
        <input
          type="text"
          placeholder="Rechercher…"
          className="mb-4 px-4 py-2 rounded-xl w-full bg-neutral-700 text-white text-lg"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {/* Affichage */}
        <AnimatePresence>
          <SectionList
            key={tab + cat + search}
            items={filtered.map(item => ({
              ...item,
              img:
                item.img ||
                item.stream_icon ||
                item.cover ||
                item.logo ||
                undefined,
              url: getUrl(item, tab),
              isM3U: mode === "m3u"
            }))}
            onSelect={item => {
              if (tab === "series" && !item.url && mode !== "m3u") setShowDetail(item);
              else {
                addHistory(item);
                setSelected(item);
              }
            }}
            onDetail={setShowDetail}
            favorites={favorites}
            onFav={toggleFav}
            title={
              filtered.length === 0
                ? tab === "favoris"
                  ? "Aucun favori"
                  : tab === "history"
                  ? "Rien à continuer"
                  : "Aucun contenu"
                : ""
            }
            mode={mode}
          />
        </AnimatePresence>
      </div>
      {/* Lecteur vidéo */}
      <AnimatePresence>
        {selected && selected.url && (
          <VideoPlayer
            url={selected.url}
            onClose={() => setSelected(null)}
            title={selected.name}
          />
        )}
      </AnimatePresence>
      {/* Détail modal (pas pour M3U) */}
      <AnimatePresence>
        {showDetail && mode !== "m3u" && (
          <DetailModal
            item={showDetail}
            host={host}
            username={username}
            password={password}
            onClose={() => setShowDetail(null)}
            onPlay={item => {
              addHistory(item);
              setSelected(item);
              setShowDetail(null);
            }}
            isFav={!!favorites.find(f => f.stream_id === showDetail.stream_id)}
            onFav={() => toggleFav(showDetail)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Affichage grille compatible pour les deux modes
function SectionList({ items, onSelect, onDetail, favorites, onFav, title, mode }) {
  return (
    <motion.div className="mb-12">
      {title && <h2 className="text-white text-2xl mb-3">{title}</h2>}
      <motion.div
        layout
        className="grid grid-cols-6 gap-6 overflow-y-auto max-h-[600px]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
      >
        {items.map((item, idx) => (
          <motion.div
            layout
            key={idx}
            className="min-w-[200px] bg-neutral-900 rounded-2xl shadow-2xl hover:scale-105 cursor-pointer transition-transform duration-200 relative group"
            onClick={() => onSelect(item)}
            whileHover={{ scale: 1.06 }}
          >
            {/* Favoris étoile */}
            <button
              onClick={e => {
                e.stopPropagation();
                onFav(item);
              }}
              className={`absolute top-2 right-2 z-10 ${
                isFav(item, favorites, mode)
                  ? "text-yellow-400"
                  : "text-white/50"
              }`}
              title="Favori"
            >
              ★
            </button>
            {/* Fiche détail (pas pour M3U) */}
            {mode !== "m3u" && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDetail(item);
                }}
                className="absolute bottom-2 right-2 z-10 bg-black/60 text-xs rounded px-2 py-1 text-pink-300 hover:bg-pink-600 hover:text-white"
                title="Fiche"
              >
                Infos
              </button>
            )}
            {/* Image */}
            {item.img ? (
              <img
                src={item.img}
                alt={item.name}
                className="rounded-t-2xl h-40 w-full object-cover group-hover:opacity-80 transition"
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = "https://cdn-icons-png.flaticon.com/512/65/65000.png";
                }}
              />
            ) : (
              <div className="h-40 w-full flex items-center justify-center bg-neutral-700 text-white rounded-t-2xl">
                Aucun logo
              </div>
            )}
            <div className="p-3">
              <div className="text-lg text-white font-semibold truncate">{item.name}</div>
              {(item.category_name || item.group) && (
                <div className="text-xs text-pink-400 mt-1 truncate">
                  {item.category_name || item.group}
                </div>
              )}
            </div>
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-80 bg-black/70 transition">
              <svg width="48" height="48" fill="#fff">
                <polygon points="16,12 40,24 16,36" />
              </svg>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

