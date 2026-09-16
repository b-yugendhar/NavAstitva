import React, { useState, useEffect } from 'react';
import { 
  Lock, Unlock, ShieldCheck, CheckCircle2, 
  AlertCircle, DollarSign, ArrowRight, Clock, FileText, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { PaymentRecord } from '../types.ts';

export const PaymentProtectionPage: React.FC = () => {
  const { seedDatabaseDemo } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isReleasing, setIsReleasing] = useState(false);
  const [lastActionMsg, setLastActionMsg] = useState('');

  const loadPayments = () => {
    fetch('/api/payments')
      .then(res => res.json())
      .then(data => setPayments(data || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleRelease = async (paymentId: string) => {
    setIsReleasing(true);
    try {
      const res = await fetch(`/api/payments/${paymentId}/release`, {
        method: 'POST'
      });
      if (res.ok) {
        const result = await res.json();
        setLastActionMsg(`Escrow payment of ₹${result.payment.amount} released directly to worker account.`);
        loadPayments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReleasing(false);
    }
  };

  const totalHeld = payments
    .filter(p => p.status === 'demo_held')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalReleased = payments
    .filter(p => p.status === 'released')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">
          <Lock className="w-4 h-4 text-purple-600" />
          <span>Payment Protection & Milestone Escrow Vault</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Guaranteed Milestone Payment Protection
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl mt-1">
          To eliminate the rampant problem of wage delays and non-payment in informal contracting, employers pre-commit milestone wages into the NavAstitva Escrow Vault. Funds are securely locked and disbursed immediately upon verified completion.
        </p>
      </div>

      {/* Demo Notice Banner */}
      <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-orange-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Demonstration Escrow Environment:</strong> Financial transactions are simulated safely within this ecosystem. Employers can commit demo funds, and workers receive verified proof that funds are held before beginning work on site.
        </div>
      </div>

      {/* Vault Balance Cards in Clean Light Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Total In Escrow Vault
          </div>
          <div className="text-3xl font-black text-orange-600">
            ₹{totalHeld.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-orange-600" />
            <span>Currently locked pending work approval</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Successfully Disbursed
          </div>
          <div className="text-3xl font-black text-purple-600">
            ₹{totalReleased.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Transferred to worker bank accounts</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Payment Protection Rate
          </div>
          <div className="text-3xl font-black text-indigo-600">
            100%
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Zero wage theft across digital agreements
          </div>
        </div>
      </div>

      {lastActionMsg && (
        <div className="p-3 bg-purple-100 text-purple-900 rounded-xl text-xs font-bold">
          ✓ {lastActionMsg}
        </div>
      )}

      {/* Payment Transactions Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h2 className="text-base font-extrabold text-slate-900 mb-4">
          Milestone Escrow Ledger ({payments.length})
        </h2>

        {payments.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <Lock className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="font-bold text-slate-800 text-sm">No Escrow Transactions Yet</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              When work contracts are signed between employers and workers, milestone payments are automatically vaulted here to guarantee compensation.
            </p>
            <button
              onClick={seedDatabaseDemo}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              Load Sample Transactions
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((p) => (
              <div 
                key={p.id} 
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">{p.escrowReference}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                      p.status === 'released'
                        ? 'bg-purple-100 text-purple-800'
                        : p.status === 'disputed_hold'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {p.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{p.jobTitle}</h3>
                  <div className="text-xs text-slate-500">
                    Committed: {new Date(p.committedAt).toLocaleDateString()} • Method: {p.paymentMethod}
                  </div>
                  <div className="text-xs text-slate-600">{p.notes}</div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900">₹{p.amount.toLocaleString()}</div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Contract Milestone</span>
                  </div>

                  {p.status === 'demo_held' && (
                    <button
                      onClick={() => handleRelease(p.id)}
                      disabled={isReleasing}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Release to Worker</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
