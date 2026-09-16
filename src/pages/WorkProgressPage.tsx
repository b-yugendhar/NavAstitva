import React, { useState, useEffect } from 'react';
import { 
  CheckCheck, CheckCircle2, Clock, UploadCloud, 
  ArrowRight, Sparkles, Image, Check, AlertCircle, X, Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { WorkProgressRecord } from '../types.ts';

interface WorkProgressPageProps {
  onNavigate: (tab: string) => void;
}

export const WorkProgressPage: React.FC<WorkProgressPageProps> = ({ onNavigate }) => {
  const { seedDatabaseDemo } = useAuth();
  const [progressRecords, setProgressRecords] = useState<WorkProgressRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<WorkProgressRecord | null>(null);

  // New update form - NO DEFAULT VALUES
  const [percentage, setPercentage] = useState('');
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadProgress = () => {
    fetch('/api/progress')
      .then(res => res.json())
      .then(data => {
        const list = data || [];
        setProgressRecords(list);
        if (list.length > 0 && !selectedRecord) {
          setSelectedRecord(list[0]);
        } else if (list.length === 0) {
          setSelectedRecord(null);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agreementId: selectedRecord.agreementId,
          percentage: Number(percentage) || 10,
          note: note || 'Milestone update submitted.',
          photoUrls: photoUrl ? [photoUrl] : []
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedRecord(updated);
        setNote('');
        setPercentage('');
        setPhotoUrl('');
        loadProgress();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmCompletion = async (approved: boolean) => {
    if (!selectedRecord) return;
    try {
      const res = await fetch('/api/progress/confirm-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agreementId: selectedRecord.agreementId,
          approved,
          feedback: approved 
            ? 'Exceptional work. Clean craftsmanship and safety compliance.' 
            : 'Please complete final inspection before release.'
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedRecord(updated);
        loadProgress();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">
          <CheckCheck className="w-4 h-4 text-purple-600" />
          <span>Work Completion & Milestone Inspection</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Milestone Progress & Completion Tracking
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl mt-1">
          Workers document progress with timestamped photos and milestone notes. Employers inspect deliverables and approve completion, triggering automatic release of protected escrow wages.
        </p>
      </div>

      {progressRecords.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xs space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center mx-auto">
            <CheckCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">No Active Deployments</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              When work contracts are signed between employers and artisans, real-time milestones are tracked here.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('agreements')}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              View Work Contracts
            </button>
            <button
              onClick={seedDatabaseDemo}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              Load Sample Deployments
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: List of jobs in progress */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Active Deployments ({progressRecords.length})
            </div>

            <div className="space-y-2.5">
              {progressRecords.map((prog) => (
                <div
                  key={prog.id}
                  onClick={() => setSelectedRecord(prog)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedRecord?.id === prog.id
                      ? 'border-purple-500 bg-purple-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{prog.jobTitle}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      prog.completionStatus === 'confirmed'
                        ? 'bg-purple-100 text-purple-800'
                        : prog.completionStatus === 'submitted_for_review'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {prog.completionStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Progress</span>
                      <strong>{prog.progressPercentage}%</strong>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-purple-600 h-full rounded-full" 
                        style={{ width: `${prog.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Detailed Progress Log & Approvals */}
          <div className="lg:col-span-7">
            {selectedRecord ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {selectedRecord.jobTitle}
                  </h2>
                  <div className="text-xs text-slate-500 mt-1">
                    Agreement #{selectedRecord.agreementId}
                  </div>
                </div>

                {/* Progress Bar Display */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>Milestone Completion Status</span>
                    <span>{selectedRecord.progressPercentage}% Completed</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${selectedRecord.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Milestone Updates Log */}
                <div className="space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    Milestone Inspection Timeline
                  </h3>

                  <div className="space-y-3">
                    {selectedRecord.updates.map((upd, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-purple-800">{upd.percentage}% Milestone Logged</span>
                          <span className="text-slate-400">{new Date(upd.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{upd.note}</p>
                        {upd.photoUrls && upd.photoUrls.length > 0 && (
                          <div className="flex gap-2 pt-1 flex-wrap">
                            {upd.photoUrls.map((url, i) => (
                              <img 
                                key={i} 
                                src={url} 
                                alt="Work update" 
                                className="w-20 h-14 object-cover rounded-lg border border-slate-200" 
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Worker Submit New Progress Form */}
                <form onSubmit={handleSendUpdate} className="p-4 rounded-xl bg-purple-50/40 border border-purple-100 space-y-3">
                  <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Worker Milestone Submission
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Percentage Complete (%)</label>
                      <input 
                        type="number"
                        min="1"
                        max="100"
                        required
                        placeholder="e.g. 50"
                        value={percentage}
                        onChange={e => setPercentage(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Worksite Photo (Upload or URL)</label>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Notes on Work Executed</label>
                    <input 
                      type="text"
                      required
                      placeholder="Describe what was accomplished in this phase..."
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    {isUpdating ? 'Logging...' : 'Submit Progress Update'}
                  </button>
                </form>

                {/* Employer Inspection & Completion Approval */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Employer Inspection & Completion Verification
                  </h4>

                  {selectedRecord.completionStatus === 'confirmed' ? (
                    <div className="p-3 bg-purple-100 text-purple-900 rounded-xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-700" />
                      <span>Completion Officially Confirmed! Escrow payment has been released to worker.</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConfirmCompletion(false)}
                        className="flex-1 py-2.5 rounded-xl border border-orange-300 text-orange-800 hover:bg-orange-50 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Request Corrections
                      </button>
                      <button
                        onClick={() => handleConfirmCompletion(true)}
                        className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirm Completion & Release Escrow</span>
                      </button>
                    </div>
                  )}

                  {selectedRecord.employerFeedback && (
                    <div className="text-xs text-slate-600 italic">
                      Employer Note: "{selectedRecord.employerFeedback}"
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                Select a work deployment to view progress.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
