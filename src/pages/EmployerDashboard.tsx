import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Plus, Users, ShieldCheck, Lock, 
  ArrowRight, CheckCircle2, Clock, MapPin, DollarSign, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { EmployerProfile, Job, DigitalAgreement, PaymentRecord } from '../types.ts';

interface EmployerDashboardProps {
  onNavigate: (tab: string) => void;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [employer, setEmployer] = useState<EmployerProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [agreements, setAgreements] = useState<DigitalAgreement[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // New Job Form State (no defaults)
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [wage, setWage] = useState('');
  const [duration, setDuration] = useState('');
  const [workersCount, setWorkersCount] = useState('');
  const [description, setDescription] = useState('');

  const loadData = () => {
    fetch('/api/employers')
      .then(res => res.json())
      .then(emps => {
        const found = emps.find((e: EmployerProfile) => e.userId === currentUser?.id) || emps[0];
        setEmployer(found);
      });

    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => setJobs(data));

    fetch('/api/agreements')
      .then(res => res.json())
      .then(data => setAgreements(data));

    fetch('/api/payments')
      .then(res => res.json())
      .then(data => setPayments(data));
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || `Looking for experienced workers in ${city} for ${duration}.`,
          requiredSkills: skills.split(',').map(s => s.trim()),
          location: { city, state: 'Telangana', area },
          wage: Number(wage),
          wageType: 'daily',
          duration,
          numberOfWorkers: Number(workersCount)
        })
      });
      if (res.ok) {
        setIsPostModalOpen(false);
        loadData();
        // Reset
        setTitle('');
        setDescription('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img 
            src={employer?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'} 
            alt="Employer" 
            className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 shadow-xs" 
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{employer?.companyName || 'Apex Infra'}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                <span>Verified</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-3 mt-1">
              <span>{employer?.contactPerson}</span>
              <span>•</span>
              <span>{employer?.industry}</span>
              <span>•</span>
              <span>{employer?.location.city}, {employer?.location.state}</span>
              <span>•</span>
              <span className="text-orange-600 font-bold">★ {employer?.ratingsAverage} / 5.0</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPostModalOpen(true)}
          className="px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post a Job</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Jobs</span>
            <Briefcase className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{jobs.length}</div>
          <div className="text-xs text-slate-500 mt-1">Open for applications</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Hired Workers</span>
            <Users className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">4 Workers</div>
          <div className="text-xs text-slate-500 mt-1">Under active agreements</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Escrow Committed</span>
            <Lock className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">₹24,500</div>
          <div className="text-xs text-orange-700 font-semibold mt-1">Protected in escrow</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Employer Rating</span>
            <ShieldCheck className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">4.9 ★</div>
          <div className="text-xs text-slate-500 mt-1">On-time milestone releases</div>
        </div>
      </div>

      {/* Posted Jobs & Candidate Matches */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Active Job Postings</h2>
            <p className="text-xs text-slate-500">
              Manage your job posts and review matched candidate profiles.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">{job.title}</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-bold">
                    {job.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-3">
                  <span>{job.location.city} ({job.location.area})</span>
                  <span>•</span>
                  <span>₹{job.wage} / {job.wageType}</span>
                  <span>•</span>
                  <span>{job.duration}</span>
                  <span>•</span>
                  <span className="font-semibold text-orange-700">{job.applicantsCount} Applicants</span>
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {job.requiredSkills.map((sk, idx) => (
                    <span key={idx} className="text-[10px] bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => onNavigate('matching')}
                  className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>View Matches</span>
                </button>
                <button
                  onClick={() => onNavigate('agreements')}
                  className="flex-1 md:flex-none px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Create Agreement
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post Job Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-base">Post a Job</h3>
              </div>
              <button 
                onClick={() => setIsPostModalOpen(false)}
                className="p-1 rounded hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostJob} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Solar Rooftop Wiring & Inverter Installation"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Required Skills (comma separated)</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Industrial Electrician, Panel Wiring"
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Hyderabad"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Area / Worksite</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. HITEC City"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daily Wage (₹)</label>
                  <input 
                    type="number"
                    required
                    placeholder="e.g. 1100"
                    value={wage}
                    onChange={e => setWage(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. 15 Days"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Workers Needed</label>
                  <input 
                    type="number"
                    required
                    placeholder="e.g. 2"
                    value={workersCount}
                    onChange={e => setWorkersCount(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Scope</label>
                <textarea 
                  rows={3}
                  placeholder="Outline work deliverables, schedule, and requirements..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 text-[11px] text-orange-950 leading-relaxed">
                <strong>Payment Protection:</strong> When you execute a digital agreement, milestone funds are deposited safely into demo escrow.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white cursor-pointer shadow-xs"
                >
                  Publish Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
