import { Link, useLocation } from "react-router-dom";
import { Camera, Home, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/collection", icon: BookOpen, label: "My Dex" },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-white/10" />
      
      <div className="relative px-6 py-4 flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center gap-1 w-16 transition-colors ${
                isActive ? "text-primary" : "text-emerald-900 hover:text-emerald-600"
              }`}
            >
              <div className="relative">
                <Icon size={24} />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 left-1/2 w-1 h-1 bg-primary rounded-full -translate-x-1/2"
                  />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        <div className="absolute left-1/2 bottom-6 -translate-x-1/2 pointer-events-none">
          <Link to="/scanner" className="pointer-events-auto">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 text-primary-foreground ring-4 ring-background"
            >
              <Camera size={28} />
            </motion.div>
          </Link>
        </div>
      </div>
    </nav>
  );
}

