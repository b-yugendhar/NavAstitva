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
   * Populate rich demonstration data for all 11 stages of the employment lifecycle
   */
  seedDemo() {
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    this.users = [
      {
        id: 'usr-worker-1',
        name: 'Ramesh Kumar',
        email: 'ramesh.kumar@example.com',
        phone: '9876543210',
        password: 'password123',
        role: 'worker',
        avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200',
        preferredLanguage: 'hi',
        createdAt: now
      },
      {
        id: 'usr-employer-1',
        name: 'Anita Sharma',
        email: 'anita@apexinfra.com',
        phone: '9876543211',
        password: 'password123',
        role: 'employer',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
        preferredLanguage: 'en',
        createdAt: now
      },
      {
        id: 'usr-admin-1',
        name: 'Vikram Seth',
        email: 'vikram.seth@nsdc-assessor.org',
        phone: '9876543212',
        password: 'password123',
        role: 'admin',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
        preferredLanguage: 'en',
        createdAt: now
      },
      {
        id: 'usr-csc-1',
        name: 'Pooja Patel',
        email: 'pooja.patel@csc-center.gov.in',
        phone: '9876543213',
        password: 'password123',
        role: 'csc_operator',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
        preferredLanguage: 'hi',
        createdAt: now
      }
    ];

    this.workers = [
      {
        id: 'worker-1',
        userId: 'usr-worker-1',
        fullName: 'Ramesh Kumar',
        phone: '9876543210',
        email: 'ramesh.kumar@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200',
        location: {
          city: 'Hyderabad',
          district: 'Rangareddy',
          state: 'Telangana',
          pincode: '500081'
        },
        preferredLanguage: 'hi',
        skills: [
          {
            name: 'Electrical Wiring (Domestic & Commercial)',
            category: 'Electrical Systems',
            yearsOfExperience: 7,
            proficiency: 'expert',
            isVerified: true,
            verifiedAt: today
          },
          {
            name: 'Solar Rooftop & Inverter Setup',
            category: 'Renewable Energy',
            yearsOfExperience: 4,
            proficiency: 'expert',
            isVerified: true,
            verifiedAt: today
          },
          {
            name: '3-Phase Industrial Panel Troubleshooting',
            category: 'Industrial Systems',
            yearsOfExperience: 5,
            proficiency: 'intermediate',
            isVerified: true,
            verifiedAt: today
          }
        ],
        experienceYears: 7,
        availability: 'available',
        preferredDailyWage: 1100,
        workType: 'both',
        bio: 'Certified Grade-A licensed electrician specializing in solar PV rooftop arrays, LT panels, and commercial fit-outs with 7+ years of hands-on field experience.',
        jobsCompleted: 14,
        verificationStatus: 'verified',
        trustScore: 88,
        ratingsAverage: 4.9,
        ratingsCount: 11,
        badges: ['Master Craftsman', 'NSDC Level 4 Certified', 'Zero Dispute Record', 'Punctuality Champion'],
        bankAccountVerified: true,
        upiId: 'ramesh.electrician@okhdfcbank'
      }
    ];

    this.employers = [
      {
        id: 'employer-1',
        userId: 'usr-employer-1',
        companyName: 'Apex Infra & Solar Dynamics',
        contactPerson: 'Anita Sharma',
        phone: '9876543211',
        email: 'anita@apexinfra.com',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
        location: {
          city: 'Hyderabad',
          state: 'Telangana'
        },
        industry: 'Solar Energy & Commercial Construction',
        verified: true,
        jobsPosted: 8,
        hiredWorkersCount: 16,
        ratingsAverage: 4.8,
        ratingsCount: 12,
        trustDepositPaid: true
      }
    ];

    this.jobs = [
      {
        id: 'job-1',
        employerId: 'employer-1',
        employerName: 'Apex Infra & Solar Dynamics',
        employerLocation: 'Hyderabad, Telangana',
        employerRating: 4.8,
        title: 'Commercial Solar PV Rooftop Inverter Wiring & Grid Sync',
        description: 'Need certified master electrician to terminate DC strings, install 15kVA hybrid solar inverter, and run AC balance of system wiring with proper double-earthing.',
        requiredSkills: ['Electrical Wiring (Domestic & Commercial)', 'Solar Rooftop & Inverter Setup'],
        location: {
          city: 'Hyderabad',
          state: 'Telangana',
          area: 'Financial District, Gachibowli'
        },
        wage: 1200,
        wageType: 'daily',
        duration: '14 Days',
        startDate: today,
        workType: 'contract',
        numberOfWorkers: 2,
        applicantsCount: 3,
        status: 'open',
        applicationDeadline: today,
        createdAt: now
      },
      {
        id: 'job-2',
        employerId: 'employer-1',
        employerName: 'Apex Infra & Solar Dynamics',
        employerLocation: 'Hyderabad, Telangana',
        employerRating: 4.8,
        title: '3-Phase Main Distribution Board (MDB) Retrofit',
        description: 'Replacement of older rewirable fuse panels with modern 4-pole MCBs, isolators, and 30mA RCD protection for commercial warehouse.',
        requiredSkills: ['Electrical Wiring (Domestic & Commercial)', '3-Phase Industrial Panel Troubleshooting'],
        location: {
          city: 'Hyderabad',
          state: 'Telangana',
          area: 'Jeedimetla Industrial Area'
        },
        wage: 1100,
        wageType: 'daily',
        duration: '7 Days',
        startDate: today,
        workType: 'contract',
        numberOfWorkers: 1,
        applicantsCount: 1,
        status: 'open',
        applicationDeadline: today,
        createdAt: now
      },
      {
        id: 'job-3',
        employerId: 'employer-1',
        employerName: 'Apex Infra & Solar Dynamics',
        employerLocation: 'Bengaluru, Karnataka',
        employerRating: 4.8,
        title: 'Modular Kitchen Waterproof Marine Plywood Cabinetry',
        description: 'Precision fabrication and installation of soft-close Blum hinges, tandem drawers, and BWR 710 marine ply carcass for high-end apartment.',
        requiredSkills: ['Carpentry & Joinery', 'Modular Woodworking'],
        location: {
          city: 'Bengaluru',
          state: 'Karnataka',
          area: 'Whitefield'
        },
        wage: 1050,
        wageType: 'daily',
        duration: '10 Days',
        startDate: today,
        workType: 'contract',
        numberOfWorkers: 2,
        applicantsCount: 2,
        status: 'open',
        applicationDeadline: today,
        createdAt: now
      }
    ];

    this.applications = [
      {
        id: 'app-1',
        jobId: 'job-1',
        workerId: 'worker-1',
        workerName: 'Ramesh Kumar',
        workerAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200',
        workerLocation: 'Hyderabad, Telangana',
        workerSkills: ['Electrical Wiring (Domestic & Commercial)', 'Solar Rooftop & Inverter Setup'],
        workerTrustScore: 88,
        workerRating: 4.9,
        proposedWage: 1200,
        coverNote: 'I have successfully commissioned over 18 solar rooftops across Hyderabad and carry full insulated tools and clamp meters.',
        status: 'accepted',
        matchScore: 94,
        matchDetails: {
          totalScore: 94,
          breakdown: {
            skillMatch: 40,
            experienceMatch: 19,
            locationMatch: 15,
            availabilityMatch: 15,
            wageMatch: 5
          },
          matchedSkills: ['Electrical Wiring (Domestic & Commercial)', 'Solar Rooftop & Inverter Setup'],
          missingSkills: [],
          locationCompatibility: 'Exact City Match (Hyderabad)',
          availabilityCompatibility: 'Immediately Available',
          experienceCompatibility: '7 Years (exceeds required 3 years)',
          explanation: 'Exceptional 94% compatibility match across vocational certifications, local area availability, and verified trade rating.'
        },
        appliedAt: now,
        updatedAt: now
      }
    ];

    this.evidence = [
      {
        id: 'evi-1',
        workerId: 'worker-1',
        skillName: 'Electrical Wiring (Domestic & Commercial)',
        title: '3-Phase Busbar Chamber & DB Panel Dressing',
        type: 'photo',
        fileUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
        description: 'Clean cable trunking, phase ferruling (R-Y-B-N), and neutral link isolation according to Indian Electricity Rules 1956.',
        issuer: 'Apex Commercial Tower Site',
        status: 'verified',
        submittedAt: now,
        verifierNotes: 'Inspected ferrule numbering, crimping tightness, and insulation resistance. Flawless workmanship.',
        verifiedBy: 'Vikram Seth (NSDC Assessor)',
        verifiedAt: today
      },
      {
        id: 'evi-2',
        workerId: 'worker-1',
        skillName: 'Solar Rooftop & Inverter Setup',
        title: 'National Skill Qualification Framework (NSQF Level 4) Solar Technician Certificate',
        type: 'certificate',
        fileUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&q=80&w=600',
        description: 'Accredited training in PV module strings, SPD surge arrestors, and earth resistance testing (<2 ohms).',
        issuer: 'National Skill Development Corporation (NSDC)',
        status: 'verified',
        submittedAt: now,
        verifierNotes: 'Verified certificate QR code with NSDC Skill India registry.',
        verifiedBy: 'Vikram Seth (NSDC Assessor)',
        verifiedAt: today
      }
    ];

    this.verificationRequests = [
      {
        id: 'vr-1',
        workerId: 'worker-1',
        workerName: 'Ramesh Kumar',
        skillName: 'Electrical Wiring (Domestic & Commercial)',
        evidenceIds: ['evi-1', 'evi-2'],
        status: 'approved',
        aiConfidence: 94,
        aiSummary: 'Uploaded artifacts demonstrate high-level technical accuracy, correct color coding of 3-phase wiring, and valid NSDC accreditation.',
        verifierNotes: 'Approved after telephone verification and photographic cross-check.',
        submittedAt: now,
        reviewedAt: now,
        reviewedBy: 'Vikram Seth'
      }
    ];

    this.agreements = [
      {
        id: 'agr-1',
        agreementNumber: 'NAVA-AGR-2026-8821',
        jobId: 'job-1',
        jobTitle: 'Commercial Solar PV Rooftop Inverter Wiring & Grid Sync',
        employerId: 'employer-1',
        employerName: 'Apex Infra & Solar Dynamics',
        workerId: 'worker-1',
        workerName: 'Ramesh Kumar',
        scopeOfWork: 'Complete DC cabling from PV combiner box to 15kVA solar inverter, AC connection to main LT panel with surge protection, and earthing pit testing.',
        wage: 1200,
        wageType: 'daily',
        duration: '14 Days',
        startDate: today,
        endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        paymentTerms: 'Total contract value ₹16,800 deposited into NavAstitva Escrow. Milestone 1 (50% ₹8,400) on cable conduits & inverter mounting. Milestone 2 (50% ₹8,400) on grid sync & testing.',
        completionConditions: 'Work must pass earth resistance measurement (<2 ohms) and zero DC fault alerts on inverter startup.',
        cancellationTerms: '72-hour notice required. Undisputed milestone balances paid directly to worker.',
        status: 'active',
        workerAcceptedAt: now,
        employerAcceptedAt: now,
        createdAt: now
      }
    ];

    this.payments = [
      {
        id: 'pay-1',
        agreementId: 'agr-1',
        jobTitle: 'Commercial Solar PV Rooftop Inverter Wiring & Grid Sync',
        employerId: 'employer-1',
        workerId: 'worker-1',
        amount: 16800,
        currency: 'INR',
        status: 'demo_held',
        escrowReference: 'ESCROW-NAVA-994182',
        demoLabel: true,
        committedAt: now,
        paymentMethod: 'UPI / Escrow Trust Vault',
        notes: 'Pre-funded by employer into NavAstitva Escrow Vault before on-site work commenced.'
      }
    ];

    this.progressUpdates = [
      {
        id: 'prog-1',
        agreementId: 'agr-1',
        workerId: 'worker-1',
        jobTitle: 'Commercial Solar PV Rooftop Inverter Wiring & Grid Sync',
        updates: [
          {
            id: 'up-1',
            timestamp: now,
            note: 'DC cable stringing, PV isolator mounting, and conduit piping completed for Milestone 1.',
            percentage: 50,
            photoUrls: ['https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&q=80&w=600'],
            submittedBy: 'worker'
          }
        ],
        currentPercentage: 50,
        completionSubmitted: false,
        completionEvidenceUrls: [],
        completionStatus: 'in_progress'
      }
    ];

    this.reviews = [
      {
        id: 'rev-1',
        agreementId: 'agr-demo-prev',
        fromUserId: 'usr-employer-1',
        fromUserName: 'Anita Sharma (Apex Infra)',
        fromRole: 'employer',
        toUserId: 'usr-worker-1',
        toUserName: 'Ramesh Kumar',
        toRole: 'worker',
        jobTitle: '3-Phase Substation Cable Laying',
        rating: 5,
        qualityOfWork: 5,
        communication: 5,
        punctuality: 5,
        comment: 'Ramesh is an exceptional electrician. Clean terminations, prompt on-site attendance, and strict safety compliance.',
        createdAt: now
      },
      {
        id: 'rev-2',
        agreementId: 'agr-demo-prev',
        fromUserId: 'usr-worker-1',
        fromUserName: 'Ramesh Kumar',
        fromRole: 'worker',
        toUserId: 'usr-employer-1',
        toUserName: 'Anita Sharma (Apex Infra)',
        toRole: 'employer',
        jobTitle: '3-Phase Substation Cable Laying',
        rating: 5,
        qualityOfWork: 5,
        communication: 5,
        punctuality: 5,
        comment: 'Great employer. Materials arrived on time and escrow payment was released immediately upon inspection.',
        createdAt: now
      }
    ];

    this.disputes = [];

    this.auditLogs = [
      {
        id: 'aud-seed-1',
        timestamp: now,
        action: 'SYSTEM_DEMO_DATA_INITIALIZED',
        actorUserId: 'sys',
        actorName: 'NavAstitva System',
        actorRole: 'admin',
        targetEntity: 'System',
        targetId: 'sys-seed',
        details: 'Loaded certified worker, verified employer, 3 trade job posts, and active escrow agreement.'
      }
    ];
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
