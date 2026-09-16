import React, { useState, useEffect } from 'react';
import { 
  Award, ShieldCheck, FileText, Lock, Star, 
  Sparkles, TrendingUp, Check, ArrowRight
} from 'lucide-react';
import { TrustScoreBreakdown } from '../types.ts';

export const TrustScorePage: React.FC = () => {
  const [breakdown, setBreakdown] = useState<TrustScoreBreakdown | null>(null);

  useEffect(() => {
    fetch('/api/trust-score/worker-1')
      .then(res => res.json())
      .then(data => setBreakdown(data))
      .catch(err => console.error(err));
  }, []);

  if (!breakdown) {
    return <div className="p-8 text-center text-slate-500">Calculating Trust Score...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner in Light Purple/Orange Theme */}
      <div className="bg-gradient-to-br from-purple-50 via-orange-50/40 to-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-xs border border-purple-200 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200">
              <Award className="w-3.5 h-3.5 text-purple-700" />
              <span>Explainable Trust Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Trust Score: {breakdown.score} / 100
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Unlike opaque black-box credit scores, NavAstitva provides complete algorithmic transparency. Every point is explainable, earned through verified vocational craftsmanship, completed contracts, and peer reviews.
            </p>
          </div>

          {/* Big Visual Gauge */}
          <div className="shrink-0 flex flex-col items-center justify-center w-40 h-40 rounded-full border-4 border-purple-600 bg-purple-50/80 shadow-xs text-center p-4">
            <span className="text-5xl font-black text-purple-950">{breakdown.score}</span>
            <span className="text-[11px] uppercase tracking-widest text-purple-800 font-bold mt-1">High Trust</span>
            <span className="text-[10px] text-orange-600 font-bold">Top 5% of Trades</span>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars of the Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Verified Skills */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">1. Verified Skills</span>
              <ShieldCheck className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {breakdown.breakdown.verifiedSkillsScore} <span className="text-xs text-slate-400 font-normal">/ 30 pts</span>
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              Based on official NSDC certifications and verified trade proficiency assessments.
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
            <div 
              className="bg-purple-600 h-full rounded-full" 
              style={{ width: `${(breakdown.breakdown.verifiedSkillsScore / 30) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Evidence Quality */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">2. Evidence Quality</span>
              <FileText className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {breakdown.breakdown.evidenceScore} <span className="text-xs text-slate-400 font-normal">/ 25 pts</span>
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              High-resolution work photos, schematics, and client reference letters.
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
            <div 
              className="bg-orange-500 h-full rounded-full" 
              style={{ width: `${(breakdown.breakdown.evidenceScore / 25) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Work History */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">3. Work History</span>
              <Lock className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {breakdown.breakdown.workHistoryScore} <span className="text-xs text-slate-400 font-normal">/ 25 pts</span>
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              Confirmed job completions, zero breach of contract, and repeat hires.
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full" 
              style={{ width: `${(breakdown.breakdown.workHistoryScore / 25) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Ratings & Feedback */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">4. Employer Ratings</span>
              <Star className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {breakdown.breakdown.ratingScore} <span className="text-xs text-slate-400 font-normal">/ 20 pts</span>
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              4.8 / 5.0 average score across punctuality, communication, and work quality.
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full" 
              style={{ width: `${(breakdown.breakdown.ratingScore / 20) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Explanations & Improvement Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Why this score? */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Score Factors & Mathematical Explanations</span>
          </h3>

          <div className="space-y-3">
            {breakdown.factors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="p-1 rounded-full bg-purple-100 text-purple-700 shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs text-slate-700 leading-relaxed font-medium">
                  {factor}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to increase score */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span>Actionable Tips to Reach 95+ Score</span>
          </h3>

          <div className="space-y-3">
            {breakdown.improvementTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-orange-50/50 border border-orange-100">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  +{idx === 0 ? 5 : 4}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 mb-0.5">{tip}</div>
                  <div className="text-[11px] text-slate-500">Completing this step raises your ranking in employer candidate searches.</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
