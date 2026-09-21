import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchWithAuth } from '../services/api';
import { Leaf } from 'lucide-react';
import LoadingScreen from '../components/ui/LoadingScreen';

// Custom icons
const discoveryIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface DiscoveryMapItem {
  id: number;
  species_id: number;
  species_name: string;
  location_lat: number;
  location_lng: number;
  discovered_at: string;
}

const MapPage: React.FC = () => {
  const [discoveries, setDiscoveries] = useState<DiscoveryMapItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMapData = async () => {
      try {
        const res = await fetchWithAuth('/map/discoveries');
        if (res.ok) {
          const data = await res.json();
          setDiscoveries(data);
        }
      } catch (error) {
        console.error("Failed to load map data", error);
      } finally {
        setLoading(false);
      }
    };
    loadMapData();
  }, []);

  if (loading) return <LoadingScreen message="Loading world map..." />;

  const defaultCenter: [number, number] = [20, 0];

  return (
    <div className="min-h-screen bg-black pt-16 flex flex-col relative text-white">
      <div className="absolute top-20 left-6 z-[1000] bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
        <h1 className="text-xl font-bold flex items-center gap-2 text-primary">
          <Leaf size={20} />
          Global Discoveries
        </h1>
        <p className="text-sm text-gray-400 mt-1">Explore your ecological footprint</p>
      </div>
      
      <div className="flex-1 w-full h-[calc(100vh-4rem)] z-0">
        <MapContainer 
          center={discoveries.length > 0 ? [discoveries[0].location_lat, discoveries[0].location_lng] : defaultCenter} 
          zoom={3} 
          style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
          zoomControl={false}
        >
          {/* Dark map tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          <MarkerClusterGroup>
            {discoveries.map((discovery) => (
              <Marker 
                key={discovery.id} 
                position={[discovery.location_lat, discovery.location_lng]}
                icon={discoveryIcon}
              >
                <Popup className="scientific-popup">
                  <div className="p-2 text-center">
                    <strong className="text-lg text-emerald-700 block mb-1">{discovery.species_name}</strong>
                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Recorded</span>
                    <span className="text-sm">{new Date(discovery.discovered_at).toLocaleDateString()}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPage;
