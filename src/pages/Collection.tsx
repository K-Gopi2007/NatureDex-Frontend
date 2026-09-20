import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import SpeciesCard from "../components/species/SpeciesCard";
import { useDiscoveries } from "../hooks/useDiscoveries";

const CATEGORIES = ["All", "Animals", "Birds", "Insects", "Fish", "Plants"];

export default function Collection() {
  const { discoveries } = useDiscoveries();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDiscoveries = discoveries.filter(d => {
    const matchesCategory = activeCategory === "All" || d.category.toLowerCase() === activeCategory.toLowerCase() || (activeCategory === "Animals" && d.category.toLowerCase() === "animal") || (activeCategory === "Birds" && d.category.toLowerCase() === "bird") || (activeCategory === "Insects" && d.category.toLowerCase() === "insect") || (activeCategory === "Plants" && d.category.toLowerCase() === "plant");
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 pb-24"
    >
      <header className="mb-6 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">My NatureDex</h1>
          <p className="text-emerald-100/70">{discoveries.length} species discovered</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search discoveries..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 -mx-6 px-6 no-scrollbar" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {CATEGORIES.map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-emerald-900/50 text-emerald-100/70 hover:bg-emerald-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredDiscoveries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-slate-400 text-lg mb-2">No species found</p>
          {discoveries.length === 0 ? (
            <p className="text-sm text-slate-500">Scan something in the wild to add it to your collection!</p>
          ) : (
            <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredDiscoveries.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
              >
                <SpeciesCard 
                  id={item.id}
                  name={item.name}
                  category={item.category}
                  imageUrl={item.imageUrl}
                  date={new Date(item.discoveredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

