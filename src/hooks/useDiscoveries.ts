import { useState, useEffect } from 'react';

export interface Discovery {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  imageUrl: string;
  discoveredAt: string;
}

export function useDiscoveries() {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('naturedex_discoveries');
    if (saved) {
      try {
        setDiscoveries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse discoveries", e);
      }
    }
  }, []);

  const saveDiscovery = (discovery: Omit<Discovery, 'id' | 'discoveredAt'>) => {
    const newDiscovery: Discovery = {
      ...discovery,
      id: Math.random().toString(36).substring(7),
      discoveredAt: new Date().toISOString()
    };
    
    setDiscoveries(prev => {
      const updated = [newDiscovery, ...prev];
      localStorage.setItem('naturedex_discoveries', JSON.stringify(updated));
      return updated;
    });
    
    return newDiscovery;
  };

  return { discoveries, saveDiscovery };
}
