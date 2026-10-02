export interface FeeLevy {
  id: string;
  name: string;
  amount: number;
  priority: number; // lower number = cleared first during partial payments
  category: 'essential' | 'academic' | 'facility' | 'tuition';
}

export interface AllocatedLevyItem extends FeeLevy {
  amountPaid: number;
  balance: number;
  status: 'CLEARED' | 'PARTIAL' | 'PENDING';
}

export interface BankAccountDetails {
  sectionName: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode?: string;
  applicableWings: string[];
}

export const OFFICIAL_BANK_ACCOUNTS: Record<'primary' | 'secondary', BankAccountDetails> = {
  primary: {
    sectionName: 'Nursery & Primary School Account',
    applicableWings: ['Nursery', 'Early Years', 'Primary'],
    bankName: 'Official Commercial Bank (Pending School Final Specification)',
    accountName: 'MSSN Islamic Model Primary School - Operations',
    accountNumber: 'Official Account (To Be Stated by School)',
    sortCode: '301001',
  },
  secondary: {
    sectionName: 'Secondary School (Junior & Senior) Account',
    applicableWings: ['Junior Secondary', 'Senior Secondary'],
    bankName: 'Official Commercial Bank (Pending School Final Specification)',
    accountName: 'MSSN Islamic Model College - Secondary Operations',
    accountNumber: 'Official Account (To Be Stated by School)',
    sortCode: '301002',
  },
};

export const STANDARD_LEVIES_BY_WING: Record<string, FeeLevy[]> = {
  'SSS 3 Candidate': [
    { id: 'medical', name: 'Medical & Healthcare Insurance', amount: 3000, priority: 1, category: 'essential' },
    { id: 'waec', name: 'WAEC Examination Registration & Practical Dues', amount: 35000, priority: 2, category: 'academic' },
    { id: 'neco', name: 'NECO & NBAIS Examination Council Assessment', amount: 32000, priority: 3, category: 'academic' },
    { id: 'lab-practical', name: 'Senior Science Practicals & Consumables', amount: 6000, priority: 4, category: 'academic' },
    { id: 'development', name: 'Senior Campus Infrastructure Levy', amount: 5000, priority: 5, category: 'facility' },
    { id: 'graduation', name: 'Valedictory Service & Exit Broadsheet Levy', amount: 7500, priority: 6, category: 'facility' },
    { id: 'tuition', name: 'SSS 3 Senior Tuition & Instructional Delivery', amount: 38000, priority: 7, category: 'tuition' },
  ],
  'Senior Secondary': [
    { id: 'medical', name: 'Medical & Student Healthcare Insurance', amount: 3000, priority: 1, category: 'essential' },
    { id: 'exam', name: 'Terminal Examination & Mock Assessment', amount: 4500, priority: 2, category: 'academic' },
    { id: 'development', name: 'School Development & Campus Maintenance', amount: 5000, priority: 3, category: 'facility' },
    { id: 'ict', name: 'ICT & CBT Practice Lab Levy', amount: 3500, priority: 4, category: 'academic' },
    { id: 'lab', name: 'Science Laboratory & Practical Consumables', amount: 4000, priority: 5, category: 'academic' },
    { id: 'tuition', name: 'Tuition & Instructional Delivery', amount: 35000, priority: 6, category: 'tuition' },
  ],
  'JSS 3 Candidate': [
    { id: 'medical', name: 'Medical & Healthcare Insurance', amount: 3000, priority: 1, category: 'essential' },
    { id: 'bece', name: 'State & National BECE Examination Council Registration', amount: 20000, priority: 2, category: 'academic' },
    { id: 'bece-mock', name: 'Junior Mock Assessment & Continuous Broadsheet', amount: 5000, priority: 3, category: 'academic' },
    { id: 'ict', name: 'Computer Studies & Tech Lab Access', amount: 3500, priority: 4, category: 'academic' },
    { id: 'development', name: 'Campus Development Levy', amount: 5000, priority: 5, category: 'facility' },
    { id: 'valedictory', name: 'Junior Valedictory & Transition Levy', amount: 5000, priority: 6, category: 'facility' },
    { id: 'tuition', name: 'JSS 3 Tuition & Academic Instruction', amount: 35000, priority: 7, category: 'tuition' },
  ],
  'Junior Secondary': [
    { id: 'medical', name: 'Medical & Healthcare Insurance', amount: 3000, priority: 1, category: 'essential' },
    { id: 'exam', name: 'Terminal Examination & Assessment Materials', amount: 4000, priority: 2, category: 'academic' },
    { id: 'development', name: 'Campus Development Levy', amount: 5000, priority: 3, category: 'facility' },
    { id: 'ict', name: 'Computer Studies & Tech Lab Access', amount: 3000, priority: 4, category: 'academic' },
    { id: 'tuition', name: 'Junior Secondary Tuition & Instruction', amount: 33000, priority: 5, category: 'tuition' },
  ],
  'Primary 5 Exit': [
    { id: 'medical', name: 'Student Medical Care & First Aid', amount: 2500, priority: 1, category: 'essential' },
    { id: 'common-entrance', name: 'State Common Entrance & National Transition Exam', amount: 9500, priority: 2, category: 'academic' },
    { id: 'development', name: 'Primary Campus Development Levy', amount: 4000, priority: 3, category: 'facility' },
    { id: 'tahfeez', name: 'Quran Memorization & Arabic Assessment', amount: 2500, priority: 4, category: 'academic' },
    { id: 'tuition', name: 'Primary 5 Academic Tuition & Exam Preparation', amount: 32000, priority: 5, category: 'tuition' },
  ],
  'Primary': [
    { id: 'medical', name: 'Student Medical Care & First Aid', amount: 2500, priority: 1, category: 'essential' },
    { id: 'exam', name: 'Continuous Assessment & Examination Slips', amount: 3500, priority: 2, category: 'academic' },
    { id: 'development', name: 'Primary Campus Development Levy', amount: 4000, priority: 3, category: 'facility' },
    { id: 'tahfeez', name: 'Quran Memorization & Arabic Materials', amount: 2000, priority: 4, category: 'academic' },
    { id: 'tuition', name: 'Basic Academic Tuition', amount: 30000, priority: 5, category: 'tuition' },
  ],
  'Nursery': [
    { id: 'medical', name: 'Infant Healthcare & Safety Oversight', amount: 3000, priority: 1, category: 'essential' },
    { id: 'activities', name: 'Montessori Activity & Learning Packs', amount: 3500, priority: 2, category: 'academic' },
    { id: 'development', name: 'Early Childhood Care Facility Levy', amount: 3500, priority: 3, category: 'facility' },
    { id: 'tuition', name: 'Early Childhood Tuition Fee', amount: 28500, priority: 4, category: 'tuition' },
  ],
  'Early Years': [
    { id: 'medical', name: 'Infant Healthcare & Safety Oversight', amount: 3000, priority: 1, category: 'essential' },
    { id: 'activities', name: 'Montessori Activity & Learning Packs', amount: 3500, priority: 2, category: 'academic' },
    { id: 'development', name: 'Early Childhood Care Facility Levy', amount: 3500, priority: 3, category: 'facility' },
    { id: 'tuition', name: 'Early Childhood Tuition Fee', amount: 28500, priority: 4, category: 'tuition' },
  ],
};

