export type UserRole = 'worker' | 'employer' | 'admin' | 'csc_operator';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  avatarUrl?: string;
  preferredLanguage: string;
  createdAt: string;
  cscOperatorId?: string;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'needs_evidence' | 'rejected';

export interface WorkerSkill {
  name: string;
  category: string;
  yearsOfExperience: number;
  proficiency: 'beginner' | 'intermediate' | 'expert';
  isVerified: boolean;
  verifiedAt?: string;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  avatarUrl: string;
  location: {
    city: string;
    district: string;
    state: string;
    pincode: string;
  };
  preferredLanguage: string;
  skills: WorkerSkill[];
  experienceYears: number;
  availability: 'available' | 'busy' | 'part-time';
  preferredDailyWage: number;
  workType: 'daily_wage' | 'contract' | 'full_time' | 'both';
  bio: string;
  jobsCompleted: number;
  verificationStatus: VerificationStatus;
  trustScore: number;
  ratingsAverage: number;
  ratingsCount: number;
  badges: string[];
  bankAccountVerified?: boolean;
  upiId?: string;
}

export interface EmployerProfile {
  id: string;
  userId: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  avatarUrl: string;
  location: {
    city: string;
    state: string;
  };
  industry: string;
  verified: boolean;
  jobsPosted: number;
  hiredWorkersCount: number;
  ratingsAverage: number;
  ratingsCount: number;
  trustDepositPaid?: boolean;
}

