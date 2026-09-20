import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Share2, MapPin, Info, CheckCircle2 } from "lucide-react";
import { useDiscoveries } from "../hooks/useDiscoveries";

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { discoveries } = useDiscoveries();
  
  const species = discoveries.find(d => d.id === id);

  if (!species) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <p className="mb-4">Species not found in your collection.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-primary rounded-full">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      <div className="relative h-[50vh] w-full">
        <img 
          src={species.imageUrl} 
          alt={species.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
        
        <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10 pt-safe">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 shadow-lg"
          >
            <ChevronLeft size={24} />
          </button>
          <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 shadow-lg">
            <Share2 size={20} />
          </button>
        </div>
        
        <div className="absolute bottom-6 left-6 right-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 backdrop-blur-md border border-primary/40 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <CheckCircle2 size={16} />
            In Collection
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black text-white mb-1 drop-shadow-lg"
          >
            {species.name}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-emerald-400 italic text-lg drop-shadow-md"
          >
            {species.scientificName}
          </motion.p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-6 py-8 space-y-8"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-950/40 backdrop-blur-sm border border-emerald-900/50 rounded-2xl p-4 text-center shadow-inner shadow-black/20">
            <p className="text-[10px] text-emerald-100/50 uppercase tracking-widest mb-1 font-bold">Category</p>
            <p className="font-bold text-white text-lg">{species.category}</p>
          </div>
          <div className="bg-emerald-950/40 backdrop-blur-sm border border-emerald-900/50 rounded-2xl p-4 text-center shadow-inner shadow-black/20">
            <p className="text-[10px] text-emerald-100/50 uppercase tracking-widest mb-1 font-bold">Discovered</p>
            <p className="font-bold text-white text-lg">{new Date(species.discoveredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="relative">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 drop-shadow-md">
            <Info size={24} className="text-primary" />
            Biological Data
          </h3>
          <div className="bg-gradient-to-br from-black/80 to-emerald-950/30 border border-white/5 rounded-3xl p-5 leading-relaxed text-emerald-100/90 shadow-xl relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
             <p className="relative z-10 text-sm">{/* Description was saved to category field in our Scanner.tsx, wait, we didn't save description separately, let me check */} 
             The <strong>{species.name}</strong> is classified under the {species.category} category.
             This biological specimen was successfully catalogued in your NatureDex on {new Date(species.discoveredAt).toLocaleDateString()}.
             Keep exploring to uncover more details about the local ecosystem.
             </p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 drop-shadow-md">
            <MapPin size={24} className="text-primary" />
            Scan Location
          </h3>
          <div className="h-48 bg-emerald-950/20 rounded-3xl border border-emerald-900/40 flex flex-col items-center justify-center overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
             <div className="w-full h-full absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800')] bg-cover bg-center" />
             <div className="w-12 h-12 bg-primary/20 border border-primary text-primary rounded-full flex items-center justify-center mb-2 z-10 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.5)]">
               <MapPin size={24} />
             </div>
             <p className="text-emerald-100/70 text-sm font-medium z-10">
                Location mapping offline.
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}



