import React, { useState, useRef, useEffect, useCallback } from "react";
import { ScanLine, X, Image as ImageIcon, RotateCcw, AlertCircle, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useExplorerProfile } from "../hooks/useExplorerProfile";

const Particles = () => {
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 100 + "vw",
    y: (Math.random() - 0.5) * 100 + "vh",
    size: Math.random() * 6 + 2,
    duration: Math.random() * 2 + 1,
    delay: Math.random() * 0.5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[45] flex items-center justify-center">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{ opacity: 0, scale: 1, x: p.x, y: p.y }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
          className="absolute bg-primary rounded-full shadow-[0_0_15px_rgba(16,185,129,1)]"
          style={{ width: p.size, height: p.size }}
        />
      ))}
    </div>
  );
};

type ScannerState = 'idle' | 'camera_active' | 'image_preview' | 'processing' | 'result' | 'error';

export default function Scanner() {
  const [state, setState] = useState<ScannerState>('idle');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  const { addXP, recentlyUnlocked, clearRecentlyUnlocked } = useExplorerProfile();

  const startCamera = useCallback(async () => {
    setState('idle');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setState('camera_active');
    } catch (err: any) {
      console.error("Camera access error:", err);
      setErrorMessage("Could not access camera. Please check permissions.");
      setState('error');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImageSrc(dataUrl);
        stopCamera();
        setState('image_preview');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      stopCamera();
      setState('image_preview');
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const retakePhoto = () => {
    setImageSrc(null);
    setResult(null);
    setProgress(0);
    clearRecentlyUnlocked();
    startCamera();
  };

  const processImage = async () => {
    if (!imageSrc) return;
    
    setState('processing');
    setProgress(0);
    
    // Simulate cinematic scanning progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90;
        return prev + Math.floor(Math.random() * 10) + 2;
      });
    }, 200);

    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'scan.jpg');
      
      const apiResponse = await fetch('http://127.0.0.1:8000/api/v1/identify/', {
        method: 'POST',
        body: formData,
      });
      
      if (!apiResponse.ok) {
        throw new Error('Failed to identify species');
      }
      
      const data = await apiResponse.json();
      
      clearInterval(interval);
      setProgress(100);
      
      const newResult = {
        id: Math.floor(Math.random() * 1000).toString(),
        name: data.common_name || "Unknown Species",
        scientificName: data.scientific_name || "Unknown",
        matchPercentage: data.confidence ? Math.round(data.confidence * 100) : 0,
        description: data.description ? data.description : `Category: ${data.category || 'N/A'} - ${data.habitat ? 'Found in: ' + data.habitat : ''}`,
        category: data.category || "Unknown",
        secondarySpecies: data.secondary_species || []
      };
      
      // Auto-save the discovery
      const existing = localStorage.getItem('naturedex_discoveries');
      const discoveries = existing ? JSON.parse(existing) : [];
      discoveries.unshift({
        id: newResult.id,
        name: newResult.name,
        scientificName: newResult.scientificName,
        category: newResult.category,
        imageUrl: imageSrc,
        discoveredAt: new Date().toISOString()
      });
      localStorage.setItem('naturedex_discoveries', JSON.stringify(discoveries));
      
      // Add XP and trigger progression for the discovery
      addXP(100, newResult.category, data.conservation_status || "");
      
      // Wait a tiny bit for the 100% to register visually before showing result
      setTimeout(() => {
        setResult(newResult);
        setState('result');
        // Trigger companion celebration
        window.dispatchEvent(new CustomEvent('naturedex:celebrate', { detail: { species_name: newResult.name } }));
      }, 500);
      
    } catch (err: any) {
      clearInterval(interval);
      setErrorMessage(err.message || 'Error communicating with server');
      setState('error');
    }
  };

  return (
    <div className="h-screen w-full bg-black relative flex flex-col overflow-hidden perspective-1000">
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />

      {/* Header */}
      <div className="absolute top-0 w-full z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <Link to="/" onClick={stopCamera} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition">
          <X size={24} />
        </Link>
      </div>

      {/* Main Area */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        
        <AnimatePresence mode="wait">
          {(state === 'camera_active' || state === 'idle') && (
            <motion.video 
              key="camera"
              ref={videoRef}
              autoPlay playsInline muted
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {(state === 'image_preview' || state === 'processing' || state === 'result') && imageSrc && (
            <motion.img 
              key="preview"
              src={imageSrc}
              alt="Preview"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: state === 'result' ? 0.3 : 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className={`absolute inset-0 w-full h-full object-cover ${state === 'result' ? 'blur-md' : ''}`}
            />
          )}
          
          {state === 'error' && (
             <motion.div 
               key="error"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center"
             >
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <p className="text-lg font-medium">{errorMessage}</p>
                <button onClick={retakePhoto} className="mt-6 px-6 py-2 bg-primary rounded-full font-medium">Try Again</button>
             </motion.div>
          )}
        </AnimatePresence>

        {/* 3D Targeting Reticle Overlay */}
        {(state === 'camera_active' || state === 'image_preview') && (
           <div className="absolute inset-0 pointer-events-none p-8 flex items-center justify-center">
             <motion.div 
               animate={{ rotateZ: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="w-full max-w-sm aspect-square absolute opacity-30 border-[1px] border-dashed border-primary rounded-full"
             />
             <motion.div 
               animate={{ scale: [1, 1.05, 1] }}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               className="w-full max-w-sm aspect-[3/4] border-2 border-primary/50 rounded-3xl relative shadow-[inset_0_0_50px_rgba(16,185,129,0.2)]"
             >
               <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
               <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
               <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
               <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
             </motion.div>
           </div>
        )}

        {/* Cinematic Processing */}
        {state === 'processing' && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-8 z-40"
           >
             <div className="relative flex flex-col items-center">
                {/* Rotating 3D rings */}
                <motion.div 
                  animate={{ rotateX: 360, rotateY: 180 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-48 h-48 rounded-full border-[2px] border-dashed border-primary/40 absolute"
                  style={{ transformStyle: "preserve-3d" }}
                />
                <motion.div 
                  animate={{ rotateY: 360, rotateZ: 180 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 rounded-full border-[4px] border-primary/60 absolute"
                  style={{ transformStyle: "preserve-3d" }}
                />
                
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-8 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.6)] z-10 border border-primary/50">
                  <ScanLine size={40} className="text-primary animate-pulse" />
                </div>
                
                <h3 className="text-white text-2xl font-black mb-2 tracking-widest uppercase drop-shadow-md z-10">Identifying</h3>
                
                <div className="w-64 h-1.5 bg-gray-900 rounded-full overflow-hidden z-10 mt-4 border border-white/10">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-primary to-emerald-300 shadow-[0_0_10px_rgba(16,185,129,1)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                
                <div className="flex justify-between w-64 mt-2 text-primary/80 text-xs font-mono font-bold z-10">
                  <span>SYS_ANALYSIS</span>
                  <span>{progress}%</span>
                </div>
             </div>
           </motion.div>
        )}

        {/* Cinematic Result Reveal */}
        <AnimatePresence>
          {state === 'result' && result && (
            <>
              <Particles />
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-lg z-40"
              />
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center p-6 z-50 perspective-1000"
              >
                <div className="w-full max-w-sm" style={{ perspective: "1000px" }}>
                  
                  {recentlyUnlocked && (
                    <motion.div 
                      initial={{ y: -50, opacity: 0, scale: 0.8 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      transition={{ type: "spring", delay: 0.5 }}
                      className="absolute -top-16 left-0 right-0 mx-auto bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border border-yellow-500/50 rounded-2xl p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_0_30px_rgba(234,179,8,0.4)] z-50"
                    >
                      <span className="text-2xl">{recentlyUnlocked.icon}</span>
                      <div>
                        <p className="text-yellow-400 text-[10px] uppercase font-bold tracking-widest drop-shadow-md">Achievement Unlocked!</p>
                        <p className="text-white font-bold text-sm drop-shadow-md">{recentlyUnlocked.title}</p>
                      </div>
                    </motion.div>
                  )}

                  <motion.div 
                    initial={{ opacity: 0, y: 150, scale: 0.8, rotateX: 45 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotateX: -45, y: 150 }}
                    transition={{ type: "spring", damping: 15, stiffness: 100, delay: 0.2 }}
                    className="bg-gradient-to-br from-emerald-950/90 to-black/90 border border-primary/50 rounded-3xl p-6 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.9),inset_0_0_40px_rgba(16,185,129,0.3)] relative overflow-hidden group"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Spotlight effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-[150%] bg-[conic-gradient(from_90deg_at_50%_50%,rgba(0,0,0,0)_0%,rgba(16,185,129,0.2)_50%,rgba(0,0,0,0)_100%)] pointer-events-none mix-blend-screen z-0" 
                    />
                    
                    <div className="relative z-20">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 blur-[50px] rounded-full pointer-events-none" />
                      
                      <div className="flex flex-col items-center mb-6 text-center">
                        <motion.div 
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", bounce: 0.5, delay: 0.6 }}
                          className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.6)]"
                        >
                          <Sparkles className="text-primary" size={28} />
                        </motion.div>
                        <motion.h4 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                          className="text-primary text-xs uppercase tracking-[0.2em] font-bold mb-1"
                        >
                          New Discovery
                        </motion.h4>
                        <motion.h2 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                          className="text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        >
                          {result.name}
                        </motion.h2>
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.9 }}
                          className="text-white/70 italic text-sm mt-1"
                        >
                          {result.scientificName}
                        </motion.p>
                      </div>

                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.0 }}
                        className="grid grid-cols-2 gap-3 mb-6"
                      >
                        <div className="bg-black/60 border border-white/10 rounded-xl p-3 shadow-inner">
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Category</p>
                          <p className="text-white font-medium">{result.category}</p>
                        </div>
                        <div className="bg-black/60 border border-white/10 rounded-xl p-3 shadow-inner">
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Match</p>
                          <p className="text-primary font-bold drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">{result.matchPercentage}%</p>
                        </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 }}
                        className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 relative overflow-hidden shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]"
                      >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
                        <p className="text-emerald-50/90 text-sm leading-relaxed line-clamp-3 relative z-10 drop-shadow-sm">
                          {result.description}
                        </p>
                      </motion.div>

                      {result.secondarySpecies && result.secondarySpecies.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.15 }}
                          className="mb-6"
                        >
                          <p className="text-xs uppercase tracking-wider text-white/50 font-bold mb-2">Also Detected in Background:</p>
                          <div className="flex flex-col gap-2">
                            {result.secondarySpecies.map((ss: any, idx: number) => (
                              <div key={idx} className="bg-black/40 border border-white/5 rounded-lg p-2 flex justify-between items-center">
                                <div>
                                  <p className="text-white text-xs font-bold">{ss.common_name}</p>
                                  <p className="text-white/40 text-[10px] italic">{ss.scientific_name}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-primary text-[10px] font-bold">{Math.round(ss.confidence * 100)}% Match</p>
                                  <p className="text-white/40 text-[10px]">{ss.category}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="flex flex-col gap-3"
                      >
                        <button 
                          onClick={() => navigate(`/profile/${result.id}`)}
                          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                          View Full File <ChevronRight size={18} />
                        </button>
                        <button 
                          onClick={retakePhoto}
                          className="w-full py-4 rounded-xl border border-white/10 text-white/70 font-bold uppercase tracking-widest hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all"
                        >
                          Continue Scanning
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className={`relative z-30 p-8 pb-12 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center gap-6 transition-all duration-500 ${state === 'result' || state === 'processing' ? 'translate-y-full opacity-0 absolute' : ''}`}>
        
        {state === 'camera_active' && (
          <>
            <p className="text-white/80 text-sm font-medium tracking-wide">TARGET SPECIES IN SIGHT</p>
            <div className="flex items-center gap-8">
              <button onClick={triggerUpload} className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition">
                <ImageIcon size={24} />
              </button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCapture}
                className="w-24 h-24 rounded-full border-[3px] border-primary p-2 bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] group"
              >
                <div className="w-full h-full bg-primary/80 group-hover:bg-primary rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] transition-colors" />
              </motion.button>
              
              <div className="w-14 h-14" />
            </div>
          </>
        )}

        {state === 'image_preview' && (
           <div className="flex items-center gap-4 w-full max-w-sm">
              <button onClick={retakePhoto} className="flex-1 py-4 rounded-full bg-gray-800/80 backdrop-blur-xl border border-gray-700 text-white font-bold flex items-center justify-center gap-2 hover:bg-gray-700 transition">
                <RotateCcw size={20} />
                Retake
              </button>
              
              <button onClick={processImage} className="flex-1 py-4 rounded-full bg-primary text-primary-foreground font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:bg-emerald-400 transition">
                <ScanLine size={20} />
                Analyze
              </button>
           </div>
        )}
      </div>
    </div>
  );
}
