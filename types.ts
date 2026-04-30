
export enum UserRole {
  MEMBER = 'MEMBER',
  MEMBER_AFFILIATE = 'MEMBER_AFFILIATE',
  ADMIN = 'ADMIN'
}

export enum MemberLevel {
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}

export enum AffiliateLevel {
  STARTER = 'Starter',
  PRO = 'Pro',
  ELITE = 'Elite'
}

export interface User {
  id: string; // UserID
  name: string; // Nama_Lengkap
  email: string; // Email
  password?: string; // Password
  role: UserRole; // Role
  status: 'ACTIVE' | 'PENDING' | 'BANNED' | 'REJECTED' | 'VERIFIED'; // Account_Status mappings
  referredBy?: string; // Referred_By (ID Upline Permanen)
  joinDate: string; // Created_At
  phone?: string; // Nomor_Telepon
  photoURL?: string; // Foto_Profil
  
  // AI Insight & Validation
  ktm_url?: string;
  ai_is_telkom?: boolean;
  ai_confidence?: number;
  ai_reasoning?: string;
  
  // Member specific
  level?: MemberLevel;
  totalPoints?: number;
  cashbackPoints?: number;
  pointLogs?: PointLog[];

  // Affiliate specific
  referralCode?: string;
  affiliateLevel?: AffiliateLevel;
  totalDownlines?: number;
  totalReferralTransactions?: number; 
  commissionPoints?: number;
  
  // Legacy/App specific fields
  nim?: string;
  major?: string;
}

export interface TransactionItem {
  name: string;
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'PURCHASE' | 'COMMISSION' | 'REDEMPTION';
  points: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  items?: TransactionItem[];
}

export interface Voucher {
  id: string;
  title: string;
  code: string;
  discount: string;
  minSpend: number;
  expiry: string;
  isClaimed: boolean;
  image: string;
  pointCost?: number;
  createdBy?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  pointCost: number;
  image: string;
  description: string;
  category: 'FOOD' | 'DRINK';
  isAvailable: boolean;
}

export interface PointLog {
  id: string;
  date: string;
  amount: number;
  source: string;
  type: 'IN' | 'OUT';
}

export interface CommissionLog {
  logId: string;
  date: string;
  affiliateId: string;
  downlineId: string;
  pointsEarned: number;
}

export interface RedemptionLog {
  logId: string;
  userId: string;
  pointsUsed: number;
  voucherIdReference: string;
  status: 'SUCCESS' | 'PENDING';
}
