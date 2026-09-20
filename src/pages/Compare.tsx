import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../services/api';
import { Scale, Plus, X, Search, ChevronDown } from 'lucide-react';
import LoadingScreen from '../components/ui/LoadingScreen';

interface Species {
  id: number;
  common_name: string;
  scientific_name: string;
  category: string;
  habitat: string;
  distribution: string;
  conservation_status: string;
  diet: string;
  size: string;
  lifespan: string;
}

const Compare: React.FC = () => {
  const [allSpecies, setAllSpecies] = useState<Species[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [comparedData, setComparedData] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const loadSpecies = async () => {
      try {
        const res = await fetchWithAuth('/species/');
        if (res.ok) {
          const data = await res.json();
          setAllSpecies(data);
        }
      } catch (e) {
        console.error('Failed to load species', e);
      } finally {
        setLoading(false);
      }
    };
    loadSpecies();
  }, []);

  const handleCompare = async () => {
    if (selectedIds.length < 2) return;
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/species/compare?ids=${selectedIds.join(',')}`);
      if (res.ok) {
        const data = await res.json();
        setComparedData(data);
      }
    } catch (e) {
      console.error('Comparison failed', e);
    } finally {
      setLoading(false);
    }
  };

  const addSpecies = (id: number) => {
    if (selectedIds.length >= 3) return;
    if (!selectedIds.includes(id)) {
      setSelectedIds(prev => [...prev, id]);
    }
    setIsDropdownOpen(false);
  };

  const removeSpecies = (id: number) => {
    setSelectedIds(prev => prev.filter(i => i !== id));
    setComparedData(prev => prev.filter(s => s.id !== id));
  };

  if (loading && allSpecies.length === 0) return <LoadingScreen message="Loading database..." />;

  const attributes = [
    { label: "Category", key: "category" as keyof Species },
    { label: "Habitat", key: "habitat" as keyof Species },
    { label: "Diet", key: "diet" as keyof Species },
    { label: "Size", key: "size" as keyof Species },
    { label: "Lifespan", key: "lifespan" as keyof Species },
    { label: "Conservation Status", key: "conservation_status" as keyof Species },
    { label: "Distribution", key: "distribution" as keyof Species },
  ];

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 px-6 text-white relative">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-8 text-primary">
          <Scale size={32} />
          <h1 className="text-3xl font-black uppercase tracking-widest">Species Comparison</h1>
        </div>

        {/* Selection Area */}
        <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Select Species to Compare (2-3)</h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            {selectedIds.map(id => {
              const sp = allSpecies.find(s => s.id === id);
              return (
                <div key={id} className="bg-primary/20 border border-primary/40 rounded-xl px-4 py-2 flex items-center gap-3">
                  <span className="font-bold">{sp?.common_name}</span>
                  <button onClick={() => removeSpecies(id)} className="text-primary hover:text-white transition">
                    <X size={16} />
                  </button>
                </div>
              );
            })}
            
            {selectedIds.length < 3 && (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-gray-900 border border-dashed border-gray-600 text-gray-400 rounded-xl px-4 py-2 flex items-center gap-2 hover:bg-gray-800 hover:border-gray-500 transition"
                >
                  <Plus size={16} /> Add Species <ChevronDown size={14} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 max-h-60 overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50">
                    <div className="sticky top-0 bg-gray-900 p-2 border-b border-gray-700">
                      <div className="relative">
                        <Search size={14} className="absolute left-2 top-2.5 text-gray-400" />
                        <input type="text" placeholder="Search..." className="w-full bg-black border border-gray-700 rounded-lg pl-8 pr-2 py-1.5 text-sm text-white focus:outline-none focus:border-primary" />
                      </div>
                    </div>
                    {allSpecies.filter(s => !selectedIds.includes(s.id)).map(s => (
                      <button 
                        key={s.id}
                        onClick={() => addSpecies(s.id)}
                        className="w-full text-left px-4 py-2 hover:bg-emerald-900/50 transition text-sm"
                      >
                        {s.common_name} <span className="text-gray-500 italic text-xs ml-1">{s.scientific_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={handleCompare}
            disabled={selectedIds.length < 2 || loading}
            className="w-full py-3 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Comparing..." : "Compare"}
          </button>
        </div>

        {/* Comparison Table */}
        {comparedData.length >= 2 && (
          <div className="bg-gray-900/40 border border-white/5 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr>
                  <th className="p-4 bg-black/40 font-bold text-gray-400 border-b border-white/10 w-1/4">Attribute</th>
                  {comparedData.map(sp => (
                    <th key={sp.id} className="p-4 bg-emerald-950/20 border-b border-white/10 border-l border-white/5 w-1/4">
                      <div className="text-lg font-black text-white">{sp.common_name}</div>
                      <div className="text-xs italic text-primary/70">{sp.scientific_name}</div>
                    </th>
                  ))}
                  {/* Empty cell if only 2 species compared to keep layout stable */}
                  {comparedData.length === 2 && <th className="p-4 bg-black/20 border-b border-white/10 border-l border-white/5 w-1/4"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {attributes.map((attr, idx) => (
                  <tr key={attr.key} className={idx % 2 === 0 ? "bg-black/20" : "bg-transparent"}>
                    <td className="p-4 text-sm font-bold text-gray-400 border-r border-white/5 uppercase tracking-wider">{attr.label}</td>
                    {comparedData.map(sp => (
                      <td key={sp.id} className="p-4 text-sm text-gray-200 border-r border-white/5 align-top">
                        {sp[attr.key] || <span className="text-gray-600 italic">Unknown</span>}
                      </td>
                    ))}
                    {comparedData.length === 2 && <td className="p-4 bg-black/20"></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