export interface EvidenceItem {
  id: string;
  workerId: string;
  skillName: string;
  title: string;
  type: 'photo' | 'video' | 'certificate' | 'reference' | 'work_sample';
  fileUrl: string;
  description: string;
  issueDate?: string;
  issuer?: string;
  status: 'pending' | 'analyzed' | 'verified' | 'flagged' | 'rejected';
  submittedAt: string;
  aiAssessment?: {
    detectedCategory: string;
    evidenceRelevance: 'high' | 'medium' | 'low';
    confidenceScore: number; // 0-100
    missingInformation?: string[];
    potentialInconsistencies?: string[];
    suggestedQuestions: string[];
    recommendedAssessmentLevel: 'Basic' | 'Intermediate' | 'Master Craftsman';
    explanation: string;
    isSuspicious?: boolean;
  };
  verifierNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface VerificationRequest {
  id: string;
  workerId: string;
  workerName: string;
  skillName: string;
  evidenceIds: string[];
  status: 'submitted' | 'under_ai_review' | 'under_human_review' | 'approved' | 'rejected' | 'needs_more_evidence';
  aiConfidence: number;
  aiSummary: string;
  verifierNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface TrustScoreDetails {
  score: number;
  breakdown: {
    verifiedSkills: number; // Max 30
    evidence: number;       // Max 25
    workHistory: number;    // Max 25
    ratings: number;        // Max 20
  };
  explanation: string[];
  improvementTips: string[];
  lastUpdated: string;
  factors: {
    verifiedSkillsCount: number;
    completedJobsCount: number;
    averageRating: number;
    onTimeCompletionRate: number;
    disputeRate: number;
  };
}

export interface Job {
  id: string;
  employerId: string;
  employerName: string;
  employerLocation: string;
  employerRating: number;
  title: string;
  description: string;
  requiredSkills: string[];
  location: {
    city: string;
    state: string;
    area: string;
  };
  wage: number;
  wageType: 'daily' | 'hourly' | 'project';
  duration: string;
  startDate: string;
  workType: 'daily_wage' | 'contract' | 'full_time';
  numberOfWorkers: number;
  applicantsCount: number;
  status: 'open' | 'in_progress' | 'closed';
  applicationDeadline: string;
  createdAt: string;
}

export interface MatchScoreDetails {
  totalScore: number;
  breakdown: {
    skillMatch: number;      // 40%
    experienceMatch: number; // 20%
    locationMatch: number;   // 15%
    availabilityMatch: number; // 15%
    wageMatch: number;       // 10%
  };
  matchedSkills: string[];
  missingSkills: string[];
  locationCompatibility: string;
  availabilityCompatibility: string;
  experienceCompatibility: string;
  explanation: string;
}

export type ApplicationStatus = 'submitted' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn' | 'completed';

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  workerName: string;
  workerAvatar: string;
  workerLocation: string;
  workerSkills: string[];
  workerTrustScore: number;
  workerRating: number;
  proposedWage: number;
  coverNote: string;
  status: ApplicationStatus;
  matchScore: number;
  matchDetails?: MatchScoreDetails;
  appliedAt: string;
  updatedAt: string;
}

export type AgreementStatus = 'draft' | 'pending_worker_acceptance' | 'pending_employer_acceptance' | 'active' | 'completed' | 'disputed' | 'cancelled';

export interface DigitalAgreement {
  id: string;
  agreementNumber: string;
  jobId: string;
  jobTitle: string;
  employerId: string;
  employerName: string;
  workerId: string;
  workerName: string;
  scopeOfWork: string;
  wage: number;
  wageType: 'daily' | 'hourly' | 'project';
  duration: string;
  startDate: string;
  endDate: string;
  paymentTerms: string;
  completionConditions: string;
  cancellationTerms: string;
  status: AgreementStatus;
  workerAcceptedAt?: string;
  employerAcceptedAt?: string;
  createdAt: string;
}

export type PaymentStatus = 'demo_held' | 'released' | 'refunded' | 'disputed_hold';

export interface PaymentRecord {
  id: string;
  agreementId: string;
  jobTitle: string;
  employerId: string;
  workerId: string;
  amount: number;
  currency: 'INR';
  status: PaymentStatus;
  escrowReference: string;
  demoLabel: boolean;
  committedAt: string;
  releasedAt?: string;
  paymentMethod: string;
  notes: string;
}

export interface WorkProgressUpdate {
  id: string;
  timestamp: string;
  note: string;
  percentage: number;
  photoUrls?: string[];
  submittedBy: 'worker' | 'employer';
}

export interface WorkProgress {
  id: string;
  agreementId: string;
  workerId: string;
  jobTitle: string;
  updates: WorkProgressUpdate[];
  currentPercentage: number;
  completionSubmitted: boolean;
  completionSubmittedAt?: string;
  completionEvidenceUrls: string[];
  completionStatus: 'in_progress' | 'submitted_for_review' | 'corrections_requested' | 'confirmed' | 'rejected';
  employerFeedback?: string;
  confirmedAt?: string;
}

export interface Review {
  id: string;
  agreementId: string;
  fromUserId: string;
  fromUserName: string;
  fromRole: 'employer' | 'worker';
  toUserId: string;
  toUserName: string;
  toRole: 'employer' | 'worker';
  jobTitle: string;
  rating: number; // 1-5
  qualityOfWork: number;
  communication: number;
  punctuality: number;
  comment: string;
  createdAt: string;
}

export type DisputeStatus = 'open' | 'ai_analyzed' | 'under_human_review' | 'resolved' | 'dismissed';

export interface Dispute {
  id: string;
  disputeNumber: string;
  agreementId: string;
  jobTitle: string;
  raisedBy: 'worker' | 'employer';
  raisedByUserId: string;
  raisedByName: string;
  againstUserId: string;
  againstName: string;
  reason: string;
  description: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  aiAnalysis?: {
    summary: string;
    conflictingClaims: string[];
    relevantAgreementTerms: string[];
    suggestedQuestions: string[];
    recommendedResolutionOptions: string[];
    confidenceLevel: 'high' | 'medium' | 'low';
    isNeutral: boolean;
  };
  verifierDecision?: {
    outcome: 'full_release_to_worker' | 'partial_settlement' | 'full_refund_to_employer' | 'mutual_renegotiation';
    resolutionNotes: string;
    settlementAmount?: number;
    decidedBy: string;
    decidedAt: string;
  };
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actorUserId: string;
  actorName: string;
  actorRole: UserRole;
  targetEntity: string;
  targetId: string;
  details: string;
}

export interface PlatformStats {
  registeredWorkers: number;
  verifiedSkills: number;
  jobsPosted: number;
  agreementsSigned: number;
  paymentsProtectedInr: number;
  averageTrustScore: number;
  disputeResolutionRate: number;
  activeCscCenters: number;
}

// Convenient Aliases
export type DisputeRecord = Dispute;
export type ReviewItem = Review;
export type RatingRecord = Review;
export type TrustScoreBreakdown = TrustScoreDetails;
export type WorkProgressRecord = WorkProgress;
