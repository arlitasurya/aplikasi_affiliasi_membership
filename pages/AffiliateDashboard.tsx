import React, { useState, useEffect } from 'react';
import { User, Copy, Share2, TrendingUp, Users, Award, ArrowLeft, Zap } from 'lucide-react';
import { User as UserType, AffiliateLevel } from '../types';
import { getAffiliateNetwork, getAffiliateStats } from '../services/apiService';

interface AffiliateDashboardProps {
  user: UserType;
  onBack: () => void;
}

interface AffiliateData {
  // From affiliate_networks.total_referrals
  totalDownlines: number;
  
  // From affiliate_networks.commission_points - NOT user poin biasa
  totalCommission: number;
  
  // From affiliate_networks.total_points - NOT user.totalPoints
  // This is affiliate-specific poin, separate dari user_points table
  totalPoints: number;
  
  // From affiliate_networks.affiliate_tier
  affiliateLevel: AffiliateLevel;
  
  levelProgress: number;
  nextLevelTarget: number;
  commissionBreakdown: {
    poinKomisi: number;
    poinCashback: number;
  };
}

// Define affiliate level thresholds
const AFFILIATE_LEVELS = {
  [AffiliateLevel.STARTER]: { min: 0, max: 9, minCommission: 0 },
  [AffiliateLevel.PRO]: { min: 10, max: 49, minCommission: 5000 },
  [AffiliateLevel.ELITE]: { min: 50, max: Infinity, minCommission: 15000 }
};

/**
 * Normalize backend tier names to frontend tier names
 * Backend sends from affiliate_networks.affiliate_tier: "Basic", "Pro", "Elite"
 * Frontend displays: "Starter", "Pro", "Elite"
 */
const mapBackendTierToFrontend = (backendTier: string): AffiliateLevel => {
  const tierMap: Record<string, AffiliateLevel> = {
    'Basic': AffiliateLevel.STARTER,
    'Starter': AffiliateLevel.STARTER,
    'Pro': AffiliateLevel.PRO,
    'Elite': AffiliateLevel.ELITE
  };
  
  return tierMap[backendTier] || AffiliateLevel.STARTER;
};

const calculateLevelInfo = (downlines: number): { level: AffiliateLevel; progress: number; target: number } => {
  let level: AffiliateLevel;
  let progress = 0;
  let nextTarget = 10; // default

  if (downlines >= 50) {
    level = AffiliateLevel.ELITE;
    progress = 100;
    nextTarget = downlines;
  } else if (downlines >= 10) {
    level = AffiliateLevel.PRO;
    progress = ((downlines - 10) / 40) * 100;
    nextTarget = 50;
  } else {
    level = AffiliateLevel.STARTER;
    progress = (downlines / 10) * 100;
    nextTarget = 10;
  }

  return {
    level,
    progress: Math.min(100, Math.max(0, progress)),
    target: nextTarget
  };
};

const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ user, onBack }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  /**
   * Initialize with empty affiliate data
   * NOTE: Do NOT use user.totalPoints - that's from user_points table
   * This dashboard uses affiliate_networks.total_points instead
   */
  const [affiliateData, setAffiliateData] = useState<AffiliateData>({
    totalDownlines: 0,
    totalCommission: 0,
    totalPoints: 0,
    affiliateLevel: AffiliateLevel.STARTER,
    levelProgress: 0,
    nextLevelTarget: 10,
    commissionBreakdown: {
      poinKomisi: 0,
      poinCashback: 0
    }
  });