/**
 * Priority-based allocation of payments across levies.
 * Ensures essential levies (Medicals, Exams, Development) clear first before Tuition.
 */
export function allocatePaymentToLevies(
  levies: FeeLevy[],
  totalPaidToDate: number
): { allocated: AllocatedLevyItem[]; totalBilled: number; totalPaid: number; balance: number } {
  // Sort levies by priority ascending
  const sorted = [...levies].sort((a, b) => a.priority - b.priority);
  const totalBilled = sorted.reduce((sum, l) => sum + Number(l.amount || 0), 0);
  const effectivePaid = Math.min(totalBilled, Math.max(0, totalPaidToDate));
  let remainingBudget = effectivePaid;

  const allocated: AllocatedLevyItem[] = sorted.map((levy) => {
    const cost = Number(levy.amount || 0);
    if (remainingBudget >= cost) {
      remainingBudget -= cost;
      return {
        ...levy,
        amountPaid: cost,
        balance: 0,
        status: 'CLEARED' as const,
      };
    } else if (remainingBudget > 0) {
      const paid = remainingBudget;
      remainingBudget = 0;
      return {
        ...levy,
        amountPaid: paid,
        balance: cost - paid,
        status: 'PARTIAL' as const,
      };
    } else {
      return {
        ...levy,
        amountPaid: 0,
        balance: cost,
        status: 'PENDING' as const,
      };
    }
  });

  return {
    allocated,
    totalBilled,
    totalPaid: effectivePaid,
    balance: Math.max(0, totalBilled - effectivePaid),
  };
}

/**
 * Returns the appropriate bank account according to the school wing
 */
export function getBankAccountForWing(wingOrClassName?: string): BankAccountDetails {
  const normalized = (wingOrClassName || '').toLowerCase();
  if (normalized.includes('primary') || normalized.includes('nursery') || normalized.includes('creche') || normalized.includes('basic')) {
    return OFFICIAL_BANK_ACCOUNTS.primary;
  }
  return OFFICIAL_BANK_ACCOUNTS.secondary;
}

/**
 * Resolves the accurate tariff levies for a given class, differentiating
 * external candidate classes (SSS 3 with WAEC/NECO, JSS 3 with BECE, Primary 5 with Common Entrance)
 * from continuing classes.
 */
export function getLeviesForStudentClass(className?: string): FeeLevy[] {
  const norm = (className || '').toLowerCase().trim();

  // SSS 3 Candidate Class (WAEC + NECO + Science Lab + Valedictory)
  if (norm.includes('sss 3') || norm.includes('sss3') || norm.includes('ss 3') || norm.includes('ss3')) {
    return STANDARD_LEVIES_BY_WING['SSS 3 Candidate'];
  }
  // Continuing Senior Secondary (SSS 1 & SSS 2)
  if (norm.includes('sss') || norm.includes('ss 1') || norm.includes('ss 2') || norm.includes('senior')) {
    return STANDARD_LEVIES_BY_WING['Senior Secondary'];
  }
  // JSS 3 Candidate Class (BECE State & National)
  if (norm.includes('jss 3') || norm.includes('jss3') || norm.includes('js 3') || norm.includes('js3')) {
    return STANDARD_LEVIES_BY_WING['JSS 3 Candidate'];
  }
  // Continuing Junior Secondary (JSS 1 & JSS 2)
  if (norm.includes('jss') || norm.includes('js 1') || norm.includes('js 2') || norm.includes('junior')) {
    return STANDARD_LEVIES_BY_WING['Junior Secondary'];
  }
  // Primary 5 Exit Class (Common Entrance)
  if (norm.includes('primary 5') || norm.includes('basic 5') || norm.includes('pri 5')) {
    return STANDARD_LEVIES_BY_WING['Primary 5 Exit'];
  }
  // Continuing Primary (Primary 1 - 4)
  if (norm.includes('primary') || norm.includes('basic') || norm.includes('pri')) {
    return STANDARD_LEVIES_BY_WING['Primary'];
  }
  // Nursery & Early Years
  return STANDARD_LEVIES_BY_WING['Nursery'];
}
