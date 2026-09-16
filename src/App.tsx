import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { VoiceAssistantModal } from './components/VoiceAssistantModal.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { WorkerDashboard } from './pages/WorkerDashboard.tsx';
import { EmployerDashboard } from './pages/EmployerDashboard.tsx';
import { EvidenceSubmissionPage } from './pages/EvidenceSubmissionPage.tsx';
import { VerificationDashboardPage } from './pages/VerificationDashboardPage.tsx';
import { TrustScorePage } from './pages/TrustScorePage.tsx';
import { JobMarketplacePage } from './pages/JobMarketplacePage.tsx';
import { CandidateMatchingPage } from './pages/CandidateMatchingPage.tsx';
import { AgreementsPage } from './pages/AgreementsPage.tsx';
import { PaymentProtectionPage } from './pages/PaymentProtectionPage.tsx';
import { WorkProgressPage } from './pages/WorkProgressPage.tsx';
import { RatingsPage } from './pages/RatingsPage.tsx';
import { DisputeResolutionPage } from './pages/DisputeResolutionPage.tsx';
import { CscAssistedOnboardingPage } from './pages/CscAssistedOnboardingPage.tsx';
import { WorkerProfilePage } from './pages/WorkerProfilePage.tsx';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';

function UnauthorizedNotice({ 
  requiredRole, 
  currentRole, 
  onRedirect 
}: { 
  requiredRole: string; 
  currentRole?: string; 
  onRedirect: () => void 
}) {
  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-orange-200 shadow-xs text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-black text-slate-900">Access Restricted</h2>
      <p className="text-xs text-slate-600 leading-relaxed">
        This section is for <strong>{requiredRole}</strong> accounts.
        {currentRole ? (
          <> You are signed in as <span className="capitalize font-semibold text-orange-600">{currentRole.replace('_', ' ')}</span>.</>
        ) : (
          <> Please sign in to access this page.</>
        )}
      </p>
      <button
        onClick={onRedirect}
        className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
      >
        <span>Go to Dashboard</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function MainAppContent() {
  const [activeTab, setActiveTab] = useState('journey');
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  // If user signs in and is on generic landing page, seamlessly navigate to their dashboard
  useEffect(() => {
    if (currentUser && activeTab === 'journey') {
      if (currentUser.role === 'worker') setActiveTab('worker-dashboard');
      else if (currentUser.role === 'employer') setActiveTab('employer-dashboard');
      else if (currentUser.role === 'admin') setActiveTab('verifier');
      else if (currentUser.role === 'csc_operator') setActiveTab('csc');
    }
  }, [currentUser]);

  const getDashboardTabForRole = () => {
    if (!currentUser) return 'journey';
    if (currentUser.role === 'worker') return 'worker-dashboard';
    if (currentUser.role === 'employer') return 'employer-dashboard';
    if (currentUser.role === 'admin') return 'verifier';
    return 'csc';
  };

  const renderCurrentView = () => {
    // Role-based view guards
    if (activeTab === 'verifier' && currentUser && currentUser.role !== 'admin') {
      return (
        <UnauthorizedNotice 
          requiredRole="Vocational Assessor" 
          currentRole={currentUser.role} 
          onRedirect={() => setActiveTab(getDashboardTabForRole())} 
        />
      );
    }

    if (activeTab === 'employer-dashboard' && currentUser && currentUser.role !== 'employer' && currentUser.role !== 'admin') {
      return (
        <UnauthorizedNotice 
          requiredRole="Employer" 
          currentRole={currentUser.role} 
          onRedirect={() => setActiveTab(getDashboardTabForRole())} 
        />
      );
    }

    if (activeTab === 'worker-dashboard' && currentUser && currentUser.role !== 'worker' && currentUser.role !== 'admin') {
      return (
        <UnauthorizedNotice 
          requiredRole="Skilled Worker" 
          currentRole={currentUser.role} 
          onRedirect={() => setActiveTab(getDashboardTabForRole())} 
        />
      );
    }

    if (activeTab === 'matching' && currentUser && currentUser.role !== 'employer' && currentUser.role !== 'admin') {
      return (
        <UnauthorizedNotice 
          requiredRole="Employer" 
          currentRole={currentUser.role} 
          onRedirect={() => setActiveTab(getDashboardTabForRole())} 
        />
      );
    }

    switch (activeTab) {
      case 'journey':
        return <LandingPage onNavigate={setActiveTab} onOpenVoiceModal={() => setVoiceModalOpen(true)} />;
      case 'worker-dashboard':
        return <WorkerDashboard onNavigate={setActiveTab} />;
      case 'employer-dashboard':
        return <EmployerDashboard onNavigate={setActiveTab} />;
      case 'jobs':
        return <JobMarketplacePage />;
      case 'evidence':
        return <EvidenceSubmissionPage />;
      case 'trust-score':
        return <TrustScorePage />;
      case 'matching':
        return <CandidateMatchingPage onNavigate={setActiveTab} />;
      case 'agreements':
        return <AgreementsPage onNavigate={setActiveTab} />;
      case 'payments':
        return <PaymentProtectionPage onNavigate={setActiveTab} />;
      case 'progress':
        return <WorkProgressPage onNavigate={setActiveTab} />;
      case 'ratings':
        return <RatingsPage />;
      case 'disputes':
        return <DisputeResolutionPage />;
      case 'verifier':
        return <VerificationDashboardPage />;
      case 'csc':
        return <CscAssistedOnboardingPage />;
      case 'worker-profile':
        return <WorkerProfilePage />;
      default:
        return <LandingPage onNavigate={setActiveTab} onOpenVoiceModal={() => setVoiceModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-orange-200 selection:text-orange-950">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenVoiceModal={() => setVoiceModalOpen(true)} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {renderCurrentView()}
      </main>

      {/* Voice & Multilingual Assistant Modal */}
      <VoiceAssistantModal 
        isOpen={voiceModalOpen} 
        onClose={() => setVoiceModalOpen(false)} 
      />

      {/* Clean Simplified Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 text-sm">NavAstitva</span>
            <span>—</span>
            <span className="text-slate-300">Skilled Employment Ecosystem</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Verified Skills</span>
            <span>•</span>
            <span>Milestone Escrow</span>
            <span>•</span>
            <span>Direct Hiring</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainAppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
