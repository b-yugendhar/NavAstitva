import React, { useState, useEffect } from 'react';
import {
  Scale, AlertTriangle, ShieldCheck, CheckCircle2,
  Sparkles, FileText, ArrowRight, Check, X, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { DisputeRecord } from '../types.ts';

export const DisputeResolutionPage: React.FC = () => {
  const { currentUser, seedDatabaseDemo } = useAuth();
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<DisputeRecord | null>(null);
  const [isFilingModalOpen, setIsFilingModalOpen] = useState(false);

  // Filing form - NO DEFAULT VALUES
  const [reason, setReason] = useState('Scope Disagreement & Additional Unpaid Work Requested');
  const [description, setDescription] = useState('');
  const [isFiling, setIsFiling] = useState(false);

  // Arbitrator decision form - NO DEFAULT VALUES
  const [outcome, setOutcome] = useState<'full_release_to_worker' | 'partial_settlement' | 'full_refund_to_employer'>('partial_settlement');
  const [settlementAmount, setSettlementAmount] = useState('');
  const [arbitratorNotes, setArbitratorNotes] = useState('');
  const [isDeciding, setIsDeciding] = useState(false);

  const loadDisputes = () => {
    fetch('/api/disputes')
      .then(res => res.json())
      .then(data => {
        const list = data || [];
        setDisputes(list);
        if (list.length > 0 && !selectedDispute) {
          setSelectedDispute(list[0]);
        } else if (list.length === 0) {
          setSelectedDispute(null);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const handleFileDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFiling(true);
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agreementId: 'agr-demo-1',
          reason,
          description: description || 'Formal dispute lodged regarding work scope and milestone payment.'
        })
      });
      if (res.ok) {
        setIsFilingModalOpen(false);
        setDescription('');
        loadDisputes();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFiling(false);
    }
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute) return;
    setIsDeciding(true);
    try {
      const res = await fetch('/api/disputes/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId: selectedDispute.id,
          outcome,
          resolutionNotes: arbitratorNotes || 'Adjudicated according to certified milestone criteria.',
          settlementAmount: Number(settlementAmount) || 0
        })
      });
      if (res.ok) {
        loadDisputes();
        const updated = await res.json();
        setSelectedDispute(updated);
        setArbitratorNotes('');
        setSettlementAmount('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeciding(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">
            <Scale className="w-4 h-4 text-purple-600" />
            <span>Dispute Resolution & Fair AI Arbitration Assistance</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Fair Dispute Resolution Chamber
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl mt-1">
            If an issue arises over scope, defects, or wage releases, either party can trigger formal dispute proceedings. Gemini AI objectively audits conflicting claims and contract clauses, while certified human ombudsmen issue binding settlements.
          </p>
        </div>

        <button
          onClick={() => setIsFilingModalOpen(true)}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Raise a Dispute</span>
        </button>
      </div>

      {disputes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xs space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center mx-auto">
            <Scale className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Zero Active Disputes</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              All work agreements are operating harmoniously. If a contractor or worker encounters milestone or scope disagreements, complaints are lodged here for fair mediation.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsFilingModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              File a Dispute Claim
            </button>
            <button
              onClick={seedDatabaseDemo}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              Load Sample Case
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: List of Disputes */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Dispute Cases ({disputes.length})
            </div>

            <div className="space-y-2.5">
              {disputes.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDispute(d)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedDispute?.id === d.id
                      ? 'border-purple-500 bg-purple-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {d.disputeNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${d.status === 'resolved'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-rose-100 text-rose-800'
                      }`}>
                      {d.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2">
                    {d.reason}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1">
                    Filed by {d.raisedByName} ({d.raisedBy})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Case Details & AI Assessment */}
          <div className="lg:col-span-8">
            {selectedDispute ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 px-2 py-0.5 rounded bg-purple-100">
                      Formal Mediation Case
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-1">
                      {selectedDispute.reason}
                    </h2>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Case #{selectedDispute.disputeNumber} • Filed on {new Date(selectedDispute.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 text-xs text-orange-900">
                    <strong>Escrow Status:</strong> Milestone Placed in Disputed Hold
                  </div>
                </div>

                {/* Claims Details */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Complainant: <strong>{selectedDispute.raisedByName} ({selectedDispute.raisedBy})</strong></span>
                    <span>Respondent: <strong>{selectedDispute.againstName}</strong></span>
                  </div>
                  <p className="text-slate-700 leading-relaxed pt-2 border-t border-slate-200">
                    <strong>Statement of Issue:</strong> {selectedDispute.description}
                  </p>
                </div>

                {/* Gemini AI Objective Analysis */}
                {selectedDispute.aiAnalysis && (
                  <div className="p-5 rounded-xl bg-purple-50/40 border border-purple-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>Gemini AI Unbiased Dispute Assessment</span>
                      </div>
                      <span className="text-[11px] font-semibold text-purple-800 uppercase">
                        Confidence: {selectedDispute.aiAnalysis.confidenceLevel || 'High'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {selectedDispute.aiAnalysis.summary}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block mb-1">Contractual Terms in Question:</strong>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600">
                          {(selectedDispute.aiAnalysis.relevantAgreementTerms || []).map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block mb-1">Arbitrator Inquiry Questions:</strong>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600">
                          {(selectedDispute.aiAnalysis.suggestedQuestions || []).map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                      <strong className="text-slate-950 block mb-1">AI Proposed Settlement Options:</strong>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        {(selectedDispute.aiAnalysis.recommendedResolutionOptions || []).map((opt, i) => (
                          <li key={i}>{opt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Human Arbitrator Adjudication Desk in Clean Light Theme */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-purple-600" />
                      <span>Certified Ombudsman Verdict Desk</span>
                    </h3>
                    {selectedDispute.status === 'resolved' && (
                      <span className="text-xs font-bold text-purple-700">✓ Binding Verdict Issued</span>
                    )}
                  </div>

                  {selectedDispute.verifierDecision ? (
                    <div className="p-4 bg-white rounded-xl space-y-2 text-xs border border-purple-200">
                      <div className="font-bold text-purple-700 text-sm">
                        Outcome: {selectedDispute.verifierDecision.outcome.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      {selectedDispute.verifierDecision.settlementAmount && (
                        <div className="text-slate-700">
                          Settlement Disbursed: <strong>₹{selectedDispute.verifierDecision.settlementAmount}</strong>
                        </div>
                      )}
                      <p className="text-slate-600 italic">
                        "{selectedDispute.verifierDecision.resolutionNotes}"
                      </p>
                      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                        Decided by {selectedDispute.verifierDecision.decidedBy} on {new Date(selectedDispute.verifierDecision.decidedAt).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Select Arbitrated Outcome</label>
                          <select
                            value={outcome}
                            onChange={e => setOutcome(e.target.value as any)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          >
                            <option value="partial_settlement">Partial Settlement (Compensate completed work)</option>
                            <option value="full_release_to_worker">Full Release to Worker (No breach found)</option>
                            <option value="full_refund_to_employer">Full Refund to Employer (Defective delivery)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Settlement Amount (₹)</label>
                          <input
                            type="number"
                            placeholder="e.g. 5000"
                            value={settlementAmount}
                            onChange={e => setSettlementAmount(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Ombudsman Legal Findings</label>
                        <textarea
                          rows={2}
                          placeholder="Summarize reasons, code inspection findings, and rationale for settlement..."
                          value={arbitratorNotes}
                          onChange={e => setArbitratorNotes(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={handleResolveDispute}
                        disabled={isDeciding}
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Issue Binding Resolution & Disburse Escrow</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                Select a dispute from the queue to review claims.
              </div>
            )}
          </div>
        </div>
      )}

      {/* File Dispute Modal */}
      {isFilingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-purple-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-base">File Work Dispute</h3>
              </div>
              <button
                onClick={() => setIsFilingModalOpen(false)}
                className="p-1 rounded hover:bg-purple-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFileDispute} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Grievance Category</label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="Scope Disagreement & Additional Unpaid Work Requested">Scope Disagreement & Additional Work Requested</option>
                  <option value="Milestone Payment Unreasonably Withheld">Milestone Payment Withheld Despite Completion</option>
                  <option value="Defective Workmanship or Code Non-Compliance">Defective Workmanship or Code Non-Compliance</option>
                  <option value="Unapproved Schedule Delay">Unapproved Schedule Delay</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Facts & Specifics</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain exactly what occurred, deliverables provided, or why payment was withheld..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 text-xs text-orange-900 leading-relaxed">
                Filing will place the active agreement and associated milestone escrow into protective hold while Gemini AI assesses claims.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFilingModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFiling}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isFiling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
                  <span>Submit to Ombudsman Desk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
