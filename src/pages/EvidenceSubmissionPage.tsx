import React, { useState, useEffect } from 'react';
import {
  UploadCloud, ShieldCheck, CheckCircle2,
  Sparkles, FileText, Image, Award, Clock, ArrowRight, Loader2, Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { EvidenceItem } from '../types.ts';
import { AiSkillScoringModal } from '../components/AiSkillScoringModal.tsx';

export const EvidenceSubmissionPage: React.FC = () => {
  const { currentUser, updateTrustScore } = useAuth();
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [skillName, setSkillName] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'photo' | 'video' | 'certificate' | 'reference'>('photo');
  const [fileUrl, setFileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [issuer, setIssuer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<EvidenceItem | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const loadEvidence = () => {
    fetch('/api/evidence')
      .then(res => res.json())
      .then(data => setEvidenceList(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadEvidence();
  }, []);

  const samplePresets = [
    {
      skill: 'Industrial & Domestic Electrician',
      title: 'Industrial Busbar & MCB Distribution Panel Installation',
      type: 'photo' as const,
      url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
      desc: 'Complete industrial distribution box wiring with color-coded earthing, RCD breakers, and IS 732 compliance.',
      issuer: 'Apex Commercial Towers Site #4'
    },
    {
      skill: 'Solar Inverter Wiring',
      title: 'Grid-Tie Solar Inverter & DC Isolator Commissioning',
      type: 'certificate' as const,
      url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=800',
      desc: 'Completed 5kW rooftop solar PV array connection with lightning arrestor and bi-directional meter testing.',
      issuer: 'National Institute of Solar Energy (NISE) / Suryamitra'
    },
    {
      skill: 'Sanitary & Plumbing Specialist',
      title: 'CPVC Concealed Piping & Hydrostatic Pressure Test',
      type: 'photo' as const,
      url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
      desc: 'Pressure tested bathroom piping lines up to 10 kg/cm2 without leakage for residential apartment block.',
      issuer: 'Master Plumbers Association of India'
    }
  ];

  const handleApplyPreset = (preset: typeof samplePresets[0]) => {
    setSkillName(preset.skill);
    setTitle(preset.title);
    setType(preset.type);
    setFileUrl(preset.url);
    setDescription(preset.desc);
    setIssuer(preset.issuer);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName: skillName || 'Trade Skill Evidence',
          title,
          type,
          fileUrl: fileUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
          description,
          issuer: issuer || 'Verified Authority'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setLastSubmitted(data.evidence);
        loadEvidence();
        // Reset form without defaults
        setTitle('');
        setDescription('');
        setFileUrl('');
        setIssuer('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner with Direct AI Scoring CTA */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Multi-Factor AI Skill Assessment</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Submit Evidence & Verify Your Skills
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
            Upload profile images, government IDs, trade certificates, and on-site work photos for automated Gemini AI skill scoring and verified Trust Score calculation.
          </p>
        </div>

        <button
          onClick={() => setIsAiModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Camera className="w-4 h-4" />
          <span>Launch AI 4-Step Scoring</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-purple-600" />
                <span>Submit Skill Artifact</span>
              </h2>
              <span className="text-[11px] text-slate-400">Quick Test Samples Available</span>
            </div>

            {/* Quick preset selector */}
            <div className="mb-5 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Click a sample artifact to test AI analysis:
              </div>
              <div className="space-y-1.5">
                {samplePresets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="w-full text-left p-2 rounded-lg bg-white hover:bg-purple-50 text-xs font-semibold text-slate-800 border border-slate-200 hover:border-purple-300 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate">{p.title}</span>
                    <span className="text-[10px] text-purple-700 shrink-0 font-bold ml-2">Load</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Skill Category</label>
                <select
                  value={skillName}
                  onChange={e => setSkillName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                >
                  <option value="">Select a skill category...</option>
                  <option value="Industrial & Domestic Electrician">Industrial & Domestic Electrician</option>
                  <option value="Solar Inverter Wiring">Solar Inverter Wiring</option>
                  <option value="Sanitary & Plumbing Specialist">Sanitary & Plumbing Specialist</option>
                  <option value="Precision Masonry & Tile Laying">Precision Masonry & Tile Laying</option>
                  <option value="Structural Arc & MIG Welding">Structural Arc & MIG Welding</option>
                  <option value="Carpentry & Formwork">Carpentry & Formwork</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Evidence Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3-Phase Main Distribution Board Installation"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Artifact Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="photo">Jobsite Photo</option>
                    <option value="certificate">Government / NSDC Certificate</option>
                    <option value="video">Work Demonstration Video</option>
                    <option value="reference">Employer Work Reference</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Issuer / Site Reference</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NSDC, L&T, or Contractor Name"
                    value={issuer}
                    onChange={e => setIssuer(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image / Document URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={fileUrl}
                  onChange={e => setFileUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Technical Work Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain the work performed, tools used, safety steps taken, and code compliance..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !title || !description || !skillName}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gemini AI Analyzing Evidence Artifact...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit & Run AI Assessment</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* AI Result Card for recently analyzed item */}
          {lastSubmitted?.aiAssessment && (
            <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-200 text-purple-900 text-xs font-black">
                  <Sparkles className="w-3.5 h-3.5" />
                  Instant AI Assessment Output
                </span>
                <span className="text-xs font-black text-purple-900">
                  Confidence: {lastSubmitted.aiAssessment.confidenceScore}%
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-900">{lastSubmitted.title}</h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {lastSubmitted.aiAssessment.explanation}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-purple-200/80">
                <div>
                  <strong className="text-slate-900">Detected Category:</strong> {lastSubmitted.aiAssessment.detectedCategory}
                </div>
                <div>
                  <strong className="text-slate-900">Confidence:</strong> {lastSubmitted.aiAssessment.confidenceScore}%
                </div>
              </div>

              {lastSubmitted.aiAssessment.suggestedQuestions?.length > 0 && (
                <div className="text-xs bg-white p-3 rounded-xl border border-purple-200">
                  <span className="font-bold text-purple-900 block mb-1">
                    Suggested Questions for Human Assessor:
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    {lastSubmitted.aiAssessment.suggestedQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-[11px] text-purple-800 italic">
                ✓ Dispatched to Assessor Portal for final review and Trust Score boost.
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Existing Evidence Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">
              Submitted Work Artifacts ({evidenceList.length})
            </h2>
            <span className="text-xs text-slate-500">Human Assessor Queue & Approvals</span>
          </div>

          {evidenceList.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs space-y-2">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">No Skill Artifacts Submitted</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Select a sample artifact on the left or launch the AI 4-Step scoring modal to submit your profile images, certificates, and work photos.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {evidenceList.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">
                        {ev.skillName}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">{ev.title}</h3>
                      <div className="text-xs text-slate-500">Issued by: {ev.issuer}</div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${ev.status === 'verified'
                      ? 'bg-purple-100 text-purple-800'
                      : ev.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-orange-100 text-orange-800'
                      }`}>
                      {ev.status === 'verified' ? '✓ Assessor Verified' : 'AI Analyzed (Under Review)'}
                    </span>
                  </div>

                  {ev.fileUrl && (
                    <div className="relative rounded-xl overflow-hidden max-h-48 border border-slate-200">
                      <img
                        src={ev.fileUrl}
                        alt={ev.title}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {ev.description}
                  </p>

                  {ev.aiAssessment && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-purple-800">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          AI Analysis Confidence: {ev.aiAssessment.confidenceScore}%
                        </span>
                        <span>Level: {ev.aiAssessment.recommendedAssessmentLevel || 'Verified'}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        {ev.aiAssessment.explanation}
                      </p>
                    </div>
                  )}

                  {ev.verifierNotes && (
                    <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-900">
                      <strong>Assessor Verdict ({ev.verifiedBy}):</strong> {ev.verifierNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interactive AI Skill Scoring Modal */}
      <AiSkillScoringModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onScoreSuccess={(updatedWorker, scoreData) => {
          if (updatedWorker?.trustScore) {
            updateTrustScore(updatedWorker.trustScore);
          }
          loadEvidence();
        }}
      />
    </div>
  );
};
