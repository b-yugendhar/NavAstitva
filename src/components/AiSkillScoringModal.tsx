import React, { useState } from 'react';
import { 
  X, Sparkles, Upload, Camera, CheckCircle2, AlertCircle, 
  FileText, Award, Image as ImageIcon, ArrowRight, ArrowLeft, 
  ShieldCheck, Loader2, Star, TrendingUp, DollarSign, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { WorkerProfile } from '../types.ts';

interface AiSkillScoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScoreSuccess?: (updatedWorker: WorkerProfile, scoreData: any) => void;
}

interface WorkPhotoItem {
  fileUrl: string;
  caption: string;
  name: string;
}

export const AiSkillScoringModal: React.FC<AiSkillScoringModalProps> = ({ 
  isOpen, 
  onClose,
  onScoreSuccess 
}) => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Step 1: Profile & Trade Basics (no default values!)
  const [workerName, setWorkerName] = useState(currentUser?.name || '');
  const [tradeSkill, setTradeSkill] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [dailyWage, setDailyWage] = useState('');
  const [city, setCity] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string>('');

  // Step 2: Identity Document
  const [docType, setDocType] = useState('Aadhaar Card');
  const [docTitle, setDocTitle] = useState('');
  const [docFileUrl, setDocFileUrl] = useState<string>('');
  const [docFileName, setDocFileName] = useState('');

  // Step 3: Trade Certificate
  const [hasCert, setHasCert] = useState(true);
  const [certTitle, setCertTitle] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certYear, setCertYear] = useState('');
  const [certFileUrl, setCertFileUrl] = useState<string>('');
  const [certFileName, setCertFileName] = useState('');

  // Step 4: Work Photos (Portfolio)
  const [workPhotos, setWorkPhotos] = useState<WorkPhotoItem[]>([]);
  const [tempCaption, setTempCaption] = useState('');

  // Step 5: AI Analysis Result
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  if (!isOpen) return null;

  // File to base64 helper
  const handleFileRead = (file: File, callback: (url: string, name: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileRead(e.target.files[0], (url) => setProfilePhoto(url));
    }
  };

  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileRead(e.target.files[0], (url, name) => {
        setDocFileUrl(url);
        setDocFileName(name);
      });
    }
  };

  const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileRead(e.target.files[0], (url, name) => {
        setCertFileUrl(url);
        setCertFileName(name);
      });
    }
  };

  const handleWorkPhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileRead(e.target.files[0], (url, name) => {
        setWorkPhotos(prev => [
          ...prev, 
          { fileUrl: url, caption: tempCaption || `Field sample of ${tradeSkill || 'work'}`, name }
        ]);
        setTempCaption('');
      });
    }
  };

  const removeWorkPhoto = (index: number) => {
    setWorkPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    setErrorMsg('');
    if (step === 1) {
      if (!workerName.trim()) {
        setErrorMsg('Please provide your full name.');
        return false;
      }
      if (!tradeSkill.trim()) {
        setErrorMsg('Please specify your primary vocational skill (e.g. Electrician, Mason, Plumber).');
        return false;
      }
      if (!experienceYears || Number(experienceYears) < 0) {
        setErrorMsg('Please specify your years of trade experience.');
        return false;
      }
      if (!city.trim()) {
        setErrorMsg('Please specify your city or region.');
        return false;
      }
    } else if (step === 2) {
      if (!docTitle.trim() && !docFileUrl) {
        setErrorMsg('Please provide your document identification details or upload a copy.');
        return false;
      }
    } else if (step === 4) {
      if (workPhotos.length === 0) {
        setErrorMsg('Please upload at least 1 photo of your completed work or active worksite for AI assessment.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setErrorMsg('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const runAiSkillScoring = async () => {
    if (!validateStep(4)) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        workerName: workerName.trim(),
        tradeSkill: tradeSkill.trim(),
        experienceYears: Number(experienceYears) || 3,
        dailyWage: dailyWage ? Number(dailyWage) : undefined,
        city: city.trim(),
        profilePhoto: profilePhoto || undefined,
        identityDoc: {
          documentType: docType,
          title: docTitle.trim() || `${docType} Verification`,
          fileUrl: docFileUrl
        },
        tradeCertificate: hasCert ? {
          title: certTitle.trim() || 'Vocational Trade Certificate',
          issuer: certIssuer.trim() || 'Recognized Technical Board',
          issueYear: certYear ? Number(certYear) : undefined,
          fileUrl: certFileUrl
        } : undefined,
        workPhotos: workPhotos.map(p => ({
          fileUrl: p.fileUrl,
          caption: p.caption
        }))
      };

      const res = await fetch('/api/ai/skill-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser ? { 'x-user-id': currentUser.id } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze skill profile');
      }

      setAnalysisResult(data.analysis);
      setCurrentStep(5);
      if (onScoreSuccess) {
        onScoreSuccess(data.worker, data.analysis);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error executing AI Skill Scoring. Please check connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between bg-orange-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-orange-800 font-bold text-xs uppercase tracking-wider">
                <span>AI Skill Assessment</span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                Accredit Your Skills
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
          {[
            { step: 1, label: 'Profile' },
            { step: 2, label: 'ID Doc' },
            { step: 3, label: 'Certificate' },
            { step: 4, label: 'Work Photos' },
            { step: 5, label: 'AI Score' },
          ].map((item) => (
            <div 
              key={item.step} 
              className={`flex items-center gap-1.5 font-medium ${
                currentStep === item.step 
                  ? 'text-orange-600 font-bold' 
                  : currentStep > item.step 
                  ? 'text-red-500 font-semibold' 
                  : 'text-slate-400'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === item.step 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xs' 
                  : currentStep > item.step 
                  ? 'bg-red-500 text-white' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep > item.step ? '✓' : item.step}
              </div>
              <span className="hidden sm:inline">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Profile Image & Personal Trade Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-orange-50/50 border border-orange-100 rounded-xl text-xs text-orange-950 leading-relaxed">
                Provide your basic trade details and photo. AI will score your proficiency and build your profile.
              </div>

              {/* Profile Photo Upload */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="relative">
                  {profilePhoto ? (
                    <img 
                      src={profilePhoto} 
                      alt="Profile Preview" 
                      className="w-16 h-16 rounded-xl object-cover border-2 border-orange-500 shadow-xs" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-orange-50 border-2 border-dashed border-orange-300 flex flex-col items-center justify-center text-orange-600">
                      <Camera className="w-6 h-6" />
                      <span className="text-[9px] mt-0.5 font-semibold">Photo</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Profile Photo
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Clear face photo for your profile card.
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-orange-300 hover:bg-orange-50 text-orange-700 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{profilePhoto ? 'Change Photo' : 'Upload Photo'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleProfilePhotoChange} 
                    />
                  </label>
                  {profilePhoto && (
                    <button 
                      type="button" 
                      onClick={() => setProfilePhoto('')}
                      className="ml-2 text-xs text-red-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Name & Trade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full legal name"
                    value={workerName}
                    onChange={(e) => setWorkerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Trade Skill <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electrician, Mason, Plumber, Carpenter"
                    value={tradeSkill}
                    onChange={(e) => setTradeSkill(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Experience, Wage, City */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Years of Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 4"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Desired Daily Wage (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 950"
                    value={dailyWage}
                    onChange={(e) => setDailyWage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City / Working Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Government Identity Document */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-orange-50/60 border border-orange-100 rounded-xl text-xs text-orange-950 leading-relaxed">
                Provide an ID document for verification and trust scoring.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Document Type
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Voter ID">Voter ID Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Driving License">Commercial / Driving License</option>
                    <option value="Labor Department Card">State Labour Welfare Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Document ID / Masked Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. XXXX-XXXX-1234 or Voter Card No."
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* ID Document File Upload Box */}
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center bg-slate-50/70 hover:bg-orange-50/40 transition-colors">
                {docFileUrl ? (
                  <div className="flex items-center justify-between p-2.5 bg-white border border-orange-200 rounded-lg shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-orange-600 shrink-0" />
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-800 truncate max-w-xs">{docFileName || `${docType} Attached`}</div>
                        <div className="text-[10px] text-orange-700 font-semibold">Document ready for check</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setDocFileUrl(''); setDocFileName(''); }}
                      className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <FileText className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <div className="text-xs font-bold text-slate-700">Upload {docType} Photo or PDF</div>
                    <p className="text-[11px] text-slate-500 mt-0.5 mb-3">Front side scan or photograph</p>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Select Document</span>
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        className="hidden" 
                        onChange={handleDocFileChange} 
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Vocational Trade Certificate */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50/50 border border-orange-100 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-orange-950">Do you hold a trade certificate or diploma?</div>
                  <div className="text-[11px] text-orange-700">ITI, PMKVY, Polytechnic, or Trade Credential</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHasCert(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      hasCert ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-2xs' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasCert(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !hasCert ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-2xs' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {hasCert ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Certificate / Course Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ITI Trade Certificate in Electrical Installation"
                      value={certTitle}
                      onChange={(e) => setCertTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Issuing Institution
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. NCVT / Skill India"
                        value={certIssuer}
                        onChange={(e) => setCertIssuer(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Year of Issuance
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 2021"
                        value={certYear}
                        onChange={(e) => setCertYear(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Certificate file attachment */}
                  <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center bg-slate-50/70">
                    {certFileUrl ? (
                      <div className="flex items-center justify-between p-2.5 bg-white border border-orange-200 rounded-lg shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <Award className="w-5 h-5 text-orange-500 shrink-0" />
                          <div className="text-left">
                            <div className="text-xs font-bold text-slate-800 truncate max-w-xs">{certFileName || 'Certificate Attached'}</div>
                            <div className="text-[10px] text-orange-700 font-semibold">Ready for verification</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setCertFileUrl(''); setCertFileName(''); }}
                          className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Award className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                        <div className="text-xs font-bold text-slate-700">Attach Certificate Scan / Photo</div>
                        <p className="text-[11px] text-slate-500 mt-0.5 mb-3">Upload qualification certificate</p>
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Certificate</span>
                          <input 
                            type="file" 
                            accept="image/*,application/pdf" 
                            className="hidden" 
                            onChange={handleCertFileChange} 
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                  <p className="text-xs text-slate-600 font-medium">
                    No certificate required. Your practical skill will be scored directly based on your work photos, experience, and employer feedback.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Work Photos (Field Artifacts) */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-orange-50/60 border border-orange-100 rounded-xl text-xs text-orange-950 leading-relaxed">
                Upload photos of your completed projects, installations, or active worksite tasks.
              </div>

              {/* Upload Input & Caption */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Describe this Work Sample
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Conduit wiring with distribution board"
                    value={tempCaption}
                    onChange={(e) => setTempCaption(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">Attach photo of your work</span>
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Add Work Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleWorkPhotoAdd} 
                    />
                  </label>
                </div>
              </div>

              {/* Attached Photos Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    Uploaded Work Samples ({workPhotos.length})
                  </span>
                  {workPhotos.length === 0 && (
                    <span className="text-[11px] text-red-500 font-semibold">* At least 1 photo required</span>
                  )}
                </div>

                {workPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {workPhotos.map((photo, index) => (
                      <div key={index} className="relative group border border-slate-200 rounded-xl overflow-hidden bg-slate-100">
                        <img 
                          src={photo.fileUrl} 
                          alt={photo.caption} 
                          className="w-full h-28 object-cover" 
                        />
                        <div className="p-1.5 bg-white text-[10px] font-medium text-slate-700 truncate">
                          {photo.caption}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeWorkPhoto(index)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 text-white rounded-md opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                    <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-500">No work photos attached yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: AI Scoring Result */}
          {currentStep === 5 && analysisResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Score Hero Card */}
              <div className="p-5 bg-gradient-to-br from-orange-600 to-red-700 text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wide mb-2">
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    <span>{analysisResult.tier || 'Certified Specialist'}</span>
                  </div>
                  <h3 className="text-xl font-black">{workerName}</h3>
                  <p className="text-xs text-white/80 mt-0.5">{tradeSkill} • {city}</p>
                  <p className="text-[11px] text-white/90 mt-2 max-w-sm">
                    {analysisResult.summary}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-3.5 bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl min-w-28">
                  <div className="text-3xl font-black text-amber-200">
                    {analysisResult.overallScore}
                  </div>
                  <div className="text-[10px] text-white/80 uppercase tracking-wider font-bold">Skill Score</div>
                  <div className="text-[9px] text-white/70 mt-0.5">Out of 100</div>
                </div>
              </div>

              {/* Breakdown Grid */}
              {analysisResult.breakdown && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-orange-50/60 border border-orange-100 rounded-xl text-center">
                    <div className="text-xs text-orange-950 font-bold">Photo Craft</div>
                    <div className="text-lg font-black text-orange-600 mt-0.5">
                      {analysisResult.breakdown.photoAssessmentScore}/25
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50/60 border border-orange-100 rounded-xl text-center">
                    <div className="text-xs text-orange-950 font-bold">Certificate</div>
                    <div className="text-lg font-black text-orange-600 mt-0.5">
                      {analysisResult.breakdown.certificateAuthenticityScore}/25
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50/60 border border-orange-100 rounded-xl text-center">
                    <div className="text-xs text-orange-950 font-bold">Identity Doc</div>
                    <div className="text-lg font-black text-orange-600 mt-0.5">
                      {analysisResult.breakdown.identityVerificationScore}/25
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50/60 border border-orange-100 rounded-xl text-center">
                    <div className="text-xs text-orange-950 font-bold">Experience</div>
                    <div className="text-lg font-black text-orange-600 mt-0.5">
                      {analysisResult.breakdown.experienceCredibilityScore}/25
                    </div>
                  </div>
                </div>
              )}

              {/* Strengths & Recommendations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {analysisResult.keyStrengths && analysisResult.keyStrengths.length > 0 && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                      <span>Verified Strengths</span>
                    </div>
                    <ul className="space-y-1 text-slate-600 text-[11px]">
                      {analysisResult.keyStrengths.map((s: string, idx: number) => (
                        <li key={idx}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                  <div className="p-3.5 bg-orange-50/50 border border-orange-100 rounded-xl space-y-1.5">
                    <div className="font-bold text-orange-950 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
                      <span>Wage & Growth Advice</span>
                    </div>
                    <ul className="space-y-1 text-orange-900 text-[11px]">
                      {analysisResult.recommendations.map((r: string, idx: number) => (
                        <li key={idx}>• {r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {currentStep > 1 && currentStep < 5 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 border border-slate-300 hover:bg-white text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          {currentStep === 1 && (
            <div className="text-xs text-slate-400 font-medium">
              Step 1 of 4: Trade Details
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {currentStep < 4 && (
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 4 && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={runAiSkillScoring}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Artifacts with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Skill Scoring</span>
                  </>
                )}
              </button>
            )}

            {currentStep === 5 && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Finish</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
