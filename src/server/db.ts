import { 
  User, WorkerProfile, EmployerProfile, Job, Application, 
  EvidenceItem, VerificationRequest, DigitalAgreement, 
  PaymentRecord, WorkProgress, Review, Dispute, AuditLog, PlatformStats,
  TrustScoreDetails
} from '../types.ts';
import { 
  initMongoDB, isMongoConnected, loadCollection, 
  persistEntity, removeEntity 
} from './mongodb.ts';

class DatabaseStore {
  users: User[] = [];
  workers: WorkerProfile[] = [];
  employers: EmployerProfile[] = [];
  jobs: Job[] = [];
  applications: Application[] = [];
  evidence: EvidenceItem[] = [];
  verificationRequests: VerificationRequest[] = [];
  agreements: DigitalAgreement[] = [];
  payments: PaymentRecord[] = [];
  progressUpdates: WorkProgress[] = [];
  reviews: Review[] = [];
  disputes: Dispute[] = [];
  auditLogs: AuditLog[] = [];

  private isHydrated = false;

  constructor() {
    this.resetEmpty();
  }

  /**
   * Reset all data structures to a clean, empty state with zero dummy profiles
   */
  resetEmpty() {
    this.users = [];
    this.workers = [];
    this.employers = [];
    this.jobs = [];
    this.applications = [];
    this.evidence = [];
    this.verificationRequests = [];
    this.agreements = [];
    this.payments = [];
    this.progressUpdates = [];
    this.reviews = [];
    this.disputes = [];
    this.auditLogs = [];
  }

  /**
   * Connect to MongoDB and load any existing persistent data
   */
  async initPersistence() {
    if (this.isHydrated) return;
    const { connected } = await initMongoDB();
    if (connected) {
      try {
        const [
          users, workers, employers, jobs, applications,
          evidence, verifications, agreements, payments,
          progress, reviews, disputes, audit
        ] = await Promise.all([
          loadCollection<User>('users'),
          loadCollection<WorkerProfile>('workers'),
          loadCollection<EmployerProfile>('employers'),
          loadCollection<Job>('jobs'),
          loadCollection<Application>('applications'),
          loadCollection<EvidenceItem>('evidence'),
          loadCollection<VerificationRequest>('verificationRequests'),
          loadCollection<DigitalAgreement>('agreements'),
          loadCollection<PaymentRecord>('payments'),
          loadCollection<WorkProgress>('progressUpdates'),
          loadCollection<Review>('reviews'),
          loadCollection<Dispute>('disputes'),
          loadCollection<AuditLog>('auditLogs'),
        ]);

        if (users.length > 0) this.users = users;
        if (workers.length > 0) this.workers = workers;
        if (employers.length > 0) this.employers = employers;
        if (jobs.length > 0) this.jobs = jobs;
        if (applications.length > 0) this.applications = applications;
        if (evidence.length > 0) this.evidence = evidence;
        if (verifications.length > 0) this.verificationRequests = verifications;
        if (agreements.length > 0) this.agreements = agreements;
        if (payments.length > 0) this.payments = payments;
        if (progress.length > 0) this.progressUpdates = progress;
        if (reviews.length > 0) this.reviews = reviews;
        if (disputes.length > 0) this.disputes = disputes;
        if (audit.length > 0) this.auditLogs = audit;

        console.log(`[Database] Loaded ${this.users.length} users, ${this.jobs.length} jobs, ${this.workers.length} workers from MongoDB.`);
      } catch (err) {
        console.error('[Database] Error loading collections from MongoDB:', err);
      }
    }
    this.isHydrated = true;
  }

  /**
   * Persist a specific entity to MongoDB asynchronously
   */
  async save(collectionName: string, entity: { id: string; [key: string]: any }) {
    if (isMongoConnected()) {
      await persistEntity(collectionName, entity);
    }
  }

  /**
   * Delete an entity from MongoDB asynchronously
   */
  async delete(collectionName: string, id: string) {
    if (isMongoConnected()) {
      await removeEntity(collectionName, id);
    }
  }

