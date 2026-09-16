import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Search, MapPin, DollarSign, Clock, 
  Sparkles, Filter, CheckCircle2, ChevronRight, X, Loader2, Plus, Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Job, MatchScoreDetails } from '../types.ts';

export const JobMarketplacePage: React.FC = () => {
  const { currentUser, seedDatabaseDemo } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [matchDetails, setMatchDetails] = useState<MatchScoreDetails | null>(null);
  const [inspectingMatchJob, setInspectingMatchJob] = useState<Job | null>(null);

  // Post Job Modal State (no default values)
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postSkills, setPostSkills] = useState('');
  const [postWage, setPostWage] = useState('');
  const [postWageType, setPostWageType] = useState('daily');
  const [postCity, setPostCity] = useState('');
  const [postArea, setPostArea] = useState('');
  const [postDuration, setPostDuration] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Application Form (no default values)
  const [proposedWage, setProposedWage] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const loadJobs = () => {
    let url = '/api/jobs?';
    if (searchQuery) url += `skill=${encodeURIComponent(searchQuery)}&`;
    if (selectedCity) url += `city=${encodeURIComponent(selectedCity)}&`;
    if (selectedWorkType) url += `workType=${encodeURIComponent(selectedWorkType)}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => setJobs(data || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadJobs();
  }, [searchQuery, selectedCity, selectedWorkType]);

  const handleInspectMatch = async (job: Job) => {
    setInspectingMatchJob(job);
    try {
      const res = await fetch(`/api/jobs/${job.id}/match`);
      if (res.ok) {
        const data = await res.json();
        setMatchDetails(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobForApply) return;
    setIsApplying(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJobForApply.id,
          proposedWage: Number(proposedWage),
          coverNote
        })
      });
      if (res.ok) {
        setApplySuccess(true);
        setTimeout(() => {
          setApplySuccess(false);
          setSelectedJobForApply(null);
          loadJobs();
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsApplying(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPosting(true);
    try {
      const skillsArray = postSkills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle,
          description: postDesc,
          requiredSkills: skillsArray.length > 0 ? skillsArray : ['Vocational Craft'],
          location: {
            city: postCity,
            state: 'Telangana',
            area: postArea
          },
          wage: Number(postWage),
          wageType: postWageType,
          duration: postDuration,
          workType: 'contract',
          numberOfWorkers: 1
        })
      });
      if (res.ok) {
        setIsPostJobOpen(false);
        setPostTitle('');
        setPostDesc('');
        loadJobs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-700 mb-1">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>Job Marketplace</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Verified Job Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
            Browse verified listings matched to your trade skills, location, and preferred wage rates.
          </p>
        </div>

        <button
          onClick={() => setIsPostJobOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post a Job</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by trade (electrician, solar, plumbing, welding)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
          />
        </div>

        <select
          value={selectedCity}
          onChange={e => setSelectedCity(e.target.value)}
          className="w-full md:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
        >
          <option value="">All Locations</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Bengaluru">Bengaluru</option>
          <option value="Varanasi">Varanasi</option>
          <option value="Mumbai">Mumbai</option>
        </select>

        <select
          value={selectedWorkType}
          onChange={e => setSelectedWorkType(e.target.value)}
          className="w-full md:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
        >
          <option value="">All Contract Types</option>
          <option value="contract">Project Contract</option>
          <option value="daily_wage">Daily Wage</option>
        </select>
      </div>

      {/* Empty State */}
      {jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xs space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">No Job Listings Found</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              There are currently no active job postings matching your filter criteria.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsPostJobOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Post First Job</span>
            </button>
            <button
              onClick={seedDatabaseDemo}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              Load Sample Jobs
            </button>
          </div>
        </div>
      ) : (
        /* Job Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <button
                    onClick={() => handleInspectMatch(job)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold hover:bg-orange-100 transition-colors cursor-pointer"
                    title="View match breakdown"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                    <span>AI Match Available</span>
                  </button>
                  <span className="text-xs font-bold text-red-600">
                    ₹{job.wage} / {job.wageType}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-2 mb-1">
                  {job.title}
                </h3>
                <div className="text-xs text-slate-500 flex items-center gap-2 mb-3">
                  <span className="font-semibold text-slate-700">{job.employerName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location.city} ({job.location.area})
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.requiredSkills.map((sk, idx) => (
                    <span key={idx} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Duration: <strong>{job.duration}</strong></span>
                  <span>Applicants: <strong>{job.applicantsCount}</strong></span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleInspectMatch(job)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Match Breakdown
                  </button>
                  <button
                    onClick={() => {
                      setSelectedJobForApply(job);
                      setProposedWage(String(job.wage));
                    }}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transparent Match Breakdown Modal in Clean Light Theme */}
      {inspectingMatchJob && matchDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-base">Match Breakdown</h3>
              </div>
              <button 
                onClick={() => setInspectingMatchJob(null)}
                className="p-1 rounded hover:bg-slate-200 cursor-pointer text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-200">
                <div>
                  <div className="text-xs font-bold text-orange-800 uppercase tracking-wider">Overall Score</div>
                  <div className="text-3xl font-black text-orange-950">{matchDetails.score}% Match</div>
                </div>
                <div className="text-right text-xs text-orange-900">
                  <div><strong>Worker:</strong> {matchDetails.workerName}</div>
                  <div><strong>Role:</strong> {inspectingMatchJob.title}</div>
                </div>
              </div>

              {/* 5-Factor Formula Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Multi-Factor Alignment
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Skill Match (40% Weight)</span>
                      <strong>{matchDetails.breakdown.skillMatch}%</strong>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-orange-600 h-full rounded-full" style={{ width: `${matchDetails.breakdown.skillMatch}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Experience Alignment (20% Weight)</span>
                      <strong>{matchDetails.breakdown.experienceMatch}%</strong>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: `${matchDetails.breakdown.experienceMatch}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Proximity & Location (15% Weight)</span>
                      <strong>{matchDetails.breakdown.locationMatch}%</strong>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-orange-500 h-full rounded-full" style={{ width: `${matchDetails.breakdown.locationMatch}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Availability Match (15% Weight)</span>
                      <strong>{matchDetails.breakdown.availabilityMatch}%</strong>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${matchDetails.breakdown.availabilityMatch}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Wage Expectation Match (10% Weight)</span>
                      <strong>{matchDetails.breakdown.wageMatch}%</strong>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-red-600 h-full rounded-full" style={{ width: `${matchDetails.breakdown.wageMatch}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Natural Language Explanation */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-900 block">System Rationale:</span>
                <p className="leading-relaxed">{matchDetails.explanation}</p>
              </div>

              <button
                onClick={() => setInspectingMatchJob(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal in Clean Light Theme */}
      {selectedJobForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 text-slate-900 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Apply for Position</h3>
                <p className="text-xs text-slate-500">{selectedJobForApply.title}</p>
              </div>
              <button 
                onClick={() => setSelectedJobForApply(null)}
                className="p-1 rounded hover:bg-slate-200 cursor-pointer text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="p-6 space-y-4">
              {applySuccess ? (
                <div className="p-6 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-orange-600 mx-auto" />
                  <h4 className="font-bold text-base text-slate-900">Application Submitted!</h4>
                  <p className="text-xs text-slate-600">
                    Your application has been sent to {selectedJobForApply.employerName}.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 text-xs text-orange-950">
                    ✓ Your verified certificates and Trust Score will be attached to this application.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Proposed Daily Wage (₹)</label>
                    <input
                      type="number"
                      required
                      value={proposedWage}
                      onChange={e => setProposedWage(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Worker Cover Note</label>
                    <textarea
                      rows={3}
                      required
                      value={coverNote}
                      onChange={e => setCoverNote(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedJobForApply(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Submit Application</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Post Job Modal in Clean Light Theme */}
      {isPostJobOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-base">Post a New Job Requirement</h3>
              </div>
              <button 
                onClick={() => setIsPostJobOpen(false)}
                className="p-1 rounded hover:bg-slate-200 cursor-pointer text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Electrician for 3-Phase Panel Setup"
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Required Skills (comma-separated)</label>
                  <input
                    type="text"
                    required
                    placeholder="Electrician, Panel Wiring"
                    value={postSkills}
                    onChange={e => setPostSkills(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10 Days"
                    value={postDuration}
                    onChange={e => setPostDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Wage Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={postWage}
                    onChange={e => setPostWage(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Wage Rate</label>
                  <select
                    value={postWageType}
                    onChange={e => setPostWageType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="daily">Per Day</option>
                    <option value="contract">Fixed Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={postCity}
                    onChange={e => setPostCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Scope & Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the technical tasks and milestone objectives..."
                  value={postDesc}
                  onChange={e => setPostDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostJobOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Publish Job</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
