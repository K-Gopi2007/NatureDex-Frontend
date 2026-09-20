import { Leaf, LogOut, Map as MapIcon, Compass, Scale } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-lg border-b border-white/5">
      <div className="px-6 h-16 flex items-center justify-between max-w-md mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary/20 p-2 rounded-xl">
            <Leaf className="text-primary" size={20} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white hidden sm:block">NatureDex</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/map" className="text-gray-400 hover:text-white transition" title="My Map">
                <MapIcon size={20} />
              </Link>
              <Link to="/explore/nearby" className="text-gray-400 hover:text-amber-400 transition" title="Explore Hotspots">
                <Compass size={20} />
              </Link>
              <Link to="/compare" className="text-gray-400 hover:text-emerald-400 transition" title="Compare Species">
                <Scale size={20} />
              </Link>
              <Link to="/user-profile" className="w-8 h-8 rounded-full bg-emerald-900 border border-emerald-500 overflow-hidden flex items-center justify-center ml-2">
                <img src={user.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="User" className="w-full h-full" />
              </Link>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm font-semibold text-primary hover:text-emerald-400">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
