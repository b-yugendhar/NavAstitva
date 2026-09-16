import React, { useState, useRef, useEffect } from 'react';
import { 
  Briefcase, ShieldCheck, Award, FileText, Lock, 
  Scale, Mic, Globe, CheckCheck, 
  Menu, X, Sparkles, PhoneCall, RefreshCw, Database, LogIn, LogOut, ChevronDown, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../translations/index.ts';
import { AuthModal } from './AuthModal.tsx';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenVoiceModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenVoiceModal }) => {
  const { 
    currentUser, 
    workerProfile, 
    dbStatus, 
    resetDatabaseEmpty, 
    seedDatabaseDemo, 
    logout,
    isLoading 
  } = useAuth();
  const { language, setLanguage, t, isSpeaking, stopSpeaking } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [authModalRole, setAuthModalRole] = useState<'worker' | 'employer' | 'admin' | 'csc_operator'>('worker');
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute role-based navigation tabs
  const getNavLinks = () => {
    if (!currentUser) {
      return [
        { id: 'journey', label: 'Home', icon: Sparkles },
        { id: 'jobs', label: 'Marketplace', icon: Briefcase },
        { id: 'csc', label: 'CSC Rural Desk', icon: PhoneCall },
      ];
    }

    if (currentUser.role === 'worker') {
      return [
        { id: 'worker-dashboard', label: 'Dashboard', icon: Sparkles },
        { id: 'jobs', label: 'Find Jobs', icon: Briefcase },
        { id: 'evidence', label: 'Skill Evidence & AI', icon: ShieldCheck },
        { id: 'trust-score', label: `Trust Score ${workerProfile ? `(${workerProfile.trustScore})` : ''}`, icon: Award },
        { id: 'agreements', label: 'Contracts', icon: FileText },
        { id: 'payments', label: 'Escrow Vault', icon: Lock },
      ];
    }

    if (currentUser.role === 'employer') {
      return [
        { id: 'employer-dashboard', label: 'Dashboard', icon: Sparkles },
        { id: 'jobs', label: 'My Postings', icon: Briefcase },
        { id: 'matching', label: 'Talent Matches', icon: Sparkles },
        { id: 'agreements', label: 'Contracts', icon: FileText },
        { id: 'payments', label: 'Escrow Vault', icon: Lock },
        { id: 'progress', label: 'Execution', icon: CheckCheck },
        { id: 'disputes', label: 'Disputes', icon: Scale },
      ];
    }

    if (currentUser.role === 'admin') {
      return [
        { id: 'verifier', label: 'Assessor Desk', icon: ShieldCheck },
        { id: 'evidence', label: 'Evidence Queue', icon: FileText },
        { id: 'trust-score', label: 'Score Audits', icon: Award },
        { id: 'disputes', label: 'Disputes', icon: Scale },
      ];
    }

    // csc_operator
    return [
      { id: 'csc', label: 'Rural CSC Desk', icon: PhoneCall },
      { id: 'evidence', label: 'Upload Evidence', icon: ShieldCheck },
      { id: 'jobs', label: 'Job Search', icon: Briefcase },
    ];
  };

  const navLinks = getNavLinks();
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  const handleOpenAuth = (mode: 'signin' | 'signup', role?: 'worker' | 'employer' | 'admin' | 'csc_operator') => {
    setAuthModalMode(mode);
    if (role) setAuthModalRole(role);
    setAuthModalOpen(true);
    setUserDropdownOpen(false);
  };

  const getDashboardTabForRole = () => {
    if (!currentUser) return 'journey';
    if (currentUser.role === 'worker') return 'worker-dashboard';
    if (currentUser.role === 'employer') return 'employer-dashboard';
    if (currentUser.role === 'admin') return 'verifier';
    return 'csc';
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        {/* Top Micro Bar: Clean, Minimal Styling */}
        <div className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
          {/* Left: Platform Status & Quick Seed */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              <span className="font-bold text-slate-900">NavAstitva</span>
              <span className="text-slate-500 text-[11px] hidden sm:inline">• Verified Skills & Milestone Escrow</span>
            </div>

            {dbStatus?.isEmpty && (
              <button
                onClick={seedDatabaseDemo}
                disabled={isLoading}
                className="ml-2 px-2 py-0.5 rounded-md bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold text-[11px] transition-colors cursor-pointer"
                title="Populate demo data"
              >
                Load Sample Data
              </button>
            )}
          </div>

          {/* Right: User Authentication & Role Indicator */}
          <div className="flex items-center gap-3">
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="text-[11px] bg-red-100 hover:bg-red-200 text-red-700 font-bold px-2 py-0.5 rounded cursor-pointer"
              >
                Stop Voice Audio
              </button>
            )}

            {/* User Account / Session Controller */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                >
                  <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.name} 
                    className="w-5 h-5 rounded-full object-cover border border-orange-200" 
                  />
                  <span className="max-w-[120px] truncate">{currentUser.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    currentUser.role === 'worker' ? 'bg-orange-100 text-orange-800' :
                    currentUser.role === 'employer' ? 'bg-red-100 text-red-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {currentUser.role === 'admin' ? 'Assessor' : currentUser.role.replace('_', ' ')}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900 text-xs">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{currentUser.email || currentUser.phone}</div>
                      <div className="mt-1">
                        <span className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded font-semibold capitalize">
                          Role: {currentUser.role.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveTab(getDashboardTabForRole());
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-orange-600" />
                        <span>My Dashboard</span>
                      </button>

                      <button
                        onClick={() => handleOpenAuth('signup')}
                        className="w-full text-left px-3 py-2 text-xs text-orange-700 hover:bg-orange-50 font-medium flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                        <span>Switch / Register New Account</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await logout();
                          setActiveTab('journey');
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAuth('signin')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer shadow-2xs transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-600" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => handleOpenAuth('signup')}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 font-bold text-xs cursor-pointer shadow-2xs transition-colors"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div 
              onClick={() => setActiveTab(currentUser ? getDashboardTabForRole() : 'journey')} 
              className="flex items-center gap-3 cursor-pointer group"
              id="brand-logo"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900">NavAstitva</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 hidden sm:block">
                  Verified Skills • Simple Contracts • Escrow
                </p>
              </div>
            </div>

            {/* Desktop Role-Based Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xs' 
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Utility: Voice Assistant & 9 Indian Languages */}
            <div className="flex items-center gap-2">
              {/* Voice Assistant */}
              <button
                onClick={onOpenVoiceModal}
                id="voice-assistant-trigger"
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-xl text-xs font-bold border border-orange-200 transition-colors cursor-pointer"
                title="Speak or ask AI in any language"
              >
                <Mic className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="hidden sm:inline">Voice Assistant</span>
              </button>

              {/* Language Selector (9 Languages) */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  id="language-picker-btn"
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-600" />
                  <span>{currentLangObj.nativeName}</span>
                  <span className="text-[10px] text-slate-500">▼</span>
                </button>

                {langMenuOpen && (
                  <div 
                    id="language-dropdown"
                    className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 max-h-80 overflow-y-auto"
                  >
                    <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Language
                    </div>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as SupportedLanguage);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                          language === lang.code ? 'bg-orange-50 text-orange-900 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <span>{lang.nativeName}</span>
                        <span className="text-[11px] text-slate-400 font-normal">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1">
            {currentUser ? (
              <div className="p-3 mb-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500 capitalize">{currentUser.role.replace('_', ' ')} • {currentUser.phone}</div>
                </div>
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                    setActiveTab('journey');
                  }}
                  className="text-xs bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-2.5 py-1 rounded-lg font-bold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="p-3 mb-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleOpenAuth('signin');
                  }}
                  className="flex-1 text-center py-2 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleOpenAuth('signup');
                  }}
                  className="flex-1 text-center py-2 text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white"
                >
                  Create Account
                </button>
              </div>
            )}
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                    activeTab === link.id 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode={authModalMode}
        initialRole={authModalRole}
      />
    </>
  );
};
