import React, { useState } from 'react';
import { 
  X, Briefcase, ShieldCheck, 
  MapPin, Phone, Mail, CheckCircle2, 
  ArrowRight, Sparkles, Building2, User, Lock, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'signin' 
}) => {
  const { currentUser, login, registerUser, logout } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign In Form State
  const [signinIdentifier, setSigninIdentifier] = useState('');
  const [signinPassword, setSigninPassword] = useState('');

  // Register Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [role, setRole] = useState<UserRole>('worker');
  const [tradeSkill, setTradeSkill] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('');
  const [wage, setWage] = useState('');
  const [preferredLang, setPreferredLang] = useState('hi');

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!signinIdentifier.trim()) {
      setErrorMsg('Please enter your mobile phone number or registered email.');
      return;
    }
    if (!signinPassword.trim()) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(signinIdentifier, signinPassword);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('Signed in successfully! Redirecting...');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 700);
    } else {
      setErrorMsg(res.error || 'Invalid credentials. Please verify and try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const res = await registerUser({
      name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password: signupPassword,
      role,
      skills: role === 'worker' ? [tradeSkill || 'General Skilled Artisan'] : undefined,
      companyName: role === 'employer' ? (companyName || fullName) : undefined,
      location: city,
      wage: role === 'worker' ? Number(wage) || 900 : undefined,
      preferredLanguage: preferredLang,
      bio: role === 'worker' 
        ? `Dedicated and certified ${tradeSkill} with a proven track record of quality craftsmanship and punctuality.`
        : `Verified hiring entity dedicated to fair wages and workplace safety standards.`
    });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(`Welcome to NavAstitva, ${fullName}! Your ${role.replace('_', ' ')} account is active.`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 900);
    } else {
      setErrorMsg(res.error || 'Registration failed. Please review your details.');
    }
  };

  // Quick fill helper for testers without changing architecture
  const fillTestCredentials = (ident: string, pass: string) => {
    setSigninIdentifier(ident);
    setSigninPassword(pass);
    setErrorMsg('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-orange-100 flex items-center justify-between bg-orange-50/60">
          <div>
            <div className="flex items-center gap-2 text-orange-700 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>National Registry</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {tab === 'signin' ? 'Sign In to Your Account' : 'Create an Account'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 text-xs font-semibold">
          <button
            onClick={() => { setTab('signin'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 font-bold cursor-pointer ${
              tab === 'signin' 
                ? 'border-orange-600 text-orange-600 bg-white shadow-2xs' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 font-bold cursor-pointer ${
              tab === 'signup' 
                ? 'border-orange-600 text-orange-600 bg-white shadow-2xs' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mobile Number or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={signinIdentifier}
                    onChange={(e) => setSigninIdentifier(e.target.value)}
                    placeholder="e.g. 9876543210 or name@example.in"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Account Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signinPassword}
                    onChange={(e) => setSigninPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors mt-2"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Discreet test account helper */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Demo Accounts (Click to prefill)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillTestCredentials('9876543210', 'password123')}
                    className="p-2 border border-slate-200 rounded-lg text-left hover:bg-orange-50 hover:border-orange-300 transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-800">Skilled Worker</div>
                    <div className="text-[10px] text-slate-500">98765 43210 / password123</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillTestCredentials('9820011223', 'password123')}
                    className="p-2 border border-slate-200 rounded-lg text-left hover:bg-orange-50 hover:border-orange-300 transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-800">Employer</div>
                    <div className="text-[10px] text-slate-500">98200 11223 / password123</div>
                  </button>
                </div>
              </div>

              <div className="text-center text-xs text-slate-500 pt-2">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('signup'); setErrorMsg(''); }}
                  className="font-bold text-orange-600 hover:underline cursor-pointer"
                >
                  Register an account
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SIGN UP / REGISTER */}
          {tab === 'signup' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  I am joining as <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('worker')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      role === 'worker' 
                        ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold ring-1 ring-orange-400' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 mx-auto mb-1 text-orange-600" />
                    <div className="text-xs font-bold">Worker</div>
                    <div className="text-[9px] text-slate-500">Skilled Trades</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('employer')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      role === 'employer' 
                        ? 'border-red-500 bg-red-50 text-red-950 font-bold ring-1 ring-red-400' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mx-auto mb-1 text-red-600" />
                    <div className="text-xs font-bold">Employer</div>
                    <div className="text-[9px] text-slate-500">Contractor / Firm</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      role === 'admin' 
                        ? 'border-orange-600 bg-orange-50 text-orange-950 font-bold ring-1 ring-orange-500' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-orange-600" />
                    <div className="text-xs font-bold">Assessor</div>
                    <div className="text-[9px] text-slate-500">Verifier</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.in (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password (min 6 characters) <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Create a secure password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Role specific inputs */}
              {role === 'worker' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-orange-50/50 border border-orange-100 rounded-xl">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Primary Trade Skill
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Electrician, Mason, Plumber"
                      value={tradeSkill}
                      onChange={(e) => setTradeSkill(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Expected Daily Wage (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 850"
                      value={wage}
                      onChange={(e) => setWage(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {role === 'employer' && (
                <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Company / Firm Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Infrastructure Projects"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad, Pune"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Language
                  </label>
                  <select
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="en">English</option>
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="bn">Bengali (বাংলা)</option>
                    <option value="mr">Marathi (मराठी)</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors mt-2"
              >
                {isSubmitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-xs text-slate-500 pt-2">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('signin'); setErrorMsg(''); }}
                  className="font-bold text-orange-600 hover:underline cursor-pointer"
                >
                  Sign In here
                </button>
              </div>
            </form>
          )}

          {currentUser && (
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500">Currently signed in: <strong>{currentUser.name}</strong> ({currentUser.role})</span>
              <button 
                type="button"
                onClick={async () => {
                  await logout();
                  onClose();
                }}
                className="text-red-600 hover:text-red-700 font-bold"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
