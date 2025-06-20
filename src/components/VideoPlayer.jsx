import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function VideoPlayer({ url, onClose, title }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    let hls;
    setError(false);

    if (!video) return;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function () {
        setError(true);
      });
    } else {
      setError(true);
    }
    return () => { if (hls) hls.destroy(); };
  }, [url]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-[90vw] max-w-4xl rounded-2xl overflow-hidden shadow-2xl">
        <button onClick={onClose}
          className="absolute top-2 right-2 bg-black/60 rounded-full p-2 z-10 text-white text-2xl">✕</button>
        <div className="bg-black text-white px-6 py-3 text-lg font-bold">{title}</div>
        {error ? (
          <div className="w-full h-[480px] bg-black flex items-center justify-center text-xl text-red-400">
            Flux indisponible. Essayez une autre chaîne !
          </div>
        ) : (
          <video ref={videoRef} controls autoPlay className="w-full h-[480px] bg-black"
            onError={() => setError(true)} />
        )}
      </div>
    </div>
  );
}
