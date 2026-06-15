//INI FILE DASHBOARD AFFILIATE YANG AKTIF//
import React, { useState, useEffect } from 'react';
import { User, UserRole, Transaction, MemberLevel } from '../../types';
import Card from '../../components/Card';
import { PlayGameCard, MenuRecommendationCard } from '../DashboardCommon';
import { MOCK_MENU, API_BASE_URL } from '../../constants';
import { analyzeAffiliateGrowth, analyzeBusinessInsight } from '../../services/geminiService';
import { getAffiliateNetwork } from '../../services/apiService';

import { 
  Share2, 
  Copy, 
  Users, 
  Wallet, 
  CheckCircle, 
  Lightbulb, 
  Trophy,
  TrendingUp,
  Sparkles,
  Crown,
  Star,
  QrCode,
  Gamepad2,
  History,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

interface AffiliateDashboardProps {
  user: User;
  transactions: Transaction[];
}

const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ user, transactions }) => {
  const [copied, setCopied] = useState(false);
  const [aiStrategy, setAiStrategy] = useState<string>("Menunggu data analitik AI...");
  const [businessInsight, setBusinessInsight] = useState<string>("Menunggu data analitik AI...");
  const [networkStats, setNetworkStats] = useState({ downlines: 0, commission: 0, cashback: 0, level: '' });
  const [aiInsights, setAiInsights] = useState<{ ai_recommendation?: string; favorite_category?: string; peak_visit_time?: string } | null>(null);

  // Fetch AI insights from backend endpoint
  useEffect(() => {
    const fetchAiInsights = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/kiosk/ai-insights/${user.id}`);
        if (response.ok) {
          const result = await response.json();
          const aiData = result?.data || result;
          if (aiData?.ai_recommendation) {
            setAiInsights(aiData);
            setBusinessInsight(aiData.ai_recommendation);
          }
        } else if (response.status === 404) {
          setAiInsights({ ai_recommendation: 'Data belum tersedia' });
          setBusinessInsight('Data belum tersedia');
        }
      } catch (error) {
        // Silent fail - no error in console
      }
    };
    fetchAiInsights();
  }, [user.id]);

  useEffect(() => {
    let isMounted = true;
    const fetchAI = async () => {
      const cacheKey = `ai_insight_${user.id}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        const { strategy, insight } = JSON.parse(cachedData);
        if (isMounted) {
          setAiStrategy(strategy);
          setBusinessInsight(insight);
        }
        return;
      }

      try {
        const strategy = await analyzeAffiliateGrowth(user);
        const insight = await analyzeBusinessInsight(user, transactions);
        
        if (isMounted) {
          setAiStrategy(strategy);
          setBusinessInsight(insight);
          sessionStorage.setItem(cacheKey, JSON.stringify({ strategy, insight }));
        }
      } catch (err) {
        console.error("Affiliate Dashboard AI Error:", err);
      }
    };

    const fetchNetworkStats = async () => {
      try {
        const data = await getAffiliateNetwork(user.id);
        if (isMounted && data) {
          console.log("DATA BACKEND:", data);
          const downlines = data.totalDownlines ?? data.total_referrals ?? data.total_downlines ?? 0;
          const commission = data.totalCommission ?? data.commission_points ?? 0;
          const cashback = data.cashback ?? data.cashback_points ?? 0;
          const level = data.affiliateLevel ?? data.affiliate_tier ?? '';
          
          setNetworkStats({ downlines, commission, cashback, level });
        }
      } catch (err) {
        console.error("Affiliate Network Stats Error:", err);
      }
    };

    if (user.id) {
      fetchAI();
      fetchNetworkStats();
    }

    return () => { isMounted = false; };
  }, [user.id, transactions.length]);

  const handleCopy = () => {
    navigator.clipboard.writeText(user.referralCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join NgolabHub',
        text: `Gabung sekarang sebagai member Ngolab menggunakan kode referral saya: ${user.referralCode}`,
        url: window.location.href,
      });
    }
  };

  // LOGIKA LEVEL DINAMIS NGOLAB HUB (Starter/Pro/Elite)
  const totalDownlines = networkStats.downlines || user.totalDownlines || 0;
  
  const levels = [
    // Level dasar untuk 0-9 member (belum memenuhi syarat minimal komisi)
    { id: 'Basic', name: 'Basic', minMembers: 0, commission: '0%' }, 
    
    // Aturan baru sesuai sistem Ngolab Express
    { id: 'Starter', name: 'Starter', minMembers: 10, commission: '2%' },
    { id: 'Pro', name: 'Pro', minMembers: 20, commission: '5%' },
    { id: 'Elite', name: 'Elite', minMembers: 30, commission: '8%' },
  ];

  // Tentukan Level Saat Ini berdasarkan data dari Database
  const currentAffLevel = networkStats.level || user.affiliateLevel || 'Starter';
  const currentLevelIdx = levels.findIndex(l => l.id === currentAffLevel);
  const currentLevel = levels[currentLevelIdx] || levels[0];
  const nextLevel = currentLevelIdx < levels.length - 1 ? levels[currentLevelIdx + 1] : null;

  // LOGIKA LEVEL MEMBER (GOLD/SILVER/PLATINUM)
  const isGold = user.level === MemberLevel.GOLD;
  const isPlatinum = user.level === MemberLevel.PLATINUM;
  
  const levelConfig = isPlatinum 
    ? {
        cardBg: "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 shadow-purple-100 border-purple-300",
        titleColor: "text-purple-50",
        levelColor: "text-white",
        iconColor: "text-white",
        progressContainer: "bg-white/20 border-white/10",
        progressBar: "bg-white",
        progressText: "text-purple-50"
      }
    : isGold 
    ? {
        cardBg: "bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 shadow-amber-100 border-amber-300",
        titleColor: "text-amber-50",
        levelColor: "text-white",
        iconColor: "text-white",
        progressContainer: "bg-white/20 border-white/10",
        progressBar: "bg-white",
        progressText: "text-amber-50"
      }
    : {
        cardBg: "bg-gradient-to-br from-slate-200 via-slate-50 to-slate-300 shadow-slate-100 border-slate-200",
        titleColor: "text-slate-400",
        levelColor: "text-slate-700",
        iconColor: "text-slate-400",
        progressContainer: "bg-slate-200 border-slate-300/50",
        progressBar: "bg-slate-500",
        progressText: "text-slate-500"
      };

  // Hitung Progres ke Level Berikutnya
  let progressPercent = 0;
  let progressText = "Ayo mulai rekrut member pertama!";
  
  if (nextLevel) {
    progressPercent = Math.min(Math.floor((totalDownlines / nextLevel.minMembers) * 100), 100);
    const missingMembers = Math.max(0, nextLevel.minMembers - totalDownlines);
    progressText = `Butuh ${missingMembers} member lagi untuk level ${nextLevel.name}`;
  } else if (currentLevelIdx === levels.length - 1) {
    progressPercent = 100;
    progressText = "Selamat! Anda telah mencapai Level Elite.";
  }

  // LOGIKA SALDO POIN GABUNGAN
  const overallPoints = (user.totalPoints || 0) + (networkStats.cashback || user.cashbackPoints || 0) + (networkStats.commission || user.commissionPoints || 0);
  // Fallback mock history if no logs from backend yet
  const pointHistory = user.pointLogs && user.pointLogs.length > 0 
    ? user.pointLogs 
    : [
        { id: 'h1', date: new Date().toISOString(), amount: 1500, source: 'Bonus Aktivasi Afiliasi', type: 'IN' as const },
        { id: 'h2', date: new Date().toISOString(), amount: 300, source: 'Komisi Referral: U972SX', type: 'IN' as const },
        { id: 'h3', date: new Date().toISOString(), amount: 250, source: 'Cashback Kopi Susu', type: 'IN' as const },
      ];

  return (
  <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-8 animate-in fade-in duration-300">
    <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-500">
          Affiliate Business Center
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-black text-slate-950">
          Dashboard Afiliasi
        </h1>
        <p className="mt-1 text-slate-500">
          Pantau jaringan referral, komisi, dan performa afiliasi Anda.
        </p>
      </div>

      <div className="inline-flex w-fit items-center rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-xs font-black text-orange-600">
        <QrCode size={17} className="mr-2" />
        QR Member tersedia di Profil Afiliasi
      </div>
    </header>

    {/* Hero */}
    <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      <div className="xl:col-span-3 rounded-[2.5rem] overflow-hidden border border-slate-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="grid grid-cols-1 md:grid-cols-5">
          <div className="md:col-span-3 p-7 md:p-9">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-300">
              Kode Referral Anda
            </p>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-950 break-all">
                {user.referralCode || 'NGOLAB-' + user.id.substring(0, 4).toUpperCase()}
              </h2>

              <button
                onClick={handleCopy}
                className="h-13 w-13 shrink-0 rounded-2xl border border-orange-100 bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-100 transition"
              >
                {copied ? <CheckCircle size={24} /> : <Copy size={24} />}
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Bagikan kode referral ini kepada pelanggan baru untuk membangun jaringan dan memperoleh komisi.
            </p>

            <button
              onClick={handleShare}
              className="mt-7 inline-flex items-center justify-center rounded-2xl bg-orange-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-orange-100 hover:bg-orange-700 transition"
            >
              <Share2 className="mr-3" size={20} />
              Bagikan Kode
            </button>
          </div>

          <div className="md:col-span-2 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 p-7 text-white relative overflow-hidden">
            <Wallet className="absolute -right-10 -bottom-10 h-40 w-40 text-white/10 -rotate-12" />

            <div className="relative z-10 space-y-7">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-100">
                  Total Saldo Poin
                </p>
                <p className="mt-2 text-4xl font-black">
                  {overallPoints.toLocaleString()}
                  <span className="ml-1 text-sm">PTS</span>
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-orange-100/70">
                  Gabungan member & afiliasi
                </p>
              </div>

              <div className="space-y-4 border-t border-white/15 pt-5">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-orange-100">Total Referral</span>
                  <span className="font-black">{totalDownlines} Member</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-orange-100">Poin Komisi</span>
                  <span className="font-black">
                    {(networkStats.commission || user.commissionPoints || 0).toLocaleString()} PTS
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-orange-100">Poin Cashback</span>
                  <span className="font-black">
                    {(networkStats.cashback || user.cashbackPoints || 0).toLocaleString()} PTS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Level Cards */}
     {/* Combined Level Card */}
