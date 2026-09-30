import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../services/api';

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
    const fetchDiscoveries = async () => {
      try {
        const response = await fetchWithAuth('/discoveries/');
        if (response.ok) {
          const data = await response.json();
          const safeData = Array.isArray(data) ? data : [];
          setDiscoveries(safeData);
        } else {
          setDiscoveries([]);
        }
      } catch (e) {
        console.error("Failed to fetch discoveries from backend", e);
        setDiscoveries([]);
      }
    };
    fetchDiscoveries();
  }, []);

  const saveDiscovery = async (discovery: any) => {
    try {
      const response = await fetchWithAuth('/discoveries/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          common_name: discovery.name,
          scientific_name: discovery.scientificName,
          category: discovery.category,
          description: discovery.description,
          conservation_status: discovery.conservation_status,
          location_lat: discovery.location_lat,
          location_lng: discovery.location_lng
        })
      });
      if (response.ok) {
        const data = await response.json();
        // The image URL is local right now, we can inject it back for the UI
        data.imageUrl = discovery.imageUrl;
        setDiscoveries(prev => [data, ...prev]);
        return data;
      }
    } catch (e) {
        console.error("Failed to save discovery to backend", e);
    }
    return null;
  };

  return { discoveries, saveDiscovery };
}
