import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../services/api';

export interface Achievement {
  id: string | number;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

export interface ExplorerProfile {
  xp: number;
  level: number;
  total_discoveries: number;
  rank: string;
  achievements: Achievement[];
}

export function useExplorerProfile() {
  const [profile, setProfile] = useState<ExplorerProfile>({
    xp: 0, level: 1, total_discoveries: 0, rank: 'Novice Explorer', achievements: []
  });
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetchWithAuth('/users/me/progress');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (e) {
      console.error("Failed to fetch profile", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const addXP = async (amount: number, category: string, conservationStatus: string = "") => {
    // Let backend handle XP and achievements
    try {
      const res = await fetchWithAuth('/users/me/progress/award', {
        method: 'POST',
        body: JSON.stringify({ species_category: category, conservation_status: conservationStatus })
      });
      
      if (res.ok) {
        const result = await res.json();
        if (result.new_achievements && result.new_achievements.length > 0) {
          // Show the first newly unlocked achievement
          setRecentlyUnlocked(result.new_achievements[0]);
        }
        
        // Refresh the whole profile to get updated XP, level, rank
        fetchProfile();
      }
    } catch (e) {
      console.error("Failed to award progress", e);
    }
  };

  const clearRecentlyUnlocked = () => setRecentlyUnlocked(null);

  return { profile, addXP, recentlyUnlocked, clearRecentlyUnlocked, loading };
}
