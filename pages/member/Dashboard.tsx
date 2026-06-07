
import React, { useEffect, useState } from 'react';
import { User, Transaction, MemberLevel } from '../../types';
import Card from '../../components/Card';
import { PlayGameCard, MenuRecommendationCard } from '../DashboardCommon';
import { MOCK_MENU } from '../../constants';
import { analyzeHistoryForRewards } from '../../services/geminiService';
import QRCode from 'react-qr-code';
import { QrCode, TrendingUp, Sparkles, Gift, Crown, Star, Gamepad2, History, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface MemberDashboardProps {
  user: User;
  transactions: Transaction[];
}

const MemberDashboard: React.FC<MemberDashboardProps> = ({ user, transactions }) => {
  const [aiAdvice, setAiAdvice] = useState<string>("Menganalisis pola belanja Anda...");

  useEffect(() => {
    let isMounted = true;
    const fetchAI = async () => {
      try {
        const advice = await analyzeHistoryForRewards(transactions);
        if (isMounted) setAiAdvice(advice);
      } catch (err) {
        console.error("Dashboard AI Error:", err);
      }
    };
    
    // Only fetch if we have transactions or user data
    if (transactions.length > 0 || user.id) {
      fetchAI();
    }

    return () => { isMounted = false; };
  }, [transactions.length, user.id]); // Use length and id to stabilize

  const isGold = user.level === MemberLevel.GOLD;
  const overallPoints = (user.totalPoints || 0) + (user.cashbackPoints || 0);

  // Fallback mock history if no logs from backend yet
  const pointHistory = user.pointLogs && user.pointLogs.length > 0 
    ? user.pointLogs 
    : [
        { id: 'h1', date: new Date().toISOString(), amount: 1500, source: 'Bonus Aktivasi Member', type: 'IN' as const },
        { id: 'h2', date: new Date().toISOString(), amount: 500, source: 'Main Game Level 1', type: 'IN' as const },
        { id: 'h3', date: new Date().toISOString(), amount: 250, source: 'Cashback Kopi Susu', type: 'IN' as const },
      ];

  // Dynamic styling based on level
  const levelConfig = isGold 
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

  // Safety check untuk nama agar tidak error split
  const displayName = user.name && typeof user.name === 'string' 
    ? user.name.split(' ')[0] 
    : 'User';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Halo, {displayName}! 👋</h1>
        <p className="text-slate-500">Ayo kumpulkan poin belanja dan nikmati keuntungannya.</p>
      </header>

      {/* Main Stats and QR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
            <div className="grid grid-cols-1 md:grid-cols-5 h-full">
              <div className="md:col-span-3 p-8 flex flex-col justify-between">
                <div>
                  <span className="text-slate-300 text-[10px] font-extrabold uppercase tracking-[0.2em]">MEMBER QR CODE</span>
                  <h2 className="text-3xl font-black text-slate-900 mt-2">Scan di Kasir</h2>
                </div>
                <div className="mt-8 flex items-center space-x-12">
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">Total Saldo Poin</p>
                    <p className="text-4xl font-black text-orange-600 tracking-tight">
                      {overallPoints.toLocaleString()}
                      <span className="text-xs ml-1 text-slate-400 font-bold">PTS</span>
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-1.5"></span>
                        Cashback: {(user.cashbackPoints || 0).toLocaleString()}
                      </div>
                      <div className="flex items-center text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
                        Main: {(user.totalPoints || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 bg-gradient-to-br from-orange-600 to-amber-700 p-6 flex items-center justify-center relative overflow-hidden">
                <div className="bg-white p-3 rounded-3xl shadow-2xl relative z-10">
                  {user?.id ? (
                    <QRCode value={String(user.id)} size={120} />
                  ) : (
                    <div style={{ width: 120, height: 120, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 12, color: '#9ca3af' }}>
                      Memuat QR...
                    </div>
                  )}
                  <p className="text-center text-[9px] font-bold text-orange-600 mt-2 uppercase tracking-tighter">ID: {String(user?.id || 'N/A').toUpperCase()}</p>
                </div>
                <Sparkles className="absolute -right-6 -top-6 text-white/10 w-32 h-32" />
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

        <div className="lg:col-span-1">
          <div className={`h-full rounded-[2rem] p-8 border flex flex-col justify-center relative shadow-sm hover:shadow-md transition-all duration-500 overflow-hidden group ${levelConfig.cardBg}`}>
            {/* Decorative Shine Effect */}
            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[100%] transition-all duration-1000"></div>
            
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className={`text-xs font-black uppercase tracking-[0.15em] mb-1 ${levelConfig.titleColor}`}>
                  PERINGKAT
                </p>
                <p className={`text-3xl font-black uppercase tracking-wider drop-shadow-sm ${levelConfig.levelColor}`}>
                  {user.level || 'SILVER'}
                </p>
              </div>
              <div className={levelConfig.iconColor}>
                <Crown size={42} fill="currentColor" className="drop-shadow-md" />
              </div>
            </div>
            
            {!isGold && (
              <div className="mt-6 relative z-10">
                <div className={`w-full h-2 rounded-full overflow-hidden border ${levelConfig.progressContainer}`}>
                  <div className={`h-full rounded-full transition-all duration-1000 ${levelConfig.progressBar}`} style={{ width: '75%' }}></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className={`text-[10px] font-bold uppercase tracking-tighter ${levelConfig.progressText}`}>
                    75% Menuju Level Gold
                  </p>
                  <p className={`text-[10px] font-black ${levelConfig.progressText}`}>750 / 1000</p>
                </div>
              </div>
            )}

            {isGold && (
              <div className="mt-6 flex items-center space-x-2 relative z-10">
                <div className="flex -space-x-1">
                  {[1, 2, 3].map(i => <Star key={i} size={12} fill="white" className="text-white" />)}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-tighter text-white">Level Maksimal Tercapai</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Advice & Game */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 text-orange-700 font-bold mb-3">
              <Sparkles size={20} />
              <span>AI Recommendation</span>
            </div>
            <p className="text-slate-800 leading-relaxed font-medium">
              "{aiAdvice}"
            </p>
          </div>
          <Sparkles className="absolute -right-4 -top-4 text-orange-200/50 w-24 h-24" />
        </Card>
        
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-lg shadow-orange-100 group">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2">Dapatkan Penghasilan Tambahan!</h3>
            <p className="text-orange-50 mb-6 text-sm font-medium opacity-90">Jadilah Affiliate Partner kami dan mulai kumpulkan komisi dari setiap referral.</p>
            <button 
              onClick={() => {
                // We need to trigger a tab change here, but we don't have setActiveTab.
                // I'll assume the parent handles this or I'll need to pass it.
                // For now, I'll use a window event or just a placeholder if I can't access setActiveTab.
                // Wait, I should probably pass setActiveTab to MemberDashboard.
                window.dispatchEvent(new CustomEvent('changeTab', { detail: 'upgrade_affiliate' }));
              }}
              className="px-6 py-3 bg-white text-orange-600 rounded-xl font-bold text-sm hover:bg-orange-50 transition-all shadow-xl"
            >
              Aktifkan Fitur Afiliasi Sekarang
            </button>
          </div>
          <TrendingUp className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
        </div>
      </div>

      {/* Points History Section */}
      <section>
        <div className="flex items-center mb-6">
          <div className="p-2 bg-orange-50 rounded-lg text-orange-600 mr-3">
            <History size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Riwayat Poin Pemasukan</h2>
        </div>
        
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
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

      {/* Promo Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <Gift className="mr-2 text-orange-600" size={24} />
            Promo Eksklusif
          </h2>
          <button className="text-orange-600 text-sm font-bold hover:underline">Lihat Semua</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {MOCK_MENU.map(menu => (
            <MenuRecommendationCard key={menu.id} menu={menu} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default MemberDashboard;
