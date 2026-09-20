import { motion } from "framer-motion";
import SpeciesCard from "../components/species/SpeciesCard";
import { GlassCard } from "../components/ui/GlassCard";
import { Compass, Trophy } from "lucide-react";
import { useDiscoveries } from "../hooks/useDiscoveries";
import { useExplorerProfile } from "../hooks/useExplorerProfile";

export default function Home() {
  const { discoveries } = useDiscoveries();
  const { profile } = useExplorerProfile();

  const recentDiscoveries = discoveries.slice(0, 4);
  const xpProgress = (profile.xp % 500) / 500 * 100;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 pb-24 space-y-8"
    >
      <header className="pt-4 flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
            Nature<span className="text-primary">Dex</span>
          </h1>
          <p className="text-emerald-100/60 text-sm font-medium">Scan. Discover. Collect.</p>
        </div>
      </header>

      {/* Explorer Profile Card */}
      <GlassCard className="p-5 border-primary/30 bg-gradient-to-br from-emerald-900/40 to-black/60 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-black/50 border border-primary/50 flex items-center justify-center shadow-[inset_0_0_15px_rgba(16,185,129,0.3)]">
              <Trophy className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-0.5">Explorer Level</p>
              <h2 className="text-2xl font-black text-white leading-none">LVL {profile.level}</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-primary font-bold text-lg">{profile.xp} <span className="text-xs text-primary/70">XP</span></p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, type: "spring" }}
              className="h-full bg-gradient-to-r from-primary to-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
            />
          </div>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest text-right mt-2">{profile.xp % 500} / 500 TO LVL {profile.level + 1}</p>
        </div>
      </GlassCard>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 drop-shadow-md">
            <Trophy size={20} className="text-primary" />
            Achievements
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {profile.achievements.map((ach) => (
            <div 
              key={ach.id} 
              className={`p-3 rounded-2xl border transition-all ${ach.unlockedAt ? 'bg-primary/20 border-primary/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-black/40 border-white/5 opacity-50 grayscale'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl drop-shadow-md">{ach.icon}</span>
                <h4 className="text-white font-bold text-sm leading-tight">{ach.title}</h4>
              </div>
              <p className="text-[10px] text-white/60 leading-tight">{ach.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 drop-shadow-md">
            <Compass size={20} className="text-primary" />
            Recent Scans
          </h2>
        </div>
        
        {recentDiscoveries.length === 0 ? (
          <div className="p-8 border border-dashed border-emerald-900/50 rounded-2xl text-center">
            <p className="text-emerald-100/50 text-sm">No discoveries yet.</p>
            <p className="text-emerald-100/50 text-sm mt-1">Tap the scan button to begin your adventure!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {recentDiscoveries.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <SpeciesCard 
                  id={item.id}
                  name={item.name}
                  category={item.category}
                  imageUrl={item.imageUrl}
                  date={new Date(item.discoveredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}

