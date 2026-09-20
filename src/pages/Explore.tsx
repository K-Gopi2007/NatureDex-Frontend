import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchWithAuth } from '../services/api';
import { Compass, Navigation } from 'lucide-react';
import LoadingScreen from '../components/ui/LoadingScreen';

// Custom icons
const nearbyIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface NearbySpecies {
  species_id: number;
  species_name: string;
  location_lat: number;
  location_lng: number;
}

const LocationFlyer: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
};

const ExplorePage: React.FC = () => {
  const [nearby, setNearby] = useState<NearbySpecies[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locateUser = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation([lat, lng]);

        try {
          const res = await fetchWithAuth(`/map/nearby?lat=${lat}&lng=${lng}&radius=50.0`);
          if (res.ok) {
            const data = await res.json();
            setNearby(data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Unable to retrieve your location");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    locateUser();
  }, []);

  return (
    <div className="min-h-screen bg-black pt-16 flex flex-col relative text-white">
      <div className="absolute top-20 left-6 z-[1000] bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg max-w-xs w-full">
        <h1 className="text-xl font-bold flex items-center gap-2 text-amber-500 mb-2">
          <Compass size={20} />
          Explore Hotspots
        </h1>
        {loading && <p className="text-sm text-gray-400 flex items-center gap-2"><Navigation className="animate-spin" size={14}/> Locating...</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {!loading && !error && (
          <p className="text-sm text-gray-400">
            Found {nearby.length} species in your vicinity.
          </p>
        )}
        <button 
          onClick={locateUser}
          className="mt-4 w-full bg-emerald-900/40 border border-emerald-500/50 hover:bg-emerald-800/60 text-emerald-400 py-2 rounded-lg text-sm transition"
        >
          Rescan Area
        </button>
      </div>

      <div className="flex-1 w-full h-[calc(100vh-4rem)] z-0">
        <MapContainer 
          center={userLocation || [20, 0]} 
          zoom={userLocation ? 13 : 3} 
          style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {userLocation && (
            <>
              <LocationFlyer lat={userLocation[0]} lng={userLocation[1]} />
              <Marker position={userLocation} icon={userIcon}>
                <Popup>You are here</Popup>
              </Marker>
              <Circle center={userLocation} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1 }} radius={50000} />
            </>
          )}

          <MarkerClusterGroup>
            {nearby.map((species) => (
              <Marker 
                key={species.species_id} 
                position={[species.location_lat, species.location_lng]}
                icon={nearbyIcon}
              >
                <Popup className="scientific-popup">
                  <div className="p-2 text-center">
                    <strong className="text-lg text-amber-600 block mb-1">{species.species_name}</strong>
                    <span className="text-xs text-gray-500 uppercase tracking-wider block">Spotted Nearby</span>
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

export default ExplorePage;
