export function parseM3U(m3uText) {
  const lines = m3uText.split('\n');
  const channels = [];
  let current = null;

  for (let line of lines) {
    line = line.trim();

    // Début d'une nouvelle chaîne
    if (line.startsWith('#EXTINF')) {
      const nameMatch = line.match(/,(.*)$/);
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);

      current = {
        name: nameMatch ? nameMatch[1].trim() : "Chaîne inconnue",
        img: logoMatch ? logoMatch[1] : "",
        url: "",
        group: groupMatch ? groupMatch[1] : "Autres"
      };
    }
    // URL du flux vidéo (juste après le #EXTINF)
    else if (
      line &&
      current &&
      !line.startsWith('#') &&
      (line.startsWith("http://") || line.startsWith("https://"))
    ) {
      current.url = line;
      channels.push(current);
      current = null;
    }
  }
  return channels;
}