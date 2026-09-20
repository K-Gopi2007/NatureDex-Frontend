import React from 'react';
import { useAuth } from '../store/AuthContext';
import { Leaf, Award, Star } from 'lucide-react';
import { useExplorerProfile } from '../hooks/useExplorerProfile';
import LoadingScreen from '../components/ui/LoadingScreen';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const { profile, loading } = useExplorerProfile();

  if (!user) {
    return <div>Not logged in</div>;
  }

  if (loading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 px-6 text-white">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-primary">Explorer Profile</h1>
        
        <div className="bg-emerald-950/40 border border-emerald-900/50 rounded-2xl p-6 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Award size={100} />
          </div>
          <div className="w-24 h-24 mx-auto bg-emerald-900 border-2 border-primary rounded-full overflow-hidden mb-4 relative z-10">
            <img src={user.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold relative z-10">{user.username}</h2>
          <p className="text-emerald-400 font-medium mb-1 relative z-10">{profile.rank}</p>
          <p className="text-emerald-400/50 text-sm relative z-10">{user.email}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-emerald-950/40 border border-emerald-900/50 rounded-xl p-4 text-center">
            <p className="text-sm text-emerald-400/70 uppercase tracking-wider mb-1">Level</p>
            <p className="text-3xl font-black text-white">{profile.level}</p>
          </div>
          <div className="bg-emerald-950/40 border border-emerald-900/50 rounded-xl p-4 text-center">
            <p className="text-sm text-emerald-400/70 uppercase tracking-wider mb-1">XP</p>
            <p className="text-3xl font-black text-white">{profile.xp}</p>
          </div>
          <div className="bg-emerald-950/40 border border-emerald-900/50 rounded-xl p-4 text-center col-span-2 flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm text-emerald-400/70 uppercase tracking-wider mb-1">Total Discoveries</p>
              <p className="text-3xl font-black text-white">{profile.total_discoveries}</p>
            </div>
            <div className="bg-primary/20 p-4 rounded-full">
              <Leaf size={32} className="text-primary" />
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="text-yellow-500" size={20} />
            Achievements
          </h3>
          <div className="space-y-3">
            {profile.achievements.length === 0 && (
              <p className="text-gray-500 italic text-center py-4 bg-gray-900/30 rounded-xl">No achievements unlocked yet.</p>
            )}
            {profile.achievements.map((ach) => (
              <div key={ach.id} className="bg-gray-900/50 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-900/30 rounded-full flex items-center justify-center text-2xl border border-yellow-500/30">
                  {ach.icon}
                </div>
                <div>
                  <h4 className="font-bold text-white">{ach.title}</h4>
                  <p className="text-sm text-gray-400">{ach.description}</p>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase">Unlocked on {new Date(ach.unlockedAt!).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={logout}
          className="w-full py-3 bg-red-900/30 text-red-400 font-bold border border-red-900/50 rounded-xl hover:bg-red-900/50 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
