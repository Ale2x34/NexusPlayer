import logo from "../assets/logo.png";

export default function Navbar({ onLogout, appName }) {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-neutral-950 via-neutral-900 to-pink-600 rounded-b-3xl shadow-lg">
      <div className="flex items-center gap-3">
        <img src={logo} alt="logo" className="h-10 w-10 rounded-xl shadow" />
        <span className="text-white text-3xl font-bold">{appName}</span>
      </div>
      <button
        onClick={onLogout}
        className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-xl"
      >
        Déconnexion
      </button>
    </nav>
  );
}
