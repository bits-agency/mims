import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSession } from '@/lib/auth';

async function checkSuperAdmin() {
  const session = await getSession();
  if (!session) return false;
  return session.email?.toLowerCase() === 'bamiebot@gmail.com' || session.role === 'super_admin';
}

const DATA_FILE = path.join(process.cwd(), 'data', 'fee_structures.json');

export interface FeeLevy {
  id: string;
  name: string;
  amount: number;
  priority: number; // lower number = cleared first during partial payments
  category: 'essential' | 'academic' | 'facility' | 'tuition';
}

export interface LevelFeeStructure {
  levelId: string;
  levelName: string;
  wing: 'Early Years' | 'Primary' | 'Junior Secondary' | 'Senior Secondary';
  levies: FeeLevy[];
  totalFee: number;
  description: string;
}

export interface BankAccountConfig {
  sectionName: string;
  applicableWings: string[];
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode?: string;
  status: string;
}

const DEFAULT_BANK_ACCOUNTS: Record<string, BankAccountConfig> = {
  primary: {
    sectionName: 'Nursery & Primary School Account',
    applicableWings: ['Nursery', 'Early Years', 'Primary'],
    bankName: 'Official Commercial Bank (Pending School Spec)',
    accountName: 'MSSN Islamic Model Primary School - Operations',
    accountNumber: 'To Be Stated by School Management',
    sortCode: '301001',
    status: 'Designated for Early Years & Primary 1-5',
  },
  secondary: {
    sectionName: 'Secondary School (Junior & Senior) Account',
    applicableWings: ['Junior Secondary', 'Senior Secondary'],
    bankName: 'Official Commercial Bank (Pending School Spec)',
    accountName: 'MSSN Islamic Model College - Secondary Operations',
    accountNumber: 'To Be Stated by School Management',
    sortCode: '301002',
    status: 'Designated for JSS 1 - SSS 3 Day & Boarding',
  },
};

