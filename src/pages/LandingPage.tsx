import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Award, Briefcase, Lock, 
  ArrowRight, Users, Sparkles, Mic, PhoneCall, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { PlatformStats } from '../types.ts';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onOpenVoiceModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenVoiceModal }) => {
  const { currentUser, openAuthModal } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section: Red & Orange Warm Styling */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-red-50/40 to-white text-slate-900 p-6 sm:p-10 lg:p-12 shadow-xs border border-orange-200">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-800 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Verified Skills • Milestone Escrow</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900">
            Verified Skills. Fair Contracts. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Guaranteed Payments.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Directly connect skilled trade professionals with verified employers through digital agreements, transparent skill ratings, and secured milestone escrow.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {currentUser ? (
              <button
                onClick={() => onNavigate(currentUser.role === 'employer' ? 'employer-dashboard' : currentUser.role === 'admin' ? 'verifier' : currentUser.role === 'csc_operator' ? 'csc' : 'worker-dashboard')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all border border-slate-300 flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <span>Sign In</span>
                </button>
              </>
            )}

            <button
              onClick={() => onNavigate('jobs')}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all border border-slate-300 flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>Explore Jobs</span>
            </button>

            <button
              onClick={onOpenVoiceModal}
              className="px-5 py-3 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 font-bold text-sm transition-all border border-orange-300 flex items-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Voice Assistant</span>
            </button>
          </div>

          {/* Session Info */}
          <div className="pt-4 border-t border-orange-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            {currentUser ? (
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span>Signed in as <strong>{currentUser.name}</strong></span>
                <span className="text-slate-400">•</span>
                <span className="capitalize text-orange-600 font-semibold">{currentUser.role.replace('_', ' ')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-500">
                <span>Fast onboarding for workers, employers, and assessors.</span>
              </div>
            )}
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-orange-200/40 blur-3xl pointer-events-none"></div>
      </section>

      {/* Role Cards: Simplified & Clean */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Worker Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-orange-300 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Skilled Workers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Showcase certificates and work photos. Build a verified trust profile with guaranteed payouts.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Verified skill badge & trust score</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Milestone escrow payment security</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Digitally signed work contracts</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => {
              if (currentUser?.role === 'worker') onNavigate('worker-dashboard');
              else openAuthModal('signup', 'worker');
            }}
            className="mt-5 w-full py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold transition-colors cursor-pointer border border-orange-200"
          >
            {currentUser?.role === 'worker' ? 'Open Worker Dashboard' : 'Join as a Worker'}
          </button>
        </div>

        {/* Employer Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-red-300 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Verified Employers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Post projects, match with verified local artisans, and manage payments transparently.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>Skill-matched candidate search</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>Protected escrow vault releases</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>Direct digital contracts</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => {
              if (currentUser?.role === 'employer') onNavigate('employer-dashboard');
              else openAuthModal('signup', 'employer');
            }}
            className="mt-5 w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold transition-colors cursor-pointer border border-red-200"
          >
            {currentUser?.role === 'employer' ? 'Open Employer Dashboard' : 'Post Jobs as Employer'}
          </button>
        </div>

        {/* Assessor Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-orange-300 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Assessors</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Review submitted evidence artifacts, certify trade skills, and help resolve disputes.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Evidence verification queue</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Trade certificate audits</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Objective dispute mediation</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => {
              if (currentUser?.role === 'admin') onNavigate('verifier');
              else openAuthModal('signin');
            }}
            className="mt-5 w-full py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold transition-colors cursor-pointer border border-orange-200"
          >
            {currentUser?.role === 'admin' ? 'Open Assessor Desk' : 'Assessor Sign In'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.registeredWorkers.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Skilled artisans & technicians</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.verifiedSkills.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Certified skills & diplomas</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Protected Escrow</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{(stats.paymentsProtectedInr / 100000).toFixed(1)} Lakhs
            </div>
            <p className="text-xs text-slate-500 mt-1">Guaranteed milestone payments</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Award className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Trust Score</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.averageTrustScore} / 100
            </div>
            <p className="text-xs text-slate-500 mt-1">Transparent score based on work</p>
          </div>
        </section>
      )}

      {/* Inclusive Rural Access Banner */}
      <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-orange-50 via-red-50/50 to-white border border-orange-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold">
            <PhoneCall className="w-3.5 h-3.5 text-orange-600" />
            <span>Assisted Onboarding</span>
          </div>
          <h3 className="text-xl font-black text-slate-900">
            CSC Village Access Desk
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
            Local CSC operators help workers without smartphones register, upload trade credentials, and receive job alerts.
          </p>
        </div>

        <button
          onClick={() => onNavigate('csc')}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-bold tracking-wide shrink-0 transition-all cursor-pointer shadow-xs"
        >
          Open CSC Desk
        </button>
      </section>
    </div>
  );
};
