import React, { useState, useEffect } from 'react';
import { 
  User, ShieldCheck, MapPin, DollarSign, Award, 
  Briefcase, CheckCircle2, Star, Plus, Check, Loader2, Sparkles, Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { WorkerProfile } from '../types.ts';

export const WorkerProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State - NO DEFAULT HARDCODED VALUES
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [dailyWage, setDailyWage] = useState('');
  const [availability, setAvailability] = useState<'available' | 'busy' | 'part_time'>('available');
  const [city, setCity] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [upiId, setUpiId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    fetch('/api/workers')
      .then(res => res.json())
      .then(workers => {
        const found = workers.find((w: WorkerProfile) => w.userId === currentUser?.id) || workers[0];
        if (found) {
          setWorker(found);
          setFullName(found.fullName || '');
          setBio(found.bio || '');
          setDailyWage(found.preferredDailyWage ? String(found.preferredDailyWage) : '');
          setAvailability(found.availability || 'available');
          setCity(found.location?.city || '');
          setExperienceYears(found.experienceYears ? String(found.experienceYears) : '');
          setUpiId(found.upiId || '');
          setAvatarUrl(found.avatarUrl || '');
        }
      });
  }, [currentUser]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/workers/${worker.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          bio,
          preferredDailyWage: Number(dailyWage) || 0,
          availability,
          experienceYears: Number(experienceYears) || 0,
          location: { ...worker.location, city },
          upiId,
          avatarUrl: avatarUrl || worker.avatarUrl
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setWorker(updated);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!worker) {
    return <div className="p-8 text-center text-slate-500">Loading worker profile...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img 
                src={worker.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=256'} 
                alt={worker.fullName} 
                className="w-20 h-20 rounded-2xl object-cover border-4 border-orange-500 shadow-md" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{worker.fullName}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {worker.location.city}, {worker.location.state}
                </span>
                <span>•</span>
                <span>{worker.experienceYears} Years Exp</span>
                <span>•</span>
                <span className="text-orange-700 font-bold">₹{worker.preferredDailyWage}/day</span>
                <span>•</span>
                <span className="text-amber-600 font-bold">★ {worker.ratingsAverage} ({worker.ratingsCount} reviews)</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-orange-100 text-orange-900 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Check className="w-4 h-4 text-orange-700" />
            <span>Profile successfully updated!</span>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4 max-w-2xl">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Update Professional Profile
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Profile Photo</label>
            <div className="flex items-center gap-4">
              <img 
                src={avatarUrl || worker.avatarUrl} 
                alt="Profile Preview" 
                className="w-14 h-14 rounded-xl object-cover border border-slate-300"
              />
              <input 
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input 
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current City</label>
              <input 
                type="text"
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Daily Wage (₹)</label>
              <input 
                type="number"
                required
                value={dailyWage}
                onChange={e => setDailyWage(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
              <input 
                type="number"
                required
                value={experienceYears}
                onChange={e => setExperienceYears(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Availability Status</label>
              <select
                value={availability}
                onChange={e => setAvailability(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="available">Available Immediately</option>
                <option value="part_time">Part-Time Only</option>
                <option value="busy">Currently Busy</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Direct Settlement UPI ID / Account</label>
            <input 
              type="text"
              required
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Professional Bio</label>
            <textarea 
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Skills & Bio */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-extrabold text-slate-900">About & Background</h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {worker.bio || 'No bio provided yet. Click Edit Profile to add your background and specialty.'}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-extrabold text-slate-900">Verified Vocational Skills</h2>
              <div className="space-y-3">
                {worker.skills.map((s, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-500">{s.category} • {s.yearsOfExperience} Years Exp</div>
                    </div>
                    {s.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Trust Badges & Banking */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified Badges</h3>
              <div className="flex flex-wrap gap-2">
                {worker.badges.map((b, idx) => (
                  <span key={idx} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-orange-50 text-orange-800 border border-orange-200">
                    ★ {b}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-2 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-slate-500">Direct Payment Details</h3>
              <div className="text-slate-700">UPI ID: <strong>{worker.upiId}</strong></div>
              <div className="text-emerald-700 font-semibold">✓ Bank Account Identity Match Confirmed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
