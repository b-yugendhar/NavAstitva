import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './src/server/db.ts';
import { isMongoConnected } from './src/server/mongodb.ts';
import { 
  analyzeEvidenceWithGemini, 
  analyzeDisputeWithGemini, 
  askSmartAssistant,
  analyzeSkillProfileWithGemini
} from './src/server/gemini.ts';
import { MatchScoreDetails, User } from './src/types.ts';

dotenv.config();

const PORT = 3000;

function resolveUser(req: express.Request): User | null {
  const authHeader = req.headers['authorization'];
  const xUserId = req.headers['x-user-id'] as string;
  let targetId = xUserId;
  if (!targetId && authHeader && authHeader.startsWith('Bearer ')) {
    targetId = authHeader.substring(7).trim();
  }
  if (targetId) {
    const user = db.users.find(u => u.id === targetId);
    if (user) return user;
  }
  return null;
}

async function startServer() {
  // Initialize MongoDB connection and hydrate existing collections if available
  await db.initPersistence();

  const app = express();
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'NavAstitva Engine', timestamp: new Date().toISOString() });
  });

  // Platform stats
  app.get('/api/stats', (req, res) => {
    res.json(db.getStats());
  });

  // Current individual user session
  app.get('/api/auth/current', (req, res) => {
    const user = resolveUser(req);
    if (!user) {
      return res.json({
        user: null,
        workerProfile: null,
        employerProfile: null
      });
    }
    const workerProfile = db.workers.find(w => w.userId === user.id) || null;
    const employerProfile = db.employers.find(e => e.userId === user.id) || null;
    res.json({
      user,
      workerProfile,
      employerProfile
    });
  });

  // Real Individual Login
  app.post('/api/auth/login', (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please provide mobile number or email and password.' });
    }

    const cleanIdent = String(identifier).trim().toLowerCase();
    const cleanDigits = String(identifier).replace(/[^0-9]/g, '');

    const user = db.users.find(u => {
      const emailMatch = u.email && u.email.toLowerCase() === cleanIdent;
      const phoneDigits = u.phone ? u.phone.replace(/[^0-9]/g, '') : '';
      const phoneMatch = cleanDigits.length >= 7 && (phoneDigits.includes(cleanDigits) || cleanDigits.includes(phoneDigits));
      return emailMatch || phoneMatch;
    });

    if (!user) {
      return res.status(401).json({ error: 'No account registered with this phone number or email address.' });
    }

    if (user.password && user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
    }

    const workerProfile = db.workers.find(w => w.userId === user.id) || null;
    const employerProfile = db.employers.find(e => e.userId === user.id) || null;

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'USER_LOGGED_IN',
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      targetEntity: 'UserSession',
      targetId: user.id,
      details: `User signed in as ${user.name} (${user.role})`
    });

    res.json({
      success: true,
      user,
      token: user.id,
      workerProfile,
      employerProfile
    });
  });

  // Real Individual Logout
  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  // Database State Management
  app.post('/api/db/reset-empty', (req, res) => {
    db.resetEmpty();
    res.json({ success: true, message: 'Database reset to clean empty state.' });
  });

  app.get('/api/db/status', (req, res) => {
    res.json({
      jobsCount: db.jobs.length,
      workersCount: db.workers.length,
      employersCount: db.employers.length,
      agreementsCount: db.agreements.length,
      evidenceCount: db.evidence.length,
      reviewsCount: db.reviews.length,
      disputesCount: db.disputes.length,
      paymentsCount: db.payments.length,
      isEmpty: db.jobs.length === 0 && db.workers.length === 0,
      mongoConnected: isMongoConnected(),
      databaseEngine: isMongoConnected() ? 'MongoDB (Persistent)' : 'Clean In-Memory (MongoDB Driver Initialized)'
    });
  });

  // Real Individual User Registration
  app.post('/api/auth/register', (req, res) => {
    const { 
      name, 
      email, 
      phone, 
      password, 
      role, 
      preferredLanguage, 
      skills, 
      location, 
      wage, 
      bio, 
      companyName,
      avatarUrl,
      experienceYears
    } = req.body;

    if (!name || !role) {
      return res.status(400).json({ error: 'Name and account type are required.' });
    }

    if (email) {
      const existing = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
      }
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Please enter your full legal name.' });
    }
    if (!phone || !phone.trim() || phone.replace(/[^0-9]/g, '').length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 10) {
        const existing = db.users.find(u => u.phone.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-10)));
        if (existing) {
          return res.status(400).json({ error: 'An account with this mobile number already exists. Please sign in.' });
        }
      }
    }

    const userId = `usr-${Date.now()}`;
    const cleanEmail = email && email.trim() ? email.trim() : '';
    const cleanPhone = phone.trim();

    const newUser: User = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: password,
      role: role || 'worker',
      avatarUrl: avatarUrl || (role === 'employer'
        ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
        : role === 'admin'
        ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
        : 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200'),
      preferredLanguage: preferredLanguage || 'hi',
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);

    let workerProfile = null;
    let employerProfile = null;

    if (role === 'employer') {
      const empId = `emp-${Date.now()}`;
      employerProfile = {
        id: empId,
        userId: newUser.id,
        companyName: (companyName && companyName.trim()) || name.trim(),
        contactPerson: name.trim(),
        phone: newUser.phone,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl!,
        location: { city: (location && location.trim()) || '', state: 'Telangana' },
        industry: 'Construction & Facilities',
        verified: true,
        jobsPosted: 0,
        hiredWorkersCount: 0,
        ratingsAverage: 5.0,
        ratingsCount: 0
      };
      db.employers.push(employerProfile);
    } else if (role === 'worker') {
      const wpId = `wp-${Date.now()}`;
      const skillList = Array.isArray(skills) && skills.length > 0 
        ? skills 
        : (skills ? [skills] : ['General Skilled Trade']);
      workerProfile = {
        id: wpId,
        userId: newUser.id,
        fullName: name.trim(),
        phone: newUser.phone,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl!,
        location: {
          city: (location && location.trim()) || '',
          district: (location && location.trim()) || '',
          state: 'Telangana',
          pincode: ''
        },
        preferredLanguage: preferredLanguage || 'hi',
        skills: skillList.map(s => ({
          name: s,
          category: 'Vocational Skilled',
          yearsOfExperience: Number(experienceYears) || 2,
          proficiency: 'intermediate' as const,
          isVerified: false
        })),
        experienceYears: Number(experienceYears) || 2,
        availability: 'available' as const,
        preferredDailyWage: Number(wage) || 0,
        workType: 'both' as const,
        bio: bio && bio.trim() ? bio.trim() : '',
        jobsCompleted: 0,
        verificationStatus: 'unverified' as const,
        trustScore: 50,
        ratingsAverage: 0,
        ratingsCount: 0,
        badges: ['New Talent'],
        bankAccountVerified: false,
        upiId: ''
      };
      db.workers.push(workerProfile);
    }

    db.save('users', newUser);
    if (employerProfile) db.save('employers', employerProfile);
    if (workerProfile) db.save('workers', workerProfile);

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'USER_REGISTERED',
      actorUserId: newUser.id,
      actorName: newUser.name,
      actorRole: newUser.role,
      targetEntity: 'User',
      targetId: newUser.id,
      details: `Created individual account for ${newUser.name} (${newUser.role})`
    });

    res.json({
      success: true,
      user: newUser,
      token: newUser.id,
      workerProfile,
      employerProfile
    });
  });

  // CSC Assisted Onboarding
  app.post('/api/csc/assisted-register', (req, res) => {
    const { cscOperatorId, workerName, mobileNumber, primarySkill, district, state, preferredLanguage } = req.body;
    const userId = `usr-csc-worker-${Date.now()}`;
    const newUser = {
      id: userId,
      name: workerName,
      email: `${workerName.toLowerCase().replace(/\s+/g, '')}.csc@navastitva.in`,
      phone: mobileNumber,
      role: 'worker' as const,
      avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200',
      preferredLanguage: preferredLanguage || 'hi',
      createdAt: new Date().toISOString(),
      cscOperatorId: cscOperatorId || 'usr-csc-1'
    };
    db.users.push(newUser);

    const wpId = `wp-${Date.now()}`;
    db.workers.push({
      id: wpId,
      userId: newUser.id,
      fullName: workerName,
      phone: mobileNumber,
      email: newUser.email,
      avatarUrl: newUser.avatarUrl,
      location: {
        city: district,
        district,
        state,
        pincode: '221001'
      },
      preferredLanguage: preferredLanguage || 'hi',
      skills: [
        {
          name: primarySkill,
          category: 'Rural Vocational',
          yearsOfExperience: 2,
          proficiency: 'intermediate',
          isVerified: false
        }
      ],
      experienceYears: 2,
      availability: 'available',
      preferredDailyWage: 750,
      workType: 'daily_wage',
      bio: `Assisted registration completed at CSC Kendra #${cscOperatorId}. SMS alerts enabled for feature phone.`,
      jobsCompleted: 0,
      verificationStatus: 'pending',
      trustScore: 60,
      ratingsAverage: 0,
      ratingsCount: 0,
      badges: ['CSC Assisted Onboarding'],
      bankAccountVerified: true,
      upiId: `${mobileNumber}@postbank`
    });

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'CSC_ASSISTED_WORKER_REGISTERED',
      actorUserId: cscOperatorId || 'usr-csc-1',
      actorName: 'Manoj Patel (CSC VLE)',
      actorRole: 'csc_operator',
      targetEntity: 'WorkerProfile',
      targetId: wpId,
      details: `Assisted registration of ${workerName} (${primarySkill}) at CSC Village Center.`
    });

    res.json({ success: true, workerId: wpId, user: newUser });
  });

  // Workers
  app.get('/api/workers', (req, res) => {
    res.json(db.workers);
  });

  app.get('/api/workers/:id', (req, res) => {
    const worker = db.workers.find(w => w.id === req.params.id || w.userId === req.params.id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    const evidence = db.evidence.filter(e => e.workerId === worker.id);
    const trustScore = db.calculateTrustScore(worker.id);
    res.json({ worker, evidence, trustScore });
  });

  app.put('/api/workers/:id', (req, res) => {
    const index = db.workers.findIndex(w => w.id === req.params.id || w.userId === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Worker not found' });
    db.workers[index] = { ...db.workers[index], ...req.body };
    res.json(db.workers[index]);
  });

  // Employers
  app.get('/api/employers', (req, res) => {
    res.json(db.employers);
  });

  // Jobs
  app.get('/api/jobs', (req, res) => {
    const { skill, city, workType, maxWage } = req.query;
    let results = [...db.jobs];
    if (skill) {
      const q = String(skill).toLowerCase();
      results = results.filter(j => j.requiredSkills.some(s => s.toLowerCase().includes(q)) || j.title.toLowerCase().includes(q));
    }
    if (city) {
      results = results.filter(j => j.location.city.toLowerCase() === String(city).toLowerCase());
    }
    if (workType) {
      results = results.filter(j => j.workType === workType);
    }
    if (maxWage) {
      results = results.filter(j => j.wage <= Number(maxWage));
    }
    res.json(results);
  });

  app.get('/api/jobs/:id', (req, res) => {
    const job = db.jobs.find(j => j.id === req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const employer = db.employers.find(e => e.id === job.employerId);
    res.json({ job, employer });
  });

  app.post('/api/jobs', (req, res) => {
    const { title, description, requiredSkills, location, wage, wageType, duration, startDate, workType, numberOfWorkers } = req.body;
    const user = resolveUser(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Please sign in with your Employer account to post a job opportunity.' });
    }

    if (user.role !== 'employer' && user.role !== 'admin') {
      return res.status(403).json({ 
        error: `Access restricted: Only registered Employer accounts are authorized to post jobs. Your current account role is "${user.role}".` 
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Please enter a descriptive job title.' });
    }
    if (!wage || Number(wage) <= 0) {
      return res.status(400).json({ error: 'Please specify a valid wage amount (greater than ₹0).' });
    }
    const parsedSkills = Array.isArray(requiredSkills) 
      ? requiredSkills.filter(s => typeof s === 'string' && s.trim().length > 0)
      : (typeof requiredSkills === 'string' && requiredSkills.trim().length > 0 ? [requiredSkills.trim()] : []);
    
    if (parsedSkills.length === 0) {
      return res.status(400).json({ error: 'Please specify at least one required vocational skill.' });
    }
    if (!location || !location.city || !location.city.trim()) {
      return res.status(400).json({ error: 'Please provide the city where the work will take place.' });
    }

    let currentEmp = db.employers.find(e => e.userId === user.id);
    if (!currentEmp) {
      currentEmp = {
        id: `emp-${user.id}`,
        userId: user.id,
        companyName: user.name,
        contactPerson: user.name,
        phone: user.phone || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        location: { city: location.city.trim(), state: location.state?.trim() || 'Telangana' },
        industry: 'Vocational Works & Infrastructure',
        verified: true,
        hiredWorkersCount: 0,
        ratingsAverage: 5.0,
        ratingsCount: 0,
        jobsPosted: 0,
        trustDepositPaid: true
      };
      db.employers.push(currentEmp);
      db.save('employers', currentEmp);
    }
    
    const newJob = {
      id: `job-${Date.now()}`,
      employerId: currentEmp.id,
      employerName: currentEmp.companyName,
      employerLocation: `${location.area ? location.area.trim() + ', ' : ''}${location.city.trim()}`,
      employerRating: currentEmp.ratingsAverage,
      title: title.trim(),
      description: description ? description.trim() : `Job posting for ${title.trim()} in ${location.city.trim()}.`,
      requiredSkills: parsedSkills,
      location: {
        city: location.city.trim(),
        state: location.state ? location.state.trim() : 'Telangana',
        area: location.area ? location.area.trim() : ''
      },
      wage: Number(wage),
      wageType: wageType || 'daily',
      duration: duration && duration.trim() ? duration.trim() : 'Full Duration',
      startDate: startDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      workType: workType || 'contract',
      numberOfWorkers: Number(numberOfWorkers) > 0 ? Number(numberOfWorkers) : 1,
      applicantsCount: 0,
      status: 'open' as const,
      applicationDeadline: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    db.jobs.unshift(newJob);
    currentEmp.jobsPosted += 1;
    db.save('jobs', newJob);
    db.save('employers', currentEmp);

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'JOB_POSTED',
      actorUserId: currentEmp.userId,
      actorName: currentEmp.contactPerson,
      actorRole: 'employer',
      targetEntity: 'Job',
      targetId: newJob.id,
      details: `Posted new job: ${newJob.title} with wage ₹${newJob.wage}/${newJob.wageType}`
    });

    res.json(newJob);
  });

  // Stage 5 & 10: AI Job Matching calculation
  // Formula: matchScore = skillMatch * 0.40 + experienceMatch * 0.20 + locationMatch * 0.15 + availabilityMatch * 0.15 + wageMatch * 0.10
  function calculateJobMatch(worker: any, job: any): MatchScoreDetails {
    const workerSkillNames = worker.skills.map((s: any) => s.name.toLowerCase());
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const reqSkill of job.requiredSkills) {
      const match = workerSkillNames.some((ws: string) => 
        ws.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(ws)
      );
      if (match) {
        matchedSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    }

    // 1. Skill Match (40% weight)
    const skillRatio = job.requiredSkills.length > 0 ? (matchedSkills.length / job.requiredSkills.length) : 1;
    const skillScore = Math.round(skillRatio * 100);

    // 2. Experience Match (20% weight)
    const expScore = Math.min(100, Math.round((worker.experienceYears / 4) * 100));

    // 3. Location Match (15% weight)
    let locScore = 50;
    let locComp = 'Different Region';
    if (worker.location.city.toLowerCase() === job.location.city.toLowerCase()) {
      locScore = 100;
      locComp = `Same City (${job.location.city})`;
    } else if (worker.location.state.toLowerCase() === job.location.state.toLowerCase()) {
      locScore = 80;
      locComp = `Same State (${job.location.state})`;
    }

    // 4. Availability Match (15% weight)
    let availScore = 70;
    let availComp = 'Part-Time Available';
    if (worker.availability === 'available') {
      availScore = 100;
      availComp = 'Ready for immediate full-time deployment';
    }

    // 5. Wage Match (10% weight)
    let wageScore = 100;
    if (worker.preferredDailyWage > job.wage) {
      const diffRatio = (worker.preferredDailyWage - job.wage) / job.wage;
      wageScore = Math.max(40, Math.round(100 - diffRatio * 100));
    }

    const totalScore = Math.round(
      (skillScore * 0.40) +
      (expScore * 0.20) +
      (locScore * 0.15) +
      (availScore * 0.15) +
      (wageScore * 0.10)
    );

    const explanation = `Calculated AI Match Score: ${totalScore}%. Matched ${matchedSkills.length}/${job.requiredSkills.length} core skills. Location proximity: ${locComp}. ${availComp}.`;

    return {
      totalScore,
      breakdown: {
        skillMatch: Math.round(skillScore * 0.40),
        experienceMatch: Math.round(expScore * 0.20),
        locationMatch: Math.round(locScore * 0.15),
        availabilityMatch: Math.round(availScore * 0.15),
        wageMatch: Math.round(wageScore * 0.10)
      },
      matchedSkills,
      missingSkills,
      locationCompatibility: locComp,
      availabilityCompatibility: availComp,
      experienceCompatibility: `${worker.experienceYears} Years experience`,
      explanation
    };
  }

  // Get matching explanation for worker & job
  app.get('/api/jobs/:id/match', (req, res) => {
    const job = db.jobs.find(j => j.id === req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const user = resolveUser(req);
    const worker = user ? db.getWorkerByUserId(user.id) : null;
    
    if (!worker) {
      return res.json({
        totalScore: 75,
        breakdown: { skillMatch: 20, experienceMatch: 20, wageCompatibility: 15, trustScoreWeight: 20 },
        matchedSkills: job.requiredSkills.slice(0, 1),
        missingSkills: job.requiredSkills.slice(1),
        locationCompatibility: 'Estimated City Area',
        availabilityCompatibility: 'Open for applications',
        experienceCompatibility: 'Vocational compatibility standard',
        explanation: 'Create or sign in to your worker profile to see your personalized AI skill alignment score.'
      });
    }

    const match = calculateJobMatch(worker, job);
    res.json(match);
  });

  // Get ranked matching candidates for an employer's job
  app.get('/api/matching/candidates/:jobId', (req, res) => {
    const job = db.jobs.find(j => j.id === req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const ranked = db.workers.map(w => {
      const match = calculateJobMatch(w, job);
      return {
        worker: w,
        matchDetails: match
      };
    }).sort((a, b) => b.matchDetails.totalScore - a.matchDetails.totalScore);

    res.json(ranked);
  });

  // AI Skill Scoring & Accreditation from Profile Images, ID Docs, Certificates, and Work Photos
  app.post('/api/ai/skill-score', async (req, res) => {
    try {
      const { 
        workerName, 
        tradeSkill, 
        experienceYears, 
        dailyWage, 
        city, 
        profilePhoto, 
        identityDoc, 
        tradeCertificate, 
        workPhotos 
      } = req.body;

      const user = resolveUser(req);
      const worker = user ? db.getWorkerByUserId(user.id) : null;

      const result = await analyzeSkillProfileWithGemini({
        workerName: workerName || (worker ? worker.fullName : user?.name || 'Artisan'),
        tradeSkill: tradeSkill || 'Skilled Craft',
        experienceYears: Number(experienceYears) || 3,
        dailyWage: dailyWage ? Number(dailyWage) : undefined,
        city: city || (worker ? worker.location.city : ''),
        hasProfilePhoto: !!profilePhoto,
        identityDocTitle: identityDoc?.title,
        identityDocType: identityDoc?.documentType,
        certificateTitle: tradeCertificate?.title,
        certificateIssuer: tradeCertificate?.issuer,
        workPhotosCount: Array.isArray(workPhotos) ? workPhotos.length : 0,
        workPhotosCaptions: Array.isArray(workPhotos) ? workPhotos.map((p: any) => p.caption || '') : []
      });

      // If signed in as worker, update worker profile and trust score in real time
      if (worker) {
        if (tradeSkill) {
          const existingSkill = worker.skills.find(s => s.name.toLowerCase() === tradeSkill.toLowerCase());
          if (existingSkill) {
            existingSkill.isVerified = true;
            existingSkill.proficiency = result.overallScore >= 85 ? 'expert' : 'intermediate';
          } else {
            worker.skills.push({
              name: tradeSkill,
              category: 'Vocational Technical',
              yearsOfExperience: Number(experienceYears) || 3,
              proficiency: result.overallScore >= 85 ? 'expert' : 'intermediate',
              isVerified: true
            });
          }
        }

        if (profilePhoto && profilePhoto.startsWith('data:image')) {
          worker.avatarUrl = profilePhoto;
          if (user) user.avatarUrl = profilePhoto;
        }

        if (dailyWage && Number(dailyWage) > 0) {
          worker.preferredDailyWage = Number(dailyWage);
        }

        if (city && city.trim()) {
          worker.location.city = city.trim();
          worker.location.district = city.trim();
        }

        if (result.tier && !worker.badges.includes(result.tier)) {
          worker.badges.push(result.tier);
        }

        // Save work photos into worker evidence collection if provided
        if (Array.isArray(workPhotos) && workPhotos.length > 0) {
          for (let i = 0; i < workPhotos.length; i++) {
            const photo = workPhotos[i];
            const evId = `ev-${Date.now()}-${i}`;
            const newEv = {
              id: evId,
              workerId: worker.id,
              skillName: tradeSkill || 'Vocational Craft',
              title: photo.caption || `Work Sample #${i + 1}`,
              type: 'photo' as const,
              fileUrl: photo.fileUrl || photo.previewUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
              description: photo.caption || `Photographic work documentation for ${tradeSkill}`,
              issueDate: new Date().toISOString().split('T')[0],
              issuer: 'Verified Field Artifact',
              status: 'verified' as const,
              submittedAt: new Date().toISOString(),
              aiAssessment: {
                detectedCategory: tradeSkill || 'Vocational Execution',
                evidenceRelevance: 'high' as const,
                confidenceScore: Math.round(result.breakdown.photoAssessmentScore * 4),
                suggestedQuestions: ['Can you demonstrate the standard operating safety checklist for this task?'],
                recommendedAssessmentLevel: (result.tier === 'Master Craftsman' ? 'Master Craftsman' : 'Intermediate') as any,
                explanation: `Verified practical execution of ${tradeSkill}.`
              }
            };
            db.evidence.unshift(newEv);
            db.save('evidence', newEv);
          }
        }

        // Also save trade certificate if provided
        if (tradeCertificate && tradeCertificate.title) {
          const certEv = {
            id: `ev-cert-${Date.now()}`,
            workerId: worker.id,
            skillName: tradeSkill || 'Vocational Certification',
            title: tradeCertificate.title,
            type: 'certificate' as const,
            fileUrl: tradeCertificate.fileUrl || 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&q=80&w=600',
            description: `Accreditation by ${tradeCertificate.issuer || 'Recognized Board'}`,
            issueDate: tradeCertificate.issueYear ? `${tradeCertificate.issueYear}-01-01` : new Date().toISOString().split('T')[0],
            issuer: tradeCertificate.issuer || 'Vocational Training Council',
            status: 'verified' as const,
            submittedAt: new Date().toISOString(),
            aiAssessment: {
              detectedCategory: tradeSkill || 'Vocational Certification',
              evidenceRelevance: 'high' as const,
              confidenceScore: Math.round(result.breakdown.certificateAuthenticityScore * 4),
              suggestedQuestions: ['Which certifying institute or NSDC affiliate issued this certification?'],
              recommendedAssessmentLevel: 'Master Craftsman' as const,
              explanation: `Certified trade documentation verified by AI model.`
            }
          };
          db.evidence.unshift(certEv);
          db.save('evidence', certEv);
        }

        worker.verificationStatus = 'verified';
        // Recalculate trust score
        const ts = db.calculateTrustScore(worker.id);
        worker.trustScore = Math.max(ts.score, result.overallScore);

        db.save('workers', worker);
        if (user) db.save('users', user);
      }

      res.json({ success: true, analysis: result });
    } catch (err: any) {
      console.error('Skill score error:', err);
      res.status(500).json({ error: 'AI Skill Score processing failed' });
    }
  });

  // Stage 2 & 3: Evidence Submission & AI Assessment
  app.get('/api/evidence', (req, res) => {
    const { workerId } = req.query;
    if (workerId) {
      return res.json(db.evidence.filter(e => e.workerId === workerId));
    }
    res.json(db.evidence);
  });

  app.post('/api/evidence', async (req, res) => {
    const { workerId, skillName, title, type, fileUrl, description, issuer, issueDate } = req.body;
    const user = resolveUser(req);

    if (user && user.role !== 'worker' && user.role !== 'csc_operator' && user.role !== 'admin') {
      return res.status(403).json({ 
        error: `Access restricted: Only registered Workers or CSC Operators can upload evidence. Your current role is "${user.role}".` 
      });
    }

    if (!skillName || !skillName.trim()) {
      return res.status(400).json({ error: 'Please specify the vocational trade skill.' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Please enter a title for this evidence item.' });
    }

    let currentWorker = (user ? db.getWorkerByUserId(user.id) : null) || (workerId ? db.workers.find(w => w.id === workerId) : null);

    if (!currentWorker) {
      if (user) {
        currentWorker = {
          id: `wp-${user.id}`,
          userId: user.id,
          fullName: user.name,
          phone: user.phone || '',
          email: user.email || '',
          avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200',
          location: { city: '', district: '', state: 'Telangana', pincode: '' },
          preferredLanguage: user.preferredLanguage || 'hi',
          skills: [{ name: skillName.trim(), category: 'Skilled Work', yearsOfExperience: 2, proficiency: 'intermediate', isVerified: false }],
          experienceYears: 2,
          availability: 'available',
          preferredDailyWage: 0,
          workType: 'both',
          bio: '',
          jobsCompleted: 0,
          verificationStatus: 'unverified',
          trustScore: 50,
          ratingsAverage: 0,
          ratingsCount: 0,
          badges: ['New Talent'],
          bankAccountVerified: false,
          upiId: ''
        };
        db.workers.push(currentWorker);
        db.save('workers', currentWorker);
      } else {
        return res.status(401).json({ error: 'Please sign in with your worker account to submit verification evidence.' });
      }
    }

    // Call AI analysis
    const aiAssessment = await analyzeEvidenceWithGemini({
      skillName,
      title,
      description,
      type,
      issuer
    });

    const newEvidence = {
      id: `ev-${Date.now()}`,
      workerId: currentWorker.id,
      skillName,
      title,
      type: type || 'photo',
      fileUrl: fileUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
      description,
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      issuer: issuer || 'Self-verified field work',
      status: 'analyzed' as const,
      submittedAt: new Date().toISOString(),
      aiAssessment
    };

    db.evidence.unshift(newEvidence);
    db.save('evidence', newEvidence);

    // Create a verification request for Human Verifier review
    const newVR = {
      id: `vr-${Date.now()}`,
      workerId: currentWorker.id,
      workerName: currentWorker.fullName,
      skillName,
      evidenceIds: [newEvidence.id],
      status: 'under_human_review' as const,
      aiConfidence: aiAssessment.confidenceScore,
      aiSummary: aiAssessment.explanation,
      submittedAt: new Date().toISOString()
    };
    db.verificationRequests.unshift(newVR);
    db.save('verificationRequests', newVR);

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'EVIDENCE_SUBMITTED_AND_AI_ANALYZED',
      actorUserId: currentWorker.userId,
      actorName: currentWorker.fullName,
      actorRole: 'worker',
      targetEntity: 'EvidenceItem',
      targetId: newEvidence.id,
      details: `Evidence "${newEvidence.title}" submitted for ${skillName}. AI Confidence: ${aiAssessment.confidenceScore}%`
    });

    res.json({ evidence: newEvidence, verificationRequest: newVR });
  });

  // Stage 3: Verification Portal (Admin / Verifier)
  app.get('/api/verification/requests', (req, res) => {
    res.json(db.verificationRequests);
  });

  app.post('/api/verification/decide', (req, res) => {
    const { requestId, decision, verifierNotes } = req.body;
    const user = resolveUser(req);

    if (user && user.role !== 'admin') {
      return res.status(403).json({ 
        error: `Access restricted: Only accredited Skill Assessors (Admin role) can make verification decisions. Your current role is "${user.role}".` 
      });
    }

    const vr = db.verificationRequests.find(v => v.id === requestId);
    if (!vr) return res.status(404).json({ error: 'Verification request not found' });

    vr.status = decision; // 'approved' | 'rejected' | 'needs_more_evidence'
    vr.verifierNotes = verifierNotes;
    vr.reviewedAt = new Date().toISOString();
    vr.reviewedBy = user ? `${user.name} (Assessor)` : 'Dr. Anita Sen (NSDC Assessor)';

    // If approved, mark evidence as verified and worker skill as verified!
    if (decision === 'approved') {
      for (const evId of vr.evidenceIds) {
        const ev = db.evidence.find(e => e.id === evId);
        if (ev) {
          ev.status = 'verified';
          ev.verifierNotes = verifierNotes;
          ev.verifiedBy = vr.reviewedBy;
          ev.verifiedAt = vr.reviewedAt;
        }
      }

      const worker = db.workers.find(w => w.id === vr.workerId);
      if (worker) {
        const skill = worker.skills.find(s => s.name.toLowerCase() === vr.skillName.toLowerCase());
        if (skill) {
          skill.isVerified = true;
          skill.verifiedAt = new Date().toISOString().split('T')[0];
        }
        worker.verificationStatus = 'verified';
        // Recalculate trust score!
        const ts = db.calculateTrustScore(worker.id);
        worker.trustScore = ts.score;
      }
    }

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `VERIFICATION_${decision.toUpperCase()}`,
      actorUserId: 'usr-admin-1',
      actorName: 'Dr. Anita Sen (NSDC Assessor)',
      actorRole: 'admin',
      targetEntity: 'VerificationRequest',
      targetId: vr.id,
      details: `Verification for ${vr.workerName} (${vr.skillName}) was ${decision}. Notes: ${verifierNotes || 'Approved'}`
    });

    res.json({ success: true, verificationRequest: vr });
  });

  // Stage 4: Trust Score calculation & breakdown
  app.get('/api/trust-score/:workerId', (req, res) => {
    const details = db.calculateTrustScore(req.params.workerId);
    res.json(details);
  });

  // Applications
  app.get('/api/applications', (req, res) => {
    const { jobId, workerId } = req.query;
    let apps = [...db.applications];
    if (jobId) apps = apps.filter(a => a.jobId === jobId);
    if (workerId) apps = apps.filter(a => a.workerId === workerId);
    res.json(apps);
  });

  app.post('/api/applications', (req, res) => {
    const { jobId, proposedWage, coverNote } = req.body;
    const user = resolveUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Please sign in with your Worker account to apply for this job.' });
    }

    if (user.role !== 'worker' && user.role !== 'csc_operator' && user.role !== 'admin') {
      return res.status(403).json({ 
        error: `Access restricted: Only registered Skilled Workers or CSC Operators can apply for jobs. Your current role is "${user.role}".` 
      });
    }

    const job = db.jobs.find(j => j.id === jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    let worker = db.getWorkerByUserId(user.id);
    if (!worker) {
      worker = {
        id: `wp-${user.id}`,
        userId: user.id,
        fullName: user.name,
        phone: user.phone || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200',
        location: { city: '', district: '', state: 'Telangana', pincode: '' },
        preferredLanguage: user.preferredLanguage || 'hi',
        skills: job.requiredSkills.slice(0, 2).map(s => ({
          name: s,
          category: 'Vocational',
          yearsOfExperience: 2,
          proficiency: 'intermediate' as const,
          isVerified: false
        })),
        experienceYears: 2,
        availability: 'available',
        preferredDailyWage: Number(proposedWage) || job.wage,
        workType: 'both',
        bio: '',
        jobsCompleted: 0,
        verificationStatus: 'unverified',
        trustScore: 50,
        ratingsAverage: 0,
        ratingsCount: 0,
        badges: ['New Talent'],
        bankAccountVerified: false,
        upiId: ''
      };
      db.workers.push(worker);
      db.save('workers', worker);
    }

    // Check duplicate
    const existing = db.applications.find(a => a.jobId === jobId && a.workerId === worker!.id);
    if (existing) {
      return res.status(400).json({ error: 'You have already applied for this job.' });
    }

    const matchDetails = calculateJobMatch(worker, job);

    const newApp = {
      id: `app-${Date.now()}`,
      jobId,
      workerId: worker.id,
      workerName: worker.fullName,
      workerAvatar: worker.avatarUrl,
      workerLocation: `${worker.location.city}, ${worker.location.state}`,
      workerSkills: worker.skills.map(s => s.name),
      workerTrustScore: worker.trustScore,
      workerRating: worker.ratingsAverage,
      proposedWage: Number(proposedWage) || worker.preferredDailyWage,
      coverNote: coverNote || 'I am ready to deliver quality craftsmanship in compliance with safety standards.',
      status: 'submitted' as const,
      matchScore: matchDetails.totalScore,
      matchDetails,
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.applications.unshift(newApp);
    job.applicantsCount += 1;
    db.save('applications', newApp);
    db.save('jobs', job);

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'JOB_APPLICATION_SUBMITTED',
      actorUserId: worker.userId,
      actorName: worker.fullName,
      actorRole: 'worker',
      targetEntity: 'Application',
      targetId: newApp.id,
      details: `Applied for ${job.title} with match score ${matchDetails.totalScore}%`
    });

    res.json(newApp);
  });

  // Stage 6 & 7: Digital Work Agreement creation & acceptance
  app.post('/api/agreements/create', (req, res) => {
    const { applicationId, jobId, workerId, wage, duration, startDate, endDate, scopeOfWork, paymentTerms } = req.body;
    const job = db.jobs.find(j => j.id === jobId);
    const worker = db.workers.find(w => w.id === workerId);
    const user = resolveUser(req);
    let employer = user ? db.employers.find(e => e.userId === user.id) : null;

    if (!job || !worker) return res.status(404).json({ error: 'Job or worker not found' });

    if (!employer) {
      if (user) {
        employer = {
          id: `emp-${user.id}`,
          userId: user.id,
          companyName: user.name,
          contactPerson: user.name,
          phone: user.phone || '',
          email: user.email || '',
          avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
          location: { city: 'Hyderabad', state: 'Telangana' },
          industry: 'Vocational Works',
          verified: true,
          hiredWorkersCount: 0,
          ratingsAverage: 5.0,
          ratingsCount: 0,
          jobsPosted: 1,
          trustDepositPaid: true
        };
        db.employers.push(employer);
        db.save('employers', employer);
      } else {
        return res.status(401).json({ error: 'Please sign in to generate agreements.' });
      }
    }

    const agreementNumber = `NAVA-AGR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAgreement = {
      id: `agr-${Date.now()}`,
      agreementNumber,
      jobId: job.id,
      jobTitle: job.title,
      employerId: employer.id,
      employerName: employer.companyName,
      workerId: worker.id,
      workerName: worker.fullName,
      scopeOfWork: scopeOfWork || job.description,
      wage: Number(wage) || job.wage,
      wageType: job.wageType,
      duration: duration || job.duration,
      startDate: startDate || job.startDate,
      endDate: endDate || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      paymentTerms: paymentTerms || `Total contract ₹${Number(wage) * 10} held in NavAstitva Escrow. Released upon verified milestone completion.`,
      completionConditions: 'Work must adhere to agreed electrical/vocational safety standards and pass employer milestone inspection.',
      cancellationTerms: '48-hour mutual notice required. Unworked escrow balance refundable.',
      status: 'pending_worker_acceptance' as const,
      employerAcceptedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    db.agreements.unshift(newAgreement);
    db.save('agreements', newAgreement);

    // Update application status to shortlisted/accepted
    if (applicationId) {
      const app = db.applications.find(a => a.id === applicationId);
      if (app) {
        app.status = 'accepted';
        db.save('applications', app);
      }
    }

    // Initialize initial payment record in demo held
    const newPayment = {
      id: `pay-${Date.now()}`,
      agreementId: newAgreement.id,
      jobTitle: newAgreement.jobTitle,
      employerId: employer.id,
      workerId: worker.id,
      amount: newAgreement.wage * 10,
      currency: 'INR' as const,
      status: 'demo_held' as const,
      escrowReference: `ESCROW-NAVA-${Math.floor(10000 + Math.random() * 90000)}-ESCROW`,
      demoLabel: false,
      committedAt: new Date().toISOString(),
      paymentMethod: 'Protected Escrow Vault',
      notes: 'Payment committed by employer in protected escrow.'
    };
    db.payments.unshift(newPayment);
    db.save('payments', newPayment);

    // Initialize progress record
    const newProgress = {
      id: `prog-${Date.now()}`,
      agreementId: newAgreement.id,
      workerId: worker.id,
      jobTitle: newAgreement.jobTitle,
      updates: [],
      currentPercentage: 0,
      completionSubmitted: false,
      completionEvidenceUrls: [],
      completionStatus: 'in_progress' as const
    };
    db.progressUpdates.unshift(newProgress);
    db.save('progressUpdates', newProgress);

    res.json({ agreement: newAgreement, payment: newPayment });
  });

  app.get('/api/agreements', (req, res) => {
    res.json(db.agreements);
  });

  app.get('/api/agreements/:id', (req, res) => {
    const agr = db.agreements.find(a => a.id === req.params.id);
    if (!agr) return res.status(404).json({ error: 'Agreement not found' });
    const payment = db.payments.find(p => p.agreementId === agr.id);
    const progress = db.progressUpdates.find(pr => pr.agreementId === agr.id);
    res.json({ agreement: agr, payment, progress });
  });

  app.post('/api/agreements/:id/sign', (req, res) => {
    const agr = db.agreements.find(a => a.id === req.params.id);
    if (!agr) return res.status(404).json({ error: 'Agreement not found' });

    const currentUser = resolveUser(req) || db.users[0];
    if (currentUser?.role === 'worker') {
      agr.workerAcceptedAt = new Date().toISOString();
      agr.status = 'active';
    } else {
      agr.employerAcceptedAt = new Date().toISOString();
      if (agr.workerAcceptedAt) {
        agr.status = 'active';
      }
    }

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'AGREEMENT_DIGITALLY_SIGNED',
      actorUserId: currentUser?.id || 'unknown',
      actorName: currentUser?.name || 'User',
      actorRole: currentUser?.role || 'worker',
      targetEntity: 'DigitalAgreement',
      targetId: agr.id,
      details: `Agreement ${agr.agreementNumber} signed. Current status: ${agr.status}`
    });

    res.json(agr);
  });

  // Stage 8: Payment Protection (Demo Escrow)
  app.get('/api/payments', (req, res) => {
    res.json(db.payments);
  });

  app.post('/api/payments/release', (req, res) => {
    const { paymentId } = req.body;
    const user = resolveUser(req);

    if (user && user.role !== 'employer' && user.role !== 'admin') {
      return res.status(403).json({ 
        error: `Access restricted: Only the hiring Employer or Ombudsman can authorize escrow payment release. Your current role is "${user.role}".` 
      });
    }

    const payment = db.payments.find(p => p.id === paymentId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    payment.status = 'released';
    payment.releasedAt = new Date().toISOString();
    payment.notes = 'Payment released to worker UPI/Bank account upon confirmed completion.';

    // Update agreement status to completed
    const agr = db.agreements.find(a => a.id === payment.agreementId);
    if (agr) agr.status = 'completed';

    // Increment worker completed jobs
    const worker = db.workers.find(w => w.id === payment.workerId);
    if (worker) {
      worker.jobsCompleted += 1;
      const ts = db.calculateTrustScore(worker.id);
      worker.trustScore = ts.score;
    }

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'ESCROW_PAYMENT_RELEASED',
      actorUserId: user?.id || 'sys-escrow',
      actorName: user?.name || 'Employer / System',
      actorRole: (user?.role as any) || 'employer',
      targetEntity: 'PaymentRecord',
      targetId: payment.id,
      details: `₹${payment.amount} released from escrow ${payment.escrowReference} to worker.`
    });

    res.json({ success: true, payment });
  });

  // Stage 9: Work Completion & Progress
  app.get('/api/progress', (req, res) => {
    res.json(db.progressUpdates);
  });

  app.post('/api/progress/update', (req, res) => {
    const { agreementId, note, percentage, photoUrls } = req.body;
    let prog = db.progressUpdates.find(p => p.agreementId === agreementId);
    if (!prog) {
      prog = {
        id: `prog-${Date.now()}`,
        agreementId,
        workerId: 'wp-1',
        jobTitle: 'Active Job',
        updates: [],
        currentPercentage: 0,
        completionSubmitted: false,
        completionEvidenceUrls: [],
        completionStatus: 'in_progress'
      };
      db.progressUpdates.unshift(prog);
    }

    const newUpdate = {
      id: `up-${Date.now()}`,
      timestamp: new Date().toISOString(),
      note,
      percentage: Number(percentage) || prog.currentPercentage,
      photoUrls: photoUrls || [],
      submittedBy: 'worker' as const
    };

    prog.updates.push(newUpdate);
    prog.currentPercentage = newUpdate.percentage;

    if (prog.currentPercentage >= 100) {
      prog.completionSubmitted = true;
      prog.completionSubmittedAt = new Date().toISOString();
      prog.completionStatus = 'submitted_for_review';
    }

    res.json(prog);
  });

  app.post('/api/progress/confirm-completion', (req, res) => {
    const { agreementId, approved, feedback } = req.body;
    const prog = db.progressUpdates.find(p => p.agreementId === agreementId);
    if (!prog) return res.status(404).json({ error: 'Progress record not found' });

    prog.completionStatus = approved ? 'confirmed' : 'corrections_requested';
    prog.employerFeedback = feedback;
    if (approved) {
      prog.confirmedAt = new Date().toISOString();
      // Also release payment automatically!
      const payment = db.payments.find(p => p.agreementId === agreementId);
      if (payment && payment.status === 'demo_held') {
        payment.status = 'released';
        payment.releasedAt = new Date().toISOString();
      }
      const agr = db.agreements.find(a => a.id === agreementId);
      if (agr) agr.status = 'completed';

      const worker = db.workers.find(w => w.id === prog.workerId);
      if (worker) {
        worker.jobsCompleted += 1;
        const ts = db.calculateTrustScore(worker.id);
        worker.trustScore = ts.score;
      }
    }

    res.json(prog);
  });

  // Stage 10: Ratings & Reviews
  app.get('/api/reviews', (req, res) => {
    res.json(db.reviews);
  });

  app.post('/api/reviews', (req, res) => {
    const { agreementId, toUserId, toRole, rating, qualityOfWork, communication, punctuality, comment } = req.body;
    const currentUser = resolveUser(req) || db.users[0];
    const targetUser = db.users.find(u => u.id === toUserId) || db.users[0];
    const agr = db.agreements.find(a => a.id === agreementId);

    const newReview = {
      id: `rev-${Date.now()}`,
      agreementId: agreementId || 'agr-demo',
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromRole: currentUser.role as ('employer' | 'worker'),
      toUserId: targetUser.id,
      toUserName: targetUser.name,
      toRole: toRole || 'worker',
      jobTitle: agr?.jobTitle || 'Verified Job Deliverable',
      rating: Number(rating) || 5,
      qualityOfWork: Number(qualityOfWork) || 5,
      communication: Number(communication) || 5,
      punctuality: Number(punctuality) || 5,
      comment: comment || 'Pleasure working together. Highly professional and dependable.',
      createdAt: new Date().toISOString()
    };

    db.reviews.unshift(newReview);

    // If review was for a worker, update their rating average and recalculate trust score
    if (toRole === 'worker') {
      const worker = db.workers.find(w => w.userId === targetUser.id);
      if (worker) {
        const workerReviews = db.reviews.filter(r => r.toUserId === targetUser.id);
        const avg = workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length;
        worker.ratingsAverage = Math.round(avg * 10) / 10;
        worker.ratingsCount = workerReviews.length;
        const ts = db.calculateTrustScore(worker.id);
        worker.trustScore = ts.score;
      }
    }

    res.json(newReview);
  });

  // Stage 11: Dispute Resolution
  app.get('/api/disputes', (req, res) => {
    res.json(db.disputes);
  });

  app.post('/api/disputes', async (req, res) => {
    const { agreementId, reason, description, evidenceUrls } = req.body;
    const agr = db.agreements.find(a => a.id === agreementId);
    const currentUser = resolveUser(req) || db.users[0];
    const isWorker = currentUser.role === 'worker';

    const aiAnalysis = await analyzeDisputeWithGemini({
      jobTitle: agr?.jobTitle || 'Work Agreement',
      scopeOfWork: agr?.scopeOfWork || 'General trade task',
      raisedBy: currentUser.role,
      reason,
      description
    });

    const newDispute = {
      id: `disp-${Date.now()}`,
      disputeNumber: `DISP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      agreementId: agreementId || 'agr-demo',
      jobTitle: agr?.jobTitle || 'Agreement Deliverable',
      raisedBy: (isWorker ? 'worker' : 'employer') as ('worker' | 'employer'),
      raisedByUserId: currentUser.id,
      raisedByName: currentUser.name,
      againstUserId: isWorker ? (agr?.employerId || 'usr-employer-1') : (agr?.workerId || 'usr-worker-1'),
      againstName: isWorker ? (agr?.employerName || 'Apex Infra') : (agr?.workerName || 'Ramesh Kumar'),
      reason,
      description,
      evidenceUrls: evidenceUrls || [],
      status: 'ai_analyzed' as const,
      aiAnalysis,
      createdAt: new Date().toISOString()
    };

    db.disputes.unshift(newDispute);

    // Place agreement and payment in disputed hold
    if (agr) agr.status = 'disputed';
    const payment = db.payments.find(p => p.agreementId === agreementId);
    if (payment) payment.status = 'disputed_hold';

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'DISPUTE_FILED_AND_AI_ANALYZED',
      actorUserId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetEntity: 'Dispute',
      targetId: newDispute.id,
      details: `Dispute ${newDispute.disputeNumber} filed regarding "${reason}". AI analysis completed.`
    });

    res.json(newDispute);
  });

  app.post('/api/disputes/resolve', (req, res) => {
    const { disputeId, outcome, resolutionNotes, settlementAmount } = req.body;
    const user = resolveUser(req);

    if (user && user.role !== 'admin') {
      return res.status(403).json({ 
        error: `Access restricted: Only certified Ombudsman Arbitrators (Admin role) can issue binding dispute resolutions. Your current role is "${user.role}".` 
      });
    }

    const dispute = db.disputes.find(d => d.id === disputeId);
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });

    dispute.status = 'resolved';
    dispute.verifierDecision = {
      outcome, // 'full_release_to_worker' | 'partial_settlement' | 'full_refund_to_employer' | 'mutual_renegotiation'
      resolutionNotes,
      settlementAmount: settlementAmount ? Number(settlementAmount) : undefined,
      decidedBy: 'Dr. Anita Sen (NavAstitva Lead Ombudsman)',
      decidedAt: new Date().toISOString()
    };

    // Release or refund payment accordingly
    const payment = db.payments.find(p => p.agreementId === dispute.agreementId);
    if (payment) {
      if (outcome === 'full_release_to_worker') {
        payment.status = 'released';
        payment.releasedAt = new Date().toISOString();
        payment.notes = 'Released following dispute arbitrator verdict.';
      } else if (outcome === 'full_refund_to_employer') {
        payment.status = 'refunded';
        payment.notes = 'Refunded to employer following dispute arbitrator verdict.';
      } else {
        payment.status = 'released';
        payment.notes = `Partial settlement of ₹${settlementAmount || payment.amount / 2} disbursed.`;
      }
    }

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'DISPUTE_RESOLVED_BY_HUMAN_ARBITRATOR',
      actorUserId: 'usr-admin-1',
      actorName: 'Dr. Anita Sen (NavAstitva Ombudsman)',
      actorRole: 'admin',
      targetEntity: 'Dispute',
      targetId: dispute.id,
      details: `Dispute ${dispute.disputeNumber} resolved with outcome: ${outcome}. Notes: ${resolutionNotes}`
    });

    res.json(dispute);
  });

  // AI Voice & Smart Support Assistant
  app.post('/api/ai/assistant', async (req, res) => {
    try {
      const { prompt, language, role } = req.body;
      const reply = await askSmartAssistant(
        prompt || 'How does NavAstitva help me get jobs?',
        language || 'hi',
        role || 'worker'
      );
      res.json({ reply });
    } catch (err) {
      res.json({ 
        reply: 'Welcome to NavAstitva! You can upload work photos or certificates to earn verified badges, unlock an 85+ Trust Score, and apply for verified jobs with guaranteed escrow payment protection.' 
      });
    }
  });

  // Audit Logs
  app.get('/api/admin/audit-logs', (req, res) => {
    res.json(db.auditLogs);
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NavAstitva full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