  /**
   * Real platform metrics computed live from actual database records
   */
  getStats(): PlatformStats {
    const totalEscrow = this.payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const verifiedSkillsCount = this.workers.reduce(
      (acc, w) => acc + (w.skills ? w.skills.filter(s => s.isVerified).length : 0), 
      0
    );
    const avgTrust = this.workers.length > 0 
      ? Math.round(this.workers.reduce((a, w) => a + (w.trustScore || 50), 0) / this.workers.length)
      : 0;

    const totalDisputes = this.disputes.length;
    const resolvedDisputes = this.disputes.filter(d => d.status === 'resolved').length;
    const disputeResolutionRate = totalDisputes > 0 
      ? Math.round((resolvedDisputes / totalDisputes) * 100) 
      : 100;

    return {
      registeredWorkers: this.workers.length,
      verifiedSkills: verifiedSkillsCount,
      jobsPosted: this.jobs.length,
      agreementsSigned: this.agreements.length,
      paymentsProtectedInr: totalEscrow,
      averageTrustScore: avgTrust,
      disputeResolutionRate,
      activeCscCenters: this.users.filter(u => u.role === 'csc_operator').length
    };
  }

  getWorkerByUserId(userId: string): WorkerProfile | undefined {
    return this.workers.find(w => w.userId === userId);
  }

  getEmployerByUserId(userId: string): EmployerProfile | undefined {
    return this.employers.find(e => e.userId === userId);
  }

  calculateTrustScore(workerId: string): TrustScoreDetails {
    const worker = this.workers.find(w => w.id === workerId);
    if (!worker) {
      return {
        score: 50,
        breakdown: { verifiedSkills: 0, evidence: 0, workHistory: 0, ratings: 0 },
        explanation: ['New individual profile created. Complete verifications to build your trust score.'],
        improvementTips: ['Submit practical work photos or vocational certificates', 'Complete jobs through digital agreements'],
        lastUpdated: new Date().toISOString().split('T')[0],
        factors: {
          verifiedSkillsCount: 0,
          completedJobsCount: 0,
          averageRating: 0,
          onTimeCompletionRate: 100,
          disputeRate: 0
        }
      };
    }

    const verifiedSkillsCount = (worker.skills || []).filter(s => s.isVerified).length;
    const evidenceItems = this.evidence.filter(e => e.workerId === workerId && e.status === 'verified');
    const completedJobs = worker.jobsCompleted || 0;
    const avgRating = worker.ratingsAverage || 0;

    // Mathematical breakdown:
    // Max 30: Verified skills
    const verifiedSkillsScore = Math.min(30, verifiedSkillsCount * 15);
    // Max 25: Evidence quality and relevance
    const evidenceScore = Math.min(25, evidenceItems.length * 8 + (evidenceItems.length > 0 ? 5 : 0));
    // Max 25: Work history & completed jobs
    const workHistoryScore = Math.min(25, Math.round(completedJobs * 2.5));
    // Max 20: Employer ratings
    const ratingsScore = Math.min(20, Math.round((avgRating / 5) * 20));

    // Base score is 50 for registered users, can climb to 100
    const total = Math.min(100, Math.max(50, 50 + verifiedSkillsScore + evidenceScore + workHistoryScore + ratingsScore - 50));

    const explanations: string[] = [];
    if (verifiedSkillsCount > 0) {
      explanations.push(`${verifiedSkillsCount} skill(s) officially authenticated by vocational assessors.`);
    } else {
      explanations.push('Skills are currently self-declared and awaiting assessor verification.');
    }
    if (evidenceItems.length > 0) {
      explanations.push(`${evidenceItems.length} verified work sample(s) or trade certification(s) logged.`);
    }
    if (completedJobs > 0) {
      explanations.push(`${completedJobs} job(s) completed successfully under digital agreements.`);
    }
    if (avgRating > 0) {
      explanations.push(`Client rating average of ${avgRating.toFixed(1)}/5 from ${worker.ratingsCount} review(s).`);
    }

    const tips: string[] = [];
    if (verifiedSkillsCount < (worker.skills || []).length) {
      tips.push('Submit work photo or trade certificate evidence to verify remaining skills.');
    }
    if (evidenceItems.length < 3) {
      tips.push('Upload high-quality photos of your completed projects or tools to enhance evidence credibility.');
    }
    if (completedJobs === 0) {
      tips.push('Apply to open jobs and sign your first NavAstitva digital agreement to earn milestone history.');
    }

    return {
      score: total,
      breakdown: {
        verifiedSkills: verifiedSkillsScore,
        evidence: evidenceScore,
        workHistory: workHistoryScore,
        ratings: ratingsScore
      },
      explanation: explanations,
      improvementTips: tips,
      lastUpdated: new Date().toISOString().split('T')[0],
      factors: {
        verifiedSkillsCount,
        completedJobsCount: completedJobs,
        averageRating: avgRating,
        onTimeCompletionRate: 100,
        disputeRate: 0
      }
    };
  }
}

export const db = new DatabaseStore();