const DEFAULT_FEE_STRUCTURES: LevelFeeStructure[] = [
  {
    levelId: 'sss-3-candidate',
    levelName: 'Senior Secondary 3 (SSS 3 - WAEC / NECO / NBAIS Candidate Class)',
    wing: 'Senior Secondary',
    description: 'Senior external examination council registrations (WAEC, NECO, NBAIS), mock exams, science lab consumables, and graduation valedictory service.',
    levies: [
      { id: 'medical', name: 'Medical & Student Healthcare Insurance', amount: 3000, priority: 1, category: 'essential' },
      { id: 'waec', name: 'WAEC Examination Registration & Practical Dues', amount: 35000, priority: 2, category: 'academic' },
      { id: 'neco', name: 'NECO & NBAIS Examination Council Assessment', amount: 32000, priority: 3, category: 'academic' },
      { id: 'lab-practical', name: 'Senior Science Practicals & Consumables', amount: 6000, priority: 4, category: 'academic' },
      { id: 'development', name: 'Senior Campus Infrastructure Levy', amount: 5000, priority: 5, category: 'facility' },
      { id: 'graduation', name: 'Valedictory Service & Exit Broadsheet Levy', amount: 7500, priority: 6, category: 'facility' },
      { id: 'tuition', name: 'SSS 3 Senior Tuition & Instructional Delivery', amount: 38000, priority: 7, category: 'tuition' },
    ],
    totalFee: 126500,
  },
  {
    levelId: 'senior-sec',
    levelName: 'Senior Secondary (SSS 1 & SSS 2 Continuing)',
    wing: 'Senior Secondary',
    description: 'Senior secondary WAEC preparatory curriculum, science lab practicals, humanities, and Islamic studies.',
    levies: [
      { id: 'medical', name: 'Medical & Student Healthcare', amount: 3000, priority: 1, category: 'essential' },
      { id: 'exam', name: 'Terminal Examination & Mock Assessment', amount: 4500, priority: 2, category: 'academic' },
      { id: 'development', name: 'School Development & Campus Maintenance', amount: 5000, priority: 3, category: 'facility' },
      { id: 'ict', name: 'ICT & CBT Practice Lab Levy', amount: 3500, priority: 4, category: 'academic' },
      { id: 'lab', name: 'Science Laboratory & Practical Consumables', amount: 4000, priority: 5, category: 'academic' },
      { id: 'tuition', name: 'Tuition & Instructional Delivery', amount: 35000, priority: 6, category: 'tuition' },
    ],
    totalFee: 55000,
  },
  {
    levelId: 'jss-3-candidate',
    levelName: 'Junior Secondary 3 (JSS 3 - BECE Candidate Class)',
    wing: 'Junior Secondary',
    description: 'Junior secondary exit class with State & National BECE examination council registration, Junior WAEC mock assessment, and transition certification.',
    levies: [
      { id: 'medical', name: 'Medical & Healthcare Insurance', amount: 3000, priority: 1, category: 'essential' },
      { id: 'bece', name: 'State & National BECE Examination Council Registration', amount: 20000, priority: 2, category: 'academic' },
      { id: 'bece-mock', name: 'Junior Mock Assessment & Continuous Broadsheet', amount: 5000, priority: 3, category: 'academic' },
      { id: 'ict', name: 'Computer Studies & Tech Lab Access', amount: 3500, priority: 4, category: 'academic' },
      { id: 'development', name: 'Campus Development Levy', amount: 5000, priority: 5, category: 'facility' },
      { id: 'valedictory', name: 'Junior Valedictory & Transition Levy', amount: 5000, priority: 6, category: 'facility' },
      { id: 'tuition', name: 'JSS 3 Tuition & Academic Instruction', amount: 35000, priority: 7, category: 'tuition' },
    ],
    totalFee: 76500,
  },
  {
    levelId: 'junior-sec',
    levelName: 'Junior Secondary (JSS 1 & JSS 2 Continuing)',
    wing: 'Junior Secondary',
    description: 'Foundational secondary studies, Basic Science & Tech practicals, introductory Arabic & ICT.',
    levies: [
      { id: 'medical', name: 'Medical & Healthcare Levy', amount: 3000, priority: 1, category: 'essential' },
      { id: 'exam', name: 'Terminal Examination & Assessment Materials', amount: 4000, priority: 2, category: 'academic' },
      { id: 'development', name: 'Campus Development Levy', amount: 5000, priority: 3, category: 'facility' },
      { id: 'ict', name: 'Computer Studies & Tech Lab', amount: 3000, priority: 4, category: 'academic' },
      { id: 'tuition', name: 'Tuition & Academic Instruction', amount: 33000, priority: 5, category: 'tuition' },
    ],
    totalFee: 48000,
  },
  {
    levelId: 'primary-5-exit',
    levelName: 'Primary 5 (Basic 5 - Common Entrance Exit Class)',
    wing: 'Primary',
    description: 'Primary school graduation class including State Common Entrance, National Common Entrance Examination (NCEE), and testimonial certification.',
    levies: [
      { id: 'medical', name: 'Student Medical Care & First Aid', amount: 2500, priority: 1, category: 'essential' },
      { id: 'common-entrance', name: 'State Common Entrance & National Transition Exam', amount: 9500, priority: 2, category: 'academic' },
      { id: 'development', name: 'Primary Campus Development Levy', amount: 4000, priority: 3, category: 'facility' },
      { id: 'tahfeez', name: 'Quran Memorization & Arabic Assessment', amount: 2500, priority: 4, category: 'academic' },
      { id: 'tuition', name: 'Primary 5 Academic Tuition & Exam Preparation', amount: 32000, priority: 5, category: 'tuition' },
    ],
    totalFee: 50500,
  },
  {
    levelId: 'primary',
    levelName: 'Primary Education (Basic 1 - Basic 4 Continuing)',
    wing: 'Primary',
    description: 'Literacy, numeracy, foundation Quran Tahfeez, sports, and continuous assessment.',
    levies: [
      { id: 'medical', name: 'Student Medical Care & First Aid', amount: 2500, priority: 1, category: 'essential' },
      { id: 'exam', name: 'Continuous Assessment & Examination Slips', amount: 3500, priority: 2, category: 'academic' },
      { id: 'development', name: 'Primary Development Levy', amount: 4000, priority: 3, category: 'facility' },
      { id: 'tahfeez', name: 'Quran Memorization & Arabic Materials', amount: 2000, priority: 4, category: 'academic' },
      { id: 'tuition', name: 'Basic Academic Tuition', amount: 30000, priority: 5, category: 'tuition' },
    ],
    totalFee: 42000,
  },
  {
    levelId: 'early-years',
    levelName: 'Nursery & Early Years (Creche, KG 1 - KG 2)',
    wing: 'Early Years',
    description: 'Early childhood sensory learning, play kits, moral foundations, and specialized care.',
    levies: [
      { id: 'medical', name: 'Infant Healthcare & Safety Oversight', amount: 3000, priority: 1, category: 'essential' },
      { id: 'activities', name: 'Montessori Activity & Learning Packs', amount: 3500, priority: 2, category: 'academic' },
      { id: 'development', name: 'Early Childhood Care Facility Levy', amount: 3500, priority: 3, category: 'facility' },
      { id: 'tuition', name: 'Early Childhood Tuition Fee', amount: 28500, priority: 4, category: 'tuition' },
    ],
    totalFee: 38500,
  },
];

function getStoredFeeData() {
  try {
    if (!fs.existsSync(path.dirname(DATA_FILE))) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initialData = {
        bankAccounts: DEFAULT_BANK_ACCOUNTS,
        structures: DEFAULT_FEE_STRUCTURES,
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {
      bankAccounts: DEFAULT_BANK_ACCOUNTS,
      structures: DEFAULT_FEE_STRUCTURES,
    };
  }
}

function saveStoredFeeData(data: any) {
  try {
    if (!fs.existsSync(path.dirname(DATA_FILE))) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save fee structures data:', err);
  }
}

export async function GET() {
  try {
    const data = getStoredFeeData();
    return NextResponse.json({ success: true, ...data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isSuper = await checkSuperAdmin();
    if (!isSuper) {
      return NextResponse.json(
        { error: 'Unauthorized: Only Super Administrators (Governing Board) have permission to alter fee tariffs or school bank accounts.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const current = getStoredFeeData();

    if (body.structures && Array.isArray(body.structures)) {
      // Recalculate totalFee for each structure
      const updatedStructures = body.structures.map((s: LevelFeeStructure) => {
        const total = (s.levies || []).reduce((sum, l) => sum + Number(l.amount || 0), 0);
        return {
          ...s,
          totalFee: total,
        };
      });
      current.structures = updatedStructures;
    }

    if (body.bankAccounts) {
      current.bankAccounts = {
        ...current.bankAccounts,
        ...body.bankAccounts,
      };
    }

    saveStoredFeeData(current);

    return NextResponse.json({
      success: true,
      message: 'Fee structures and bank accounts updated successfully.',
      ...current,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
