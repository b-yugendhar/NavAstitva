import React, { useState } from 'react';
import { 
  PhoneCall, Users, CheckCircle2, ShieldCheck, 
  Printer, QrCode, Sparkles, Check, ArrowRight, MessageSquare, Loader2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

export const CscAssistedOnboardingPage: React.FC = () => {
  const { t } = useLanguage();
  const [workerName, setWorkerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [primarySkill, setPrimarySkill] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('hi');
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredCard, setRegisteredCard] = useState<any | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/csc/assisted-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cscOperatorId: 'usr-csc-1',
          workerName,
          mobileNumber,
          primarySkill: primarySkill || 'Vocational Trade',
          district: district || 'General',
          state: state || 'State',
          preferredLanguage
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRegisteredCard({
          workerName,
          mobileNumber,
          primarySkill: primarySkill || 'Vocational Trade',
          district,
          state,
          id: data.workerId,
          cardCode: `NAVA-CSC-${Math.floor(100000 + Math.random() * 900000)}`
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner in Light Purple/Orange Theme */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-orange-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-200 text-xs font-bold">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Inclusive Rural Bharat Access Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Common Service Center (CSC) Assisted Desk
          </h1>
          <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed">
            "No smartphone left behind." Authorized Village Level Entrepreneurs (VLE) register skilled rural workers who rely on basic feature phones. Generates verifiable QR identification cards and enables SMS/Voice IVR job matching.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Assisted Onboarding Form */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Worker Assisted Enrollment Form
                </h2>
                <div className="text-xs text-slate-500">
                  Operating as: <strong>CSC Partner Center</strong>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                CSC Certified Terminal
              </span>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Worker Full Name (As per Aadhaar/Voter ID)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter worker's full legal name"
                  value={workerName}
                  onChange={e => setWorkerName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number (For SMS & Voice Alerts)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={mobileNumber}
                    onChange={e => setMobileNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Language for Voice Alerts
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={e => setPreferredLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="mr">मराठी (Marathi)</option>
                    <option value="bn">বাংলা (Bengali)</option>
                    <option value="ur">اردو (Urdu)</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Vocational Trade / Skill
                </label>
                <select
                  value={primarySkill}
                  onChange={e => setPrimarySkill(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="">-- Select primary trade --</option>
                  <option value="Domestic Electrician">Domestic Electrician</option>
                  <option value="Solar Pump & Inverter Technician">Solar Pump & Inverter Technician</option>
                  <option value="Agricultural Pipe & Pump Fitting">Agricultural Pipe & Pump Fitting</option>
                  <option value="Masonry & Brick Construction">Masonry & Brick Construction</option>
                  <option value="Rural Carpentry & Woodwork">Rural Carpentry & Woodwork</option>
                  <option value="Heavy Equipment & Tractor Mechanic">Heavy Equipment & Tractor Mechanic</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter district"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter state"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="aadhaar-chk"
                  checked={aadhaarVerified}
                  onChange={e => setAadhaarVerified(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="aadhaar-chk" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  VLE In-Person Verification: Physical Identity Proof & Bank Passbook sighted.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !workerName || !mobileNumber || !primarySkill}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering with NavAstitva Rural Gateway...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Complete Assisted Registration & Print QR Card</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Physical QR Card Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Physical NavAstitva Worker Identity Card
          </div>

          {registeredCard ? (
            <div className="bg-white border-2 border-purple-500 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-black text-sm">
                    NA
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900">NavAstitva Verified ID</div>
                    <div className="text-[10px] text-slate-400">Skill Credential Card</div>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold bg-purple-100 px-2 py-0.5 rounded text-purple-700">
                  {registeredCard.cardCode}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-center text-slate-400">
                  <QrCode className="w-14 h-14 text-slate-800" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-base text-slate-900">{registeredCard.workerName}</h3>
                  <div className="text-xs font-bold text-purple-700">{registeredCard.primarySkill}</div>
                  <div className="text-xs text-slate-500">{registeredCard.district}, {registeredCard.state}</div>
                  <div className="text-[11px] font-mono text-slate-600">📱 {registeredCard.mobileNumber}</div>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>CSC Kendra Assisted Verified</span>
                </div>
                <div className="text-[11px] text-purple-800">
                  Any employer can scan the QR code to view verified certifications and past employer ratings without requiring a smartphone app.
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Laminated Physical Card</span>
              </button>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
              <QrCode className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="text-xs font-semibold text-slate-600">No card generated yet</div>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Fill out the assisted registration form on the left. The official printable QR Identity Card will generate here immediately.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
