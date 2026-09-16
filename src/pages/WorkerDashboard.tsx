import React, { useState, useEffect } from 'react';
import { 
  Award, ShieldCheck, Briefcase, FileText, Lock, 
  ArrowRight, CheckCircle2, AlertCircle, Sparkles, 
  TrendingUp, MapPin, Calendar, Clock, DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { WorkerProfile, DigitalAgreement, Job, PaymentRecord } from '../types.ts';
import { AiSkillScoringModal } from '../components/AiSkillScoringModal.tsx';

interface WorkerDashboardProps {
  onNavigate: (tab: string) => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ onNavigate }) => {
  const { currentUser, seedDatabaseDemo } = useAuth();
  const { t } = useLanguage();
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [agreements, setAgreements] = useState<DigitalAgreement[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/workers')
      .then(res => res.json())
      .then(workers => {
        const found = (Array.isArray(workers) ? workers : []).find((w: WorkerProfile) => w.userId === currentUser?.id) || workers?.[0] || null;
        setWorker(found);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));

    fetch('/api/agreements')
      .then(res => res.json())
      .then(data => setAgreements(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => setJobs(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(err => console.error(err));

    fetch('/api/payments')
      .then(res => res.json())
      .then(data => setPayments(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, [currentUser]);

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500 font-medium">Loading worker dashboard...</div>;
  }

  if (!worker) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-6 shadow-xs">
        <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Welcome to Your Worker Dashboard</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            You don't have an active worker profile yet. Take our 60-second AI Skill Assessment to get accredited, or load demo trade data to explore.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch AI Skill Assessment</span>
          </button>
          <button
            onClick={async () => {
              await seedDatabaseDemo();
              window.location.reload();
            }}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-bold transition-all cursor-pointer"
          >
            Load Sample Profile
          </button>
        </div>
        <AiSkillScoringModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          onScoreSuccess={() => window.location.reload()}
        />
      </div>
    );
  }

  const activeAgreement = agreements.find(a => a.status === 'active' || a.status === 'pending_worker_acceptance');

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img 
            src={worker.avatarUrl} 
            alt={worker.fullName} 
            className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500 shadow-xs" 
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{worker.fullName}</h1>
              {worker.verificationStatus === 'verified' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>NavAstitva Verified</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {worker.location.city}, {worker.location.state}
              </span>
              <span>•</span>
              <span>{worker.experienceYears} Years Experience</span>
              <span>•</span>
              <span className="text-orange-600 font-semibold">₹{worker.preferredDailyWage} / Day</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Skill Scoring</span>
          </button>
          <button
            onClick={() => onNavigate('evidence')}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Submit Evidence</span>
          </button>
          <button
            onClick={() => onNavigate('worker-profile')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Public Profile
          </button>
        </div>
      </div>

      {/* Trust Score & Key Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trust Score Card */}
        <div className="bg-gradient-to-br from-purple-800 to-indigo-950 rounded-2xl text-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                Explainable Trust Score
              </span>
              <Award className="w-5 h-5 text-orange-400" />
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-black tracking-tight text-white">{worker.trustScore}</span>
              <span className="text-orange-300 font-semibold text-lg">/ 100</span>
            </div>

            <p className="text-xs text-purple-100/90 leading-relaxed mb-4">
              Your score reflects {worker.skills.filter(s => s.isVerified).length} verified skills, {worker.jobsCompleted} completed digital jobs, and {worker.ratingsAverage}★ employer reviews.
            </p>

            <div className="space-y-2 text-xs border-t border-purple-700/60 pt-3">
              <div className="flex justify-between">
                <span className="text-purple-200">Verified Skills</span>
                <span className="font-bold">30 / 30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Authenticated Evidence</span>
                <span className="font-bold">20 / 25</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Completed Work History</span>
                <span className="font-bold">18 / 25</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Employer Ratings (4.8★)</span>
                <span className="font-bold">18 / 20</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('trust-score')}
            className="w-full mt-5 py-2.5 rounded-xl bg-white text-purple-900 hover:bg-purple-50 text-xs font-bold tracking-wide transition-all text-center cursor-pointer shadow-xs"
          >
            View Full Score Breakdown & Insights
          </button>
        </div>

        {/* Active Digital Agreement */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Digital Agreement
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold">
                {activeAgreement?.status === 'active' ? 'Active' : 'Pending Signature'}
              </span>
            </div>

            {activeAgreement ? (
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                  {activeAgreement.jobTitle}
                </h3>
                <div className="text-xs text-slate-600 space-y-1">
                  <div><strong>Employer:</strong> {activeAgreement.employerName}</div>
                  <div><strong>Contract Value:</strong> ₹{activeAgreement.wage * 12} (12 Days)</div>
                  <div><strong>Escrow Status:</strong> <span className="text-purple-700 font-bold">₹12,000 DEMO-HELD</span></div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <div className="font-semibold text-slate-900 mb-1">Contract Milestone Terms:</div>
                  {activeAgreement.paymentTerms}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4">No active work agreement at this moment.</p>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onNavigate('agreements')}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all text-center cursor-pointer"
            >
              Open Agreement
            </button>
            <button
              onClick={() => onNavigate('progress')}
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              Update Progress
            </button>
          </div>
        </div>

        {/* Verified Skills & Badges */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Verified Skill Portfolio
              </span>
              <ShieldCheck className="w-5 h-5 text-purple-600" />
            </div>

            <div className="space-y-2.5">
              {worker.skills.map((s, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{s.name}</div>
                    <div className="text-[10px] text-slate-500">{s.yearsOfExperience} yrs • {s.proficiency}</div>
                  </div>
                  {s.isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Unverified
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {worker.badges.map((b, idx) => (
                <span key={idx} className="text-[10px] font-bold px-2 py-1 rounded bg-orange-50 text-orange-900 border border-orange-200">
                  ★ {b}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="w-full mt-4 py-2.5 rounded-xl border border-purple-300 hover:bg-purple-50 text-purple-700 text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>AI Skill Scoring for Portfolio</span>
          </button>
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span>AI Recommended Jobs for You</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                Smart Match
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Matched based on your verified skills, location proximity in Hyderabad, and ₹{worker.preferredDailyWage} daily rate.
            </p>
          </div>

          <button
            onClick={() => onNavigate('jobs')}
            className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-xs font-black">
                    <Sparkles className="w-3 h-3 text-orange-500" />
                    92% Match
                  </span>
                  <span className="text-xs font-bold text-orange-600">₹{job.wage} / {job.wageType}</span>
                </div>

                <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2 mb-1">
                  {job.title}
                </h3>
                <div className="text-[11px] text-slate-500 mb-2">
                  {job.employerName} • {job.location.city}
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {job.requiredSkills.map((sk, idx) => (
                    <span key={idx} className="text-[10px] bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onNavigate('jobs')}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Apply with Trust Profile
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* AI Skill Scoring Modal */}
      <AiSkillScoringModal 
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onScoreSuccess={(updated) => {
          setWorker(updated);
        }}
      />
    </div>
  );
};
