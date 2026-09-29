import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../services/api';
import { Users, Upload, CheckCircle, Clock, XCircle, MapPin, Image as ImageIcon, FileText, Calendar, Plus } from 'lucide-react';
import LoadingScreen from '../components/ui/LoadingScreen';

interface Contribution {
  id: number;
  species_id?: number;
  image_url?: string;
  observation_notes?: string;
  status: string;
  submitted_at: string;
}

const Contributions: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [speciesName, setSpeciesName] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [obsDate, setObsDate] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchContributions = async () => {
    try {
      const res = await fetchWithAuth('/contributions/me');
      if (res.ok) {
        const data = await res.json();
        // Sort descending
        setContributions(data.sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()));
      }
    } catch (e) {
      console.error("Failed to load contributions", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubmitError('');
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setSubmitError('Invalid image format. Please upload a JPG, PNG, or WEBP.');
        setImageFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setSubmitError('Image size must be less than 5MB.');
        setImageFile(null);
        return;
      }
      setImageFile(file);
    }
  };

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(6));
          setLng(pos.coords.longitude.toFixed(6));
        },
        () => setSubmitError('Unable to detect location. Please enter manually.')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    // Validation
    if (!speciesName.trim() || !description.trim() || !lat || !lng || !obsDate || !imageFile) {
      setSubmitError('All fields are required, including an image.');
      return;
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      setSubmitError('Latitude must be a valid number between -90 and 90.');
      return;
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      setSubmitError('Longitude must be a valid number between -180 and 180.');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate image upload by creating a local object URL (In a real app, this would be a cloud upload)
      const imageUrl = URL.createObjectURL(imageFile);

      const payload = {
        species_name: speciesName,
        observation_notes: description,
        location_lat: latitude,
        location_lng: longitude,
        observation_date: obsDate,
        image_url: imageUrl
      };

      const res = await fetchWithAuth('/contributions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to submit contribution.');
      }

      setSubmitSuccess(true);
      
      // Reset form
      setSpeciesName('');
      setDescription('');
      setLat('');
      setLng('');
      setObsDate('');
      setImageFile(null);
      setShowForm(false);
      
      // Refresh list
      await fetchContributions();

    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading contributions..." />;

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 px-4 sm:px-6 text-white relative">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <div className="flex items-center gap-3 text-primary mb-4 sm:mb-0">
            <Users size={32} />
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest">Citizen Science</h1>
          </div>
          {!showForm && (
            <button 
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-primary text-black font-bold uppercase rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-2 transition hover:bg-emerald-400 hover:scale-105"
            >
              <Plus size={18} /> New Sighting
            </button>
          )}
        </div>
        
        {/* Form Section */}
        {showForm && (
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-2xl p-4 sm:p-6 mb-8 relative overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <h2 className="text-xl font-bold mb-4 border-b border-emerald-900/50 pb-2">Submit New Sighting</h2>
            
            {submitError && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
                {submitError}
              </div>
            )}
            
            {submitSuccess && (
              <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                <CheckCircle size={16} /> Submission received successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1">Species Name *</label>
                  <input 
                    type="text" 
                    value={speciesName}
                    onChange={e => setSpeciesName(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition"
                    placeholder="E.g. Monarch Butterfly"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1">Observation Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-gray-500" size={16} />
                    <input 
                      type="date" 
                      value={obsDate}
                      onChange={e => setObsDate(e.target.value)}
                      className="w-full bg-black border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">Description / Notes *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-500" size={16} />
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary transition min-h-[100px]"
                    placeholder="Describe behavior, habitat, condition, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1 flex justify-between">
                    <span>Latitude *</span>
                    <button type="button" onClick={handleLocationDetect} className="text-primary text-xs hover:underline flex items-center gap-1">
                      <MapPin size={12} /> Detect
                    </button>
                  </label>
                  <input 
                    type="number" 
                    step="any"
                    value={lat}
                    onChange={e => setLat(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition"
                    placeholder="40.7128"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1">Longitude *</label>
                  <input 
                    type="number" 
                    step="any"
                    value={lng}
                    onChange={e => setLng(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition"
                    placeholder="-74.0060"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">Upload Image *</label>
                <div className="relative flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer bg-black/50 hover:bg-black transition hover:border-primary">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageIcon className="text-gray-500 mb-2" size={24} />
                            <p className="text-sm text-gray-400 font-semibold">{imageFile ? imageFile.name : 'Click to upload image'}</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP (Max 5MB)</p>
                        </div>
                        <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                    </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-black font-bold uppercase py-3 rounded-lg hover:bg-emerald-400 transition shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {submitting ? <Clock className="animate-spin" size={18} /> : <Upload size={18} />}
                  {submitting ? 'Submitting...' : 'Submit Contribution'}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
           <Clock size={20} className="text-primary"/> Your History
        </h3>
        
        {contributions.length === 0 ? (
            <div className="bg-black/40 border border-white/5 rounded-xl p-10 text-center flex flex-col items-center justify-center">
                <ImageIcon size={48} className="text-gray-800 mb-4" />
                <p className="text-gray-500 text-lg">You haven't made any contributions yet.</p>
                <p className="text-gray-600 text-sm mt-2">Submit a rare sighting to help build the NatureDex global database.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {contributions.map(c => (
                    <div key={c.id} className="bg-gray-900/60 border border-white/10 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition hover:bg-gray-900">
                        <div className="flex gap-4">
                          {c.image_url ? (
                            <div className="w-16 h-16 rounded-lg bg-black border border-gray-800 overflow-hidden shrink-0 flex items-center justify-center">
                              <img src={c.image_url} alt="Observation" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-black border border-gray-800 shrink-0 flex items-center justify-center text-gray-700">
                              <ImageIcon size={20} />
                            </div>
                          )}
                          <div>
                              <p className="font-bold text-lg text-emerald-100 flex items-center gap-2">
                                Observation #{c.id}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                <Calendar size={12}/> {new Date(c.submitted_at).toLocaleDateString()}
                              </p>
                              {c.observation_notes && (
                                <p className="text-sm mt-2 text-gray-300 italic max-w-xl line-clamp-2 leading-relaxed">
                                  "{c.observation_notes}"
                                </p>
                              )}
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center sm:justify-end border-t sm:border-t-0 border-gray-800 pt-3 sm:pt-0">
                            {c.status === 'approved' && <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]"><CheckCircle size={14}/> Approved</span>}
                            {c.status === 'pending' && <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-full text-sm font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]"><Clock size={14}/> Pending</span>}
                            {c.status === 'rejected' && <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-500 border border-red-500/30 rounded-full text-sm font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)]"><XCircle size={14}/> Rejected</span>}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Contributions;
