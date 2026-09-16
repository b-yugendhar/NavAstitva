import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, Clock, ShieldCheck, 
  Lock, Printer, Check, ArrowRight, UserCheck, Scale, Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { DigitalAgreement } from '../types.ts';

interface AgreementsPageProps {
  onNavigate: (tab: string) => void;
}

export const AgreementsPage: React.FC<AgreementsPageProps> = ({ onNavigate }) => {
  const { currentUser, seedDatabaseDemo } = useAuth();
  const [agreements, setAgreements] = useState<DigitalAgreement[]>([]);
  const [selectedAgr, setSelectedAgr] = useState<DigitalAgreement | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  const loadAgreements = () => {
    fetch('/api/agreements')
      .then(res => res.json())
      .then(data => {
        const list = data || [];
        setAgreements(list);
        if (list.length > 0) {
          setSelectedAgr(list[0]);
        } else {
          setSelectedAgr(null);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadAgreements();
  }, []);

  const handleSign = async () => {
    if (!selectedAgr) return;
    setIsSigning(true);
    try {
      const res = await fetch(`/api/agreements/${selectedAgr.id}/sign`, {
        method: 'POST'
      });
      if (res.ok) {
        loadAgreements();
        const updated = await res.json();
        setSelectedAgr(updated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-700 mb-1">
          <FileText className="w-4 h-4 text-orange-600" />
          <span>Work Agreements</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Digital Work Agreements
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
          Review and digitally sign bilateral work contracts with clear milestones, daily wage rates, and escrow protection.
        </p>
      </div>

      {agreements.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xs space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">No Digital Agreements Found</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Agreements are created when selecting candidates from matching or job applications.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('matching')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Match Candidates & Issue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={seedDatabaseDemo}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              Load Sample Contracts
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Agreement List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Active Contracts ({agreements.length})
            </div>

            <div className="space-y-2.5">
              {agreements.map((agr) => (
                <div
                  key={agr.id}
                  onClick={() => setSelectedAgr(agr)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedAgr?.id === agr.id
                      ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {agr.agreementNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      agr.status === 'active'
                        ? 'bg-orange-100 text-orange-800'
                        : agr.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {agr.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2">
                    {agr.jobTitle}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1">
                    {agr.employerName} ↔ {agr.workerName}
                  </div>
                  <div className="text-xs font-bold text-red-600 mt-1">
                    ₹{agr.wage} / {agr.wageType} ({agr.duration})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Agreement Document View */}
          <div className="lg:col-span-8">
            {selectedAgr ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                {/* Document Top Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
                      {selectedAgr.agreementNumber}
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-2">
                      {selectedAgr.jobTitle}
                    </h2>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>

                {/* Parties Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium block">Party A (Employer):</span>
                    <strong className="text-slate-900 text-sm">{selectedAgr.employerName}</strong>
                    <div className="text-slate-500 mt-0.5">Verified Account</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Party B (Worker):</span>
                    <strong className="text-slate-900 text-sm">{selectedAgr.workerName}</strong>
                    <div className="text-slate-500 mt-0.5">Verified Profile</div>
                  </div>
                </div>

                {/* Key Legal Terms */}
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                      1. Scope of Work
                    </h4>
                    <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                      {selectedAgr.scopeOfWork}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-500 block">Agreed Wage:</span>
                      <strong className="text-slate-900 text-sm">₹{selectedAgr.wage} / {selectedAgr.wageType}</strong>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-500 block">Duration:</span>
                      <strong className="text-slate-900 text-sm">{selectedAgr.duration}</strong>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-500 block">Start Date:</span>
                      <strong className="text-slate-900 text-sm">
                        {new Date(selectedAgr.startDate).toLocaleDateString()}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                      2. Milestone Escrow & Payment Guarantees
                    </h4>
                    <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                      {selectedAgr.paymentTerms}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                      3. Completion Criteria
                    </h4>
                    <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                      {selectedAgr.completionConditions}
                    </p>
                  </div>
                </div>

                {/* Digital Signatures Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    Digital Signatures
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-500">Employer Attestation:</div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {selectedAgr.employerName}
                      </div>
                      <div className="text-[11px] text-orange-700 mt-1 flex items-center gap-1 font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        Signed on {new Date(selectedAgr.employerAcceptedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-500">Worker Attestation:</div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {selectedAgr.workerName}
                      </div>
                      {selectedAgr.workerAcceptedAt ? (
                        <div className="text-[11px] text-orange-700 mt-1 flex items-center gap-1 font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          Signed on {new Date(selectedAgr.workerAcceptedAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <div className="text-[11px] text-red-600 mt-1 font-semibold">
                          Awaiting Worker Signature
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sign Action Button if pending for current user */}
                  {(!selectedAgr.workerAcceptedAt && currentUser?.role === 'worker') && (
                    <button
                      onClick={handleSign}
                      disabled={isSigning}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Digitally Sign & Accept Terms</span>
                    </button>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => onNavigate('payments')}
                      className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Inspect Escrow Protection</span>
                    </button>

                    <button
                      onClick={() => onNavigate('progress')}
                      className="flex-1 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
                    >
                      Track Progress
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                Select an agreement to view details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