<div className="xl:col-span-2">
  <div className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm">
    <div className="mb-6 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-500">
          Status Akun
        </p>
        <h3 className="mt-1 text-2xl font-black text-slate-950">
          Member & Affiliate
        </h3>
      </div>

      <div className="h-14 w-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
        <Trophy size={27} />
      </div>
    </div>

    <div className="space-y-7">
      <div>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Level Afiliasi
            </p>
            <p className="mt-1 text-3xl font-black text-slate-950">
              {currentLevel ? currentLevel.name : 'Starter'}
            </p>
          </div>

          <p className="text-3xl font-black text-orange-600">
            {progressPercent}%
          </p>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="mt-2 text-xs font-bold text-slate-500">
          {progressText}
        </p>
      </div>

      <div className="rounded-3xl bg-slate-50 p-5">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Level Member
            </p>
            <p className="mt-1 text-3xl font-black text-slate-800 uppercase">
              {user.level || 'SILVER'}
            </p>
          </div>

          <Crown size={44} fill="currentColor" className="text-slate-300" />
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-3/4 rounded-full bg-slate-500" />
        </div>

        <p className="mt-2 text-[10px] font-black uppercase text-slate-500">
          75% menuju level Gold
        </p>
      </div>
    </div>
  </div>
</div>
</section>

    {/* Game CTA */}
    <section className="rounded-[1.8rem] border border-orange-100 bg-white p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
          <Gamepad2 size={26} />
        </div>
        <div>
          <h3 className="font-black text-slate-900">Kumpulkan Lebih Banyak Ngolab Poin!</h3>
          <p className="text-sm text-slate-500">
            Mainkan mini-game dan dapatkan tambahan poin untuk ditukar dengan makanan.
          </p>
        </div>
      </div>
      <button className="rounded-2xl bg-orange-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-100">
        Main Sekarang 🎮
      </button>
    </section>

    {/* AI Insight */}
    <section className="rounded-[2.2rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-7 shadow-sm relative overflow-hidden">
      <Sparkles className="absolute right-8 top-8 h-28 w-28 text-orange-100" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-orange-600 font-black">
          <Sparkles size={22} />
          <h2>Ngolab AI Business Insight</h2>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-3xl bg-white border border-orange-100 p-5">
            <div className="flex items-center gap-2 text-orange-600 font-black text-sm">
              <Lightbulb size={18} />
              Analisis Performa Referral
            </div>
            <p className="mt-4 text-sm leading-relaxed font-semibold text-slate-700 italic">
             {(aiInsights as any)?.ai_recommendation || (aiInsights as any)?.message || businessInsight}
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-orange-100 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
              Strategi Rekomendasi
            </p>
            <p className="mt-3 text-sm leading-relaxed font-semibold text-slate-600">
              {(aiInsights as any)?.message || aiStrategy}
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Point History */}
    <section>
      <div className="mb-5 flex items-center gap-2">
        <History size={22} className="text-orange-600" />
        <h2 className="text-xl font-black text-slate-900">
          Riwayat Poin Pemasukan
        </h2>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {pointHistory.map((log) => (
            <div key={log.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                  log.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {log.type === 'IN' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                  <p className="font-black text-sm text-slate-900">{log.source}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {new Date(log.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`font-black ${log.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {log.type === 'IN' ? '+' : '-'}{log.amount.toLocaleString()}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300">
                  Ngolab Poin
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Downline Transactions */}
    <section>
      <div className="mb-5 flex items-center gap-2">
        <TrendingUp size={23} className="text-orange-600" />
        <h2 className="text-xl font-black text-slate-900">
          Akumulasi Transaksi Downline
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {MOCK_MENU.map((menu) => (
          <MenuRecommendationCard key={menu.id} menu={menu} />
        ))}
      </div>
    </section>
  </div>
  );
};

export default AffiliateDashboard;