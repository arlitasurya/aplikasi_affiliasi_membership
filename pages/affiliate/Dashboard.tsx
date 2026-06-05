import React, { useState, useEffect } from 'react';
import { User, UserRole, Transaction, MemberLevel } from '../../types';
import Card from '../../components/Card';
import { PlayGameCard, MenuRecommendationCard } from '../DashboardCommon';
import { MOCK_MENU } from '../../constants';
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
  const [aiStrategy, setAiStrategy] = useState<string>("Menganalisis performa jaringan Anda...");
  const [businessInsight, setBusinessInsight] = useState<string>("Menganalisis data jaringan Anda...");
  const [networkStats, setNetworkStats] = useState({ downlines: 0, commission: 0, cashback: 0, level: '' });

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
    { id: 'Starter', name: 'Starter', minMembers: 0, commission: '2%' },
    { id: 'Pro', name: 'Pro', minMembers: 10, commission: '5%' },
    { id: 'Elite', name: 'Elite', minMembers: 30, commission: '10%' },
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
  const overallPoints = (user.totalPoints || 0) + (user.cashbackPoints || 0) + (user.commissionPoints || 0);

  // Fallback mock history if no logs from backend yet
  const pointHistory = user.pointLogs && user.pointLogs.length > 0 
    ? user.pointLogs 
    : [
        { id: 'h1', date: new Date().toISOString(), amount: 1500, source: 'Bonus Aktivasi Afiliasi', type: 'IN' as const },
        { id: 'h2', date: new Date().toISOString(), amount: 300, source: 'Komisi Referral: U972SX', type: 'IN' as const },
        { id: 'h3', date: new Date().toISOString(), amount: 250, source: 'Cashback Kopi Susu', type: 'IN' as const },
      ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Afiliasi</h1>
          <div className="flex items-center space-x-3 mt-1">
            <p className="text-slate-500">Pantau pertumbuhan jaringan dan komisi Anda.</p>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-black rounded-lg uppercase tracking-widest border border-orange-200">
              AFFILIATE PARTNER
            </span>
          </div>
        </div>
        <div className="flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
          <QrCode size={18} className="mr-2" />
          <p className="text-xs font-bold">QR Member untuk kasir ada di <span className="underline">Profil Afiliasi</span></p>
        </div>
      </header>

      {/* Top Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Main Referral Card & CTA */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Main Referral Card (Matching Image) */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden h-fit">
            <div className="grid grid-cols-1 md:grid-cols-10 h-full">
              {/* Left Side: Referral Info */}
              <div className="md:col-span-6 p-8 md:p-10 flex flex-col justify-between space-y-8">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">KODE REFERRAL ANDA</p>
                  <div className="flex items-center space-x-4">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
                      {user.referralCode || 'NGOLAB-' + user.id.substring(0, 4).toUpperCase()}
                    </h2>
                    <button 
                      onClick={handleCopy}
                      className="p-3 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-100 transition-all border border-orange-100 shadow-sm"
                      title="Salin Kode"
                    >
                      {copied ? <CheckCircle size={24} className="text-orange-500" /> : <Copy size={24} />}
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleShare}
                  className="flex items-center justify-center bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all w-full md:w-fit"
                >
                  <Share2 className="mr-3" size={20} /> Bagikan Kode
                </button>
              </div>

              {/* Right Side: Stats (Orange Section) */}
              <div className="md:col-span-4 bg-gradient-to-br from-orange-500 to-orange-600 p-8 md:p-10 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="relative z-10 space-y-8 w-full">
                  <div>
                    <p className="text-orange-100/70 text-[10px] font-black uppercase tracking-[0.2em] mb-2">TOTAL SALDO POIN</p>
                    <p className="text-4xl font-black">{overallPoints.toLocaleString()} <span className="text-sm font-bold opacity-80 uppercase tracking-tighter">PTS</span></p>
                    <p className="text-[10px] font-bold text-orange-100/60 mt-1 uppercase tracking-widest">Gabungan Member & Afiliasi</p>
                  </div>
                  
                  <div className="pt-6 border-t border-white/10 space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users size={14} className="text-orange-200" />
                        <span className="text-[10px] font-bold text-orange-100/80 uppercase">Total Referral</span>
                      </div>
                      <span className="font-black text-sm">{totalDownlines} Member</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star size={14} className="text-orange-200" />
                        <span className="text-[10px] font-bold text-orange-100/80 uppercase">Poin Komisi</span>
                      </div>
                      <span className="font-black text-sm">{(networkStats.commission || user.commissionPoints || 0).toLocaleString()} PTS</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wallet size={14} className="text-orange-200" />
                        <span className="text-[10px] font-bold text-orange-100/80 uppercase">Poin Cashback</span>
                      </div>
                      <span className="font-black text-sm">{(networkStats.cashback || user.cashbackPoints || 0).toLocaleString()} PTS</span>
                    </div>
                  </div>
                </div>
                <Wallet className="absolute -right-8 -bottom-8 text-white/10 w-40 h-40 transform -rotate-12" />
              </div>
            </div>
          </div>

          {/* New CTA Card: Mini-Game Promotion */}
          <div className="bg-gradient-to-r from-orange-50 to-white rounded-3xl p-4 border border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl text-orange-600 shadow-sm group-hover:scale-110 transition-transform">
                <Gamepad2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 leading-tight">Kumpulkan Lebih Banyak Ngolab Poin!</h3>
                <p className="text-xs text-slate-500 leading-tight mt-0.5">
                  Mainkan mini-game seru di ekosistem utama kami dan dapatkan tambahan poin untuk ditukar dengan makanan.
                </p>
              </div>
            </div>
            <button className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 whitespace-nowrap">
              Main Sekarang 🎮
            </button>
          </div>
        </div>

        {/* Right Column: Level Cards Stack */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Affiliate Level Card */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-orange-100 text-orange-600">
                <Trophy size={24} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LEVEL AFILIASI</p>
                <p className="text-xl font-black text-slate-900">{currentLevel ? currentLevel.name : 'Starter'}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">PROGRES LEVEL</p>
                  <p className="text-[10px] font-bold text-slate-500 leading-tight">{progressText}</p>
                </div>
                <p className="text-2xl font-black text-slate-900">{progressPercent}%</p>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Member Level Card */}
          <div className={`rounded-[2rem] p-6 border flex flex-col justify-between relative shadow-sm hover:shadow-md transition-all overflow-hidden group ${levelConfig.cardBg}`}>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.15em] mb-1 ${levelConfig.titleColor}`}>
                  LEVEL MEMBER
                </p>
                <p className={`text-3xl font-black uppercase tracking-wider ${levelConfig.levelColor}`}>
                  {user.level || 'SILVER'}
                </p>
              </div>
              <div className={levelConfig.iconColor}>
                <Crown size={48} fill="currentColor" className="drop-shadow-md" />
              </div>
            </div>
            
            <div className="relative z-10 mt-6">
              {!isGold ? (
                <div className="space-y-2">
                  <div className={`w-full h-2 rounded-full overflow-hidden border ${levelConfig.progressContainer}`}>
                    <div className={`h-full rounded-full transition-all duration-1000 ${levelConfig.progressBar}`} style={{ width: '75%' }}></div>
                  </div>
                  <p className={`text-[10px] font-bold uppercase tracking-tighter ${levelConfig.progressText}`}>
                    75% Menuju Level Gold
                  </p>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {[1, 2, 3].map(i => <Star key={i} size={14} fill="white" className="text-white" />)}
                  <p className="text-[10px] font-bold uppercase tracking-tighter text-white">Level Maksimal Tercapai</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-8">
        {/* AI Business Insight */}
        <section className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-900 font-bold mb-4">
            <Sparkles className="text-orange-600" size={20} />
            <h2 className="text-lg">✨ Ngolab AI Business Insight</h2>
          </div>
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 relative overflow-hidden p-6">
            <div className="relative z-10">
              <div className="flex items-center space-x-2 text-orange-400 font-bold mb-3">
                <Lightbulb size={18} />
                <span className="text-sm">Analisis Performa Referral</span>
              </div>
              <div className="space-y-3">
                <p className="text-slate-200 text-sm leading-relaxed font-medium italic">
                  "{businessInsight}"
                </p>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-orange-400 text-[9px] font-black uppercase tracking-widest mb-1">Strategi Rekomendasi</p>
                  <p className="text-slate-300 text-xs">{aiStrategy}</p>
                </div>
              </div>
            </div>
            <TrendingUp className="absolute -right-6 -bottom-6 text-white/5 w-32 h-32 transform -rotate-12" />
          </Card>
        </section>

        {/* Points History Section */}
        <section>
          <div className="flex items-center mb-6">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600 mr-3">
              <History size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Riwayat Poin Pemasukan (Global)</h2>
          </div>
          
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden text-left">
            <div className="divide-y divide-slate-50">
              {pointHistory.map((log) => (
                <div key={log.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2.5 rounded-xl ${log.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {log.type === 'IN' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{log.source}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black ${log.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {log.type === 'IN' ? '+' : '-'}{log.amount.toLocaleString()}
                    </p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">NGOLAB POIN</p>
                  </div>
                </div>
              ))}
            </div>
            {pointHistory.length === 0 && (
              <div className="p-12 text-center">
                <History size={48} className="mx-auto text-slate-200 mb-3" />
                <p className="text-slate-400 font-medium">Belum ada riwayat poin.</p>
              </div>
            )}
          </div>
        </section>

        {/* Transactions Section */}
        <section className="w-full">
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <TrendingUp className="mr-2 text-orange-600" size={24} />
              Akumulasi Transaksi Downline
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {MOCK_MENU.map(menu => (
              <MenuRecommendationCard key={menu.id} menu={menu} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AffiliateDashboard;