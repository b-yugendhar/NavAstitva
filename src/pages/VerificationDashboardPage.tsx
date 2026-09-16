import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle2, XCircle, AlertCircle, 
  Sparkles, CheckCheck, User, Clock, FileText, ArrowRight, Inbox
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { VerificationRequest } from '../types.ts';

export const VerificationDashboardPage: React.FC = () => {
  const { seedDatabaseDemo } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<VerificationRequest | null>(null);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRequests = () => {
    fetch('/api/verification/requests')
      .then(res => res.json())
      .then(data => {
        const list = data || [];
        setRequests(list);
        if (list.length > 0 && !selectedReq) {
          setSelectedReq(list[0]);
        } else if (list.length === 0) {
          setSelectedReq(null);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleDecision = async (decision: 'approved' | 'rejected' | 'needs_more_evidence') => {
    if (!selectedReq) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/verification/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedReq.id,
          decision,
          verifierNotes: notes || (decision === 'approved' ? 'Approved based on submitted technical evidence.' : 'Verification review recorded.')
        })
      });
      if (res.ok) {
        loadRequests();
        const updated = await res.json();
        setSelectedReq(updated.verificationRequest);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-700 mb-1">
          <ShieldCheck className="w-4 h-4 text-orange-600" />
          <span>Skill Verification Desk</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Skill Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
          Review skill evidence artifacts with automated analysis and verify worker certifications.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xs space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mx-auto">
            <Inbox className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Queue is Empty</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              No vocational skill credentials currently require evaluation. Submissions will appear here.
            </p>
          </div>
          <button
            onClick={seedDatabaseDemo}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Load Sample Verification Queue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column: Request Queue */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              <span>Pending Review Queue ({requests.filter(r => r.status === 'under_human_review' || r.status === 'pending').length})</span>
              <span>Total: {requests.length}</span>
            </div>

            <div className="space-y-2.5">
              {requests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedReq(req)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedReq?.id === req.id
                      ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900">{req.workerName}</h3>
                      <div className="text-xs font-bold text-orange-800">{req.skillName}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      req.status === 'approved' 
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span className="flex items-center gap-1 font-semibold text-orange-700">
                      <Sparkles className="w-3 h-3" />
                      AI Confidence: {req.aiConfidence}%
                    </span>
                    <span>{new Date(req.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: Detailed Inspection Desk */}
          <div className="lg:col-span-7">
            {selectedReq ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Application ID: {selectedReq.id}
                    </span>
                    <h2 className="text-lg font-black text-slate-900 mt-0.5">
                      {selectedReq.workerName} — {selectedReq.skillName}
                    </h2>
                    <div className="text-xs text-slate-500 mt-1">
                      Submitted: {new Date(selectedReq.submittedAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-orange-700">AI Confidence</div>
                    <div className="text-2xl font-black text-orange-950">{selectedReq.aiConfidence}%</div>
                  </div>
                </div>

                {/* AI Summary Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    <span>AI Automated Assessment</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedReq.aiSummary || 'Automated analysis verified evidence against standard technical criteria.'}
                  </p>
                </div>

                {/* Verifier Feedback Form */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Assessor Notes & Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Enter assessor remarks or review notes..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                {/* Decision Actions */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => handleDecision('rejected')}
                    disabled={isProcessing}
                    className="px-4 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Reject Certification
                  </button>

                  <button
                    onClick={() => handleDecision('needs_more_evidence')}
                    disabled={isProcessing}
                    className="px-4 py-2.5 rounded-xl border border-orange-200 text-orange-800 hover:bg-orange-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Request More Evidence
                  </button>

                  <button
                    onClick={() => handleDecision('approved')}
                    disabled={isProcessing}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Approve & Issue Badge</span>
                  </button>
                </div>

                {selectedReq.reviewedAt && (
                  <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 text-xs text-orange-900">
                    <strong>Decision Recorded:</strong> Reviewed by {selectedReq.reviewedBy} on {new Date(selectedReq.reviewedAt).toLocaleDateString()}. Status: <span className="font-bold uppercase">{selectedReq.status}</span>.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                Select a verification request from the list to inspect.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