useEffect(() => {
    const fetchAffiliateData = async () => {
      try {
        setLoading(true);
        const networkData = await getAffiliateNetwork(user.id);
        
        // 🕵️‍♀️ MATA-MATA 1: Mengintip apa yang sebenarnya dikirim oleh apiService
        console.log("🕵️‍♀️ [MATA-MATA 1] RAW DATA DARI API SERVICE:", networkData);

        if (networkData) {
          // JURUS ANTI BUNGKUSAN: Kalau datanya tersembunyi di dalam property 'data' (efek Axios/Fetch)
          const data = networkData.data || networkData.network || networkData;
          
          // 📦 MATA-MATA 2: Memastikan bungkusan sudah terbuka
          console.log("📦 [MATA-MATA 2] DATA SIAP BACA:", data);
          
          // Mapping diperluas untuk menangkap semua kemungkinan nama dari database
          const downlines = data?.totalDownlines ?? data?.total_downlines ?? data?.total_referrals ?? 0;
          const commission = data?.totalCommission ?? data?.commission_points ?? 0;
          const points = data?.totalPoints ?? data?.total_points ?? 0;
          let affiliateLevelFromData = data?.affiliateLevel ?? data?.affiliate_tier ?? 'Starter';
          
          const { level, progress, target } = calculateLevelInfo(downlines);
          const mappedLevel = mapBackendTierToFrontend(affiliateLevelFromData);

          setAffiliateData({
            totalDownlines: downlines,
            totalCommission: commission,
            totalPoints: points,
            affiliateLevel: mappedLevel,
            levelProgress: progress,
            nextLevelTarget: target,
            commissionBreakdown: {
              poinKomisi: commission,
              poinCashback: points - commission
            }
          });
        }
      } catch (error) {
        console.error('Error fetching affiliate data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAffiliateData();
  }, [user.id]);

  const copyReferralCode = () => {
    if (user.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const shareReferral = () => {
    const message = `Bergabunglah dengan NgolabHub sebagai member affiliate! Gunakan kode referral saya: ${user.referralCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'NgolabHub Affiliate',
        text: message,
        url: window.location.href
      });
    } else {
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-orange-200 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-orange-700" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-orange-900">Dashboard Afiliasi testing yang baru</h1>
          <p className="text-orange-700">Pantau pertumbuhan jaringan dan komisi Anda.</p>
        </div>
      </div>

      {/* Welcome Card with Level Badge */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-[2.5rem] shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm uppercase font-semibold">AFFILIATE PARTNER</p>
            <h2 className="text-2xl font-bold mt-2">{user.name}</h2>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur">
              <Zap size={20} className="text-yellow-300" />
              <span className="font-bold text-lg">{affiliateData.affiliateLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Referral Code */}
        <div className="bg-white rounded-[2.5rem] shadow-lg p-6">
          <h3 className="text-sm font-bold text-slate-600 uppercase mb-3">Kode Referral Anda</h3>
          <div className="flex items-center gap-3 mb-4">
            <code className="text-2xl font-mono font-bold text-orange-600 flex-1">
              {user.referralCode || 'N/A'}
            </code>
            <button
              onClick={copyReferralCode}
              className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
              title="Copy referral code"
            >
              <Copy size={20} className={copiedCode ? 'text-green-600' : 'text-orange-600'} />
            </button>
          </div>
          <button
            onClick={shareReferral}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-3 rounded-xl transition-colors text-sm"
          >
            <Share2 size={16} className="inline mr-2" />
            Bagikan Kode
          </button>
        </div>

        {/* Total Saldo Poin */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-[2.5rem] shadow-lg p-6 text-white">
          <h3 className="text-sm font-bold text-orange-100 uppercase mb-3">Total Saldo Poin</h3>
          <div className="mb-4">
            <p className="text-4xl font-bold mb-1">{affiliateData.totalPoints.toLocaleString('id-ID')}</p>
            <p className="text-orange-100 text-sm">Gabungan Member & Affiliasi</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-lg">
              <span>👥 Total Referral</span>
              <span className="font-bold">{affiliateData.totalDownlines} Member</span>
            </div>
            <div className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-lg">
              <span>⭐ Poin Komisi</span>
              <span className="font-bold">{affiliateData.commissionBreakdown.poinKomisi.toLocaleString('id-ID')} PTS</span>
            </div>
            <div className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-lg">
              <span>💰 Poin Cashback</span>
              <span className="font-bold">{affiliateData.commissionBreakdown.poinCashback.toLocaleString('id-ID')} PTS</span>
            </div>
          </div>
        </div>

        {/* Level Afiliasi */}
        <div className="bg-white rounded-[2.5rem] shadow-lg p-6">
          <h3 className="text-sm font-bold text-slate-600 uppercase mb-3">Level Afiliasi</h3>
          <div className="text-4xl font-bold text-orange-600 mb-4">{affiliateData.affiliateLevel}</div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-600">Progress Level</span>
              <span className="text-sm font-bold text-orange-600">{Math.round(affiliateData.levelProgress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${affiliateData.levelProgress}%` }}
              />
            </div>
          </div>
          
          <p className="text-xs text-slate-600">
            {affiliateData.affiliateLevel === AffiliateLevel.ELITE
              ? '✨ Maksimal Level Tercapai!'
              : `Butuh ${affiliateData.nextLevelTarget - affiliateData.totalDownlines} member lagi untuk naik level`}
          </p>
        </div>
      </div>

      {/* Referral Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Downlines */}
        <div className="bg-white rounded-[2.5rem] shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
            <h4 className="font-bold text-slate-900">Total Referral</h4>
          </div>
          <p className="text-4xl font-bold text-blue-600 mb-2">{affiliateData.totalDownlines}</p>
          <p className="text-slate-600 text-sm">Teman yang bergabung via kode Anda</p>
        </div>

        {/* Commission */}
        <div className="bg-white rounded-[2.5rem] shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            <h4 className="font-bold text-slate-900">Komisi Total</h4>
          </div>
          <p className="text-4xl font-bold text-green-600 mb-2">
            {affiliateData.totalCommission.toLocaleString('id-ID')} PTS
          </p>
          <p className="text-slate-600 text-sm">Total komisi yang diterima</p>
        </div>
      </div>

      {/* Level System Info */}
      <div className="bg-white rounded-[2.5rem] shadow-lg p-8 mb-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Sistem Level Afiliasi</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600 w-12">⭐</div>
            <div>
              <h4 className="font-bold text-slate-900">Starter (0-9 Member)</h4>
              <p className="text-slate-600 text-sm">Level awal untuk affiliate baru. Mulai bangun jaringan Anda dengan mengajak member.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl border-l-4 border-orange-500">
            <div className="text-3xl font-bold text-orange-600 w-12">🔥</div>
            <div>
              <h4 className="font-bold text-slate-900">Pro (10-49 Member)</h4>
              <p className="text-slate-600 text-sm">Tingkat menengah. Komisi meningkat 2x lipat dari level Starter. Butuh 10 member untuk naik ke level ini.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border-l-4 border-purple-500">
            <div className="text-3xl font-bold text-purple-600 w-12">👑</div>
            <div>
              <h4 className="font-bold text-slate-900">Elite (50+ Member)</h4>
              <p className="text-slate-600 text-sm">Level tertinggi. Komisi maksimal 3x lipat. Bonus eksklusif dan benefit premium menanti Anda.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-[2.5rem] shadow-lg p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Cara Mengoptimalkan Komisi Anda</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl">
            <div className="text-2xl">🎁</div>
            <div>
              <h4 className="font-bold text-slate-900">Bagikan Kode Referral</h4>
              <p className="text-slate-600 text-sm">Setiap orang yang bergabung melalui kode referral Anda akan otomatis menjadi downline Anda.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl">📊</div>
            <div>
              <h4 className="font-bold text-slate-900">Monitor Real-time</h4>
              <p className="text-slate-600 text-sm">Lihat statistik downline dan komisi yang terupdate secara real-time di dashboard ini.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
            <div className="text-2xl">🚀</div>
            <div>
              <h4 className="font-bold text-slate-900">Naik Level, Dapat Bonus</h4>
              <p className="text-slate-600 text-sm">Semakin banyak member yang bergabung, level Anda akan naik dan komisi semakin besar!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
