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
      {/* Hero Section: Light Purple & Orange Theme */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50/80 via-orange-50/30 to-white text-slate-900 p-6 sm:p-10 lg:p-12 shadow-xs border border-purple-100">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-800 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI-Powered Verified Employment Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900">
            Turning Verified Skills into Trust. <br />
            <span className="text-purple-700">Connecting Talent to Guaranteed Opportunity.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed font-normal">
            NavAstitva empowers skilled workers with AI photo & document analysis, transparent Trust Scores, and protected escrow milestone payments.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {currentUser ? (
              <button
                onClick={() => onNavigate(currentUser.role === 'employer' ? 'employer-dashboard' : currentUser.role === 'admin' ? 'verifier' : currentUser.role === 'csc_operator' ? 'csc' : 'worker-dashboard')}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Go to My Dashboard ({currentUser.role.replace('_', ' ')})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>Get Started Free</span>
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
              <span>Explore Marketplace</span>
            </button>

            <button
              onClick={onOpenVoiceModal}
              className="px-5 py-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-sm transition-all border border-orange-200 flex items-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-orange-600 animate-pulse" />
              <span>Voice AI Assistant</span>
            </button>
          </div>

          {/* Session Info */}
          <div className="pt-4 border-t border-purple-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            {currentUser ? (
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Active User: <strong>{currentUser.name}</strong></span>
                <span className="text-slate-400">•</span>
                <span className="capitalize text-purple-700 font-semibold">{currentUser.role.replace('_', ' ')}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{currentUser.phone}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-500">
                <span>Personalized workspaces for Workers, Employers, and Vocational Assessors.</span>
              </div>
            )}
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-purple-200/30 blur-3xl pointer-events-none"></div>
      </section>

      {/* Role-Based Quick Access: Clean, Neat & Simple Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Worker Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">For Skilled Workers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload your photo, government ID, trade certificates, and on-site work photos for instant AI evaluation and verified Trust Scoring.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>AI Photo & Certificate Scoring</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Milestone Payment Escrow Vault</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Digitally Signed Work Contracts</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => {
              if (currentUser?.role === 'worker') onNavigate('worker-dashboard');
              else openAuthModal('signup', 'worker');
            }}
            className="mt-5 w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors cursor-pointer"
          >
            {currentUser?.role === 'worker' ? 'Go to Worker Dashboard' : 'Join as a Worker'}
          </button>
        </div>

        {/* Employer Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-orange-300 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">For Verified Employers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Post real projects without guesswork. Review AI-ranked applicants matched on skills, trade ratings, and location proximity.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Verified Applicant Matching</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Transparent Escrow Protection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>One-Click Digital Agreements</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => {
              if (currentUser?.role === 'employer') onNavigate('employer-dashboard');
              else openAuthModal('signup', 'employer');
            }}
            className="mt-5 w-full py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold transition-colors cursor-pointer"
          >
            {currentUser?.role === 'employer' ? 'Go to Employer Dashboard' : 'Post Jobs as Employer'}
          </button>
        </div>

        {/* Assessor Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Vocational Assessors</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Authorized reviewers verify physical evidence, validate trade authenticity, and resolve contract disputes with transparent logs.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Assessor Verification Queue</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Dispute & Evidence Review</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Audit Trail Certification</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => {
              if (currentUser?.role === 'admin') onNavigate('verifier');
              else openAuthModal('signin');
            }}
            className="mt-5 w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition-colors cursor-pointer"
          >
            {currentUser?.role === 'admin' ? 'Open Assessor Desk' : 'Assessor Sign In'}
          </button>
        </div>
      </div>

      {/* Metrics Row in Clean Light Cards */}
      {stats && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 text-purple-600 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Workers</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.registeredWorkers.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Electrical, solar, plumbing & masonry</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 text-orange-500 mb-2">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified Skills</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.verifiedSkills.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">NSDC, Suryamitra & Assessor certified</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 text-purple-600 mb-2">
              <Lock className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Escrow Protected</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{(stats.paymentsProtectedInr / 100000).toFixed(1)} Lakhs
            </div>
            <p className="text-xs text-slate-500 mt-1">Guaranteed milestone payments</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 text-orange-500 mb-2">
              <Award className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Trust Score</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.averageTrustScore} / 100
            </div>
            <p className="text-xs text-slate-500 mt-1">Transparent explainable metric</p>
          </div>
        </section>
      )}

      {/* Inclusive Rural Access Banner */}
      <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-purple-50/60 via-orange-50/40 to-white border border-purple-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold">
            <PhoneCall className="w-3.5 h-3.5 text-purple-600" />
            <span>Inclusive Access for Feature-Phone Workers</span>
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Assisted Registration at Village CSC Kendras
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
            Authorized Common Service Center (CSC) operators register and upload evidence for workers without smartphones. Voice IVR and SMS alerts keep workers updated in 9 Indian languages.
          </p>
        </div>

        <button
          onClick={() => onNavigate('csc')}
          className="px-5 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold tracking-wide shrink-0 transition-colors cursor-pointer shadow-xs"
        >
          Open CSC Assisted Desk
        </button>
      </section>
    </div>
  );
};
