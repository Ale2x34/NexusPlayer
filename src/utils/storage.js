const FAV_KEY = "nexusplayeriptv-favs";
const HIST_KEY = "nexusplayeriptv-history";

export function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; }
}
export function setFavorites(fav) {
  localStorage.setItem(FAV_KEY, JSON.stringify(fav));
}
export function getHistory() {
  try { return JSON.parse(localStorage.getItem(HIST_KEY)) || []; } catch { return []; }
}
export function setHistory(hist) {
  localStorage.setItem(HIST_KEY, JSON.stringify(hist));
}
