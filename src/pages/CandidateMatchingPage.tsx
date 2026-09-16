import React, { useState, useEffect } from 'react';
import {
  Users, Sparkles, Award, ShieldCheck, CheckCircle2,
  MapPin, Clock, ArrowRight, FileText, Check, DollarSign, X, Briefcase
} from 'lucide-react';
import { Job, WorkerProfile, MatchScoreDetails } from '../types.ts';

interface CandidateMatchItem {
  worker: WorkerProfile;
  matchDetails: MatchScoreDetails;
}

interface CandidateMatchingPageProps {
  onNavigate: (tab: string) => void;
}

export const CandidateMatchingPage: React.FC<CandidateMatchingPageProps> = ({ onNavigate }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [rankedCandidates, setRankedCandidates] = useState<CandidateMatchItem[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatchItem | null>(null);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);

  // Agreement creation fields - NO DEFAULT VALUES
  const [wage, setWage] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState('');
  const [scope, setScope] = useState('');
  const [isCreatingAgreement, setIsCreatingAgreement] = useState(false);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        const jobList = data || [];
        setJobs(jobList);
        if (jobList.length > 0) {
          setSelectedJob(jobList[0]);
          loadCandidates(jobList[0].id);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const loadCandidates = (jobId: string) => {
    fetch(`/api/matching/candidates/${jobId}`)
      .then(res => res.json())
      .then(data => setRankedCandidates(data || []))
      .catch(err => console.error(err));
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    loadCandidates(job.id);
  };

  const handleOpenAgreement = (cand: CandidateMatchItem) => {
    setSelectedCandidate(cand);
    setWage(selectedJob?.wage ? String(selectedJob.wage) : '');
    setDuration(selectedJob?.duration || '');
    setScope(selectedJob?.description || '');
    setStartDate(new Date().toISOString().split('T')[0]);
    setIsAgreementModalOpen(true);
  };

  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !selectedJob) return;
    setIsCreatingAgreement(true);
    try {
      const res = await fetch('/api/agreements/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJob.id,
          workerId: selectedCandidate.worker.id,
          wage: Number(wage),
          duration,
          startDate,
          scopeOfWork: scope
        })
      });
      if (res.ok) {
        setIsAgreementModalOpen(false);
        onNavigate('agreements');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreatingAgreement(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Candidate Matching & Talent Selection</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Ranked Candidate Matching Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl mt-1">
          Review candidates ranked by objective compatibility. Every ranking transparently explains skill alignment, distance proximity, wage match, and verified Trust Scores.
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xs space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">No Jobs Available for Matching</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Post a job requirement in the Marketplace first to match verified artisans and trade professionals.
            </p>
          </div>
          <button
            onClick={() => onNavigate('jobs')}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Go to Job Marketplace
          </button>
        </div>
      ) : (
        <>
          {/* Select Job Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-4 flex-wrap">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Job:</span>
            <div className="flex flex-wrap gap-2">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => handleSelectJob(job)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedJob?.id === job.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  {job.title} ({job.location.city})
                </button>
              ))}
            </div>
          </div>

          {/* Candidates List */}
          {rankedCandidates.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs text-slate-600 text-xs">
              No candidates matching this specific trade profile yet. Candidates will stream in as workers register or update skills.
            </div>
          ) : (
            <div className="space-y-4">
              {rankedCandidates.map((cand, idx) => (
                <div
                  key={cand.worker.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={cand.worker.avatarUrl}
                        alt={cand.worker.fullName}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-400 shadow-xs"
                      />
                      <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-slate-900">{cand.worker.fullName}</h3>
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          Trust Score: {cand.worker.trustScore}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-xs font-bold">
                          {cand.worker.experienceYears}+ Years Exp.
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {cand.worker.location.city}, {cand.worker.location.district}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-800">Daily Rate: ₹{cand.worker.preferredDailyWage}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {cand.worker.skills.map((s, i) => (
                          <span
                            key={i}
                            className={`text-[11px] px-2 py-0.5 rounded font-semibold ${s.isVerified
                                ? 'bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1'
                                : 'bg-slate-100 text-slate-600'
                              }`}
                          >
                            {s.isVerified && <ShieldCheck className="w-3 h-3 text-purple-600" />}
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Compatibility Score Card */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto justify-between border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                    <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3 min-w-[180px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">
                          Overall Match
                        </span>
                        <span className="text-sm font-black text-purple-900">
                          {cand.matchDetails.totalScore}%
                        </span>
                      </div>
                      <div className="w-full bg-white rounded-full h-1.5 overflow-hidden mb-2">
                        <div
                          className="bg-purple-600 h-full rounded-full"
                          style={{ width: `${cand.matchDetails.totalScore}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-slate-600 line-clamp-2">
                        {cand.matchDetails.explanation}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenAgreement(cand)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <span>Issue Contract</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Digital Agreement Creation Modal in Clean Light Theme */}
      {isAgreementModalOpen && selectedCandidate && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base">Generate Digital Work Contract</h3>
              </div>
              <button
                onClick={() => setIsAgreementModalOpen(false)}
                className="p-1 rounded hover:bg-slate-200 cursor-pointer text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgreement} className="p-6 space-y-4">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 leading-relaxed">
                <strong>Bilateral Work Contract:</strong> Terms, wages, milestone deliverables, and escrow commitments will be legally recorded on the platform.
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Worker:</span>
                  <strong className="text-slate-900">{selectedCandidate.worker.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Job:</span>
                  <strong className="text-slate-900">{selectedJob.title}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Agreed Daily Wage (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1000"
                    value={wage}
                    onChange={e => setWage(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10 Days"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Commencement Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Scope of Work & Deliverables</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify task deliverables, safety standards, and completion benchmarks..."
                  value={scope}
                  onChange={e => setScope(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAgreementModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAgreement}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {isCreatingAgreement ? 'Generating Contract...' : 'Create & Issue Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
