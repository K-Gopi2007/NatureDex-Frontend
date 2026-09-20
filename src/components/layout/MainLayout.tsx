import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import AICompanion from "../ui/AICompanion";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isScanner = location.pathname === "/scanner";
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans">
      {!isScanner && <Navbar />}
      
      <main className={`flex-1 max-w-md mx-auto min-h-screen relative ${!isScanner ? "pt-16 pb-24" : ""}`}>
        {children}
      </main>
      
      {!isScanner && <Footer />}
      {user && <AICompanion />}
    </div>
  );
}
