import React, { useEffect, useState } from 'react';
import { User, Transaction, MemberLevel } from '../../types';
import { MenuRecommendationCard } from '../DashboardCommon';
import { API_BASE_URL } from '../../constants';
import QRCode from 'react-qr-code';
import {
  TrendingUp,
  Sparkles,
  Gift,
  Crown,
  Star,
  Gamepad2,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface MemberDashboardProps {
  user: User;
  transactions: Transaction[];
}

const MemberDashboard: React.FC<MemberDashboardProps> = ({ user }) => {
  const [aiAdvice, setAiAdvice] = useState<string>('Menganalisis pola belanja Anda...');
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAIInsight = async () => {
      try {
        if (!user?.id) return;

        const response = await fetch(`${API_BASE_URL}/api/kiosk/ai-insights/${user.id}`);
        const result = await response.json();

        console.log('AI INSIGHT MEMBER:', result);

        if (isMounted && result?.data?.ai_recommendation) {
          setAiAdvice(result.data.ai_recommendation);
        }
      } catch (err) {
        console.error('Dashboard AI Member Error:', err);
        if (isMounted) {
          setAiAdvice('Menunggu data analitik AI...');
        }
      }
    };

    fetchAIInsight();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);
useEffect(() => {
  const fetchRecommendedProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/membership/recommended-products`);
      const result = await response.json();

      if (result?.success) {
        setRecommendedProducts(result.data || []);
      }
    } catch (error) {
      console.error('Gagal mengambil rekomendasi produk:', error);
    }
  };

  fetchRecommendedProducts();
}, []);

  const isGold = user.level === MemberLevel.GOLD;
  const overallPoints = (user.totalPoints || 0) + (user.cashbackPoints || 0);

  const displayName =
    user.name && typeof user.name === 'string' ? user.name.split(' ')[0] : 'User';

 const pointHistory = user.pointLogs && user.pointLogs.length > 0
  ? user.pointLogs
  : [];
  const levelName = user.level || 'SILVER';

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8 lg:px-10 animate-in fade-in duration-300">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">
              Halo, {displayName}! 👋
            </h1>
            <p className="mt-1 text-sm md:text-base text-slate-500">
              Ayo kumpulkan poin belanja dan nikmati keuntungannya.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button className="relative h-11 w-11 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 transition">
              <Bell size={20} />
              <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-orange-600" />
            </button>

            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-100 flex items-center justify-center text-xl shadow-sm">
              👤
            </div>
          </div>
        </header>

        {/* Top Section */}
        <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* QR Card */}
          <div className="xl:col-span-3 rounded-[2rem] border border-slate-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-[280px]">
              <div className="md:col-span-3 p-7 md:p-9 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-300">
                    Member QR Code
                  </p>
                  <h2 className="mt-3 text-3xl md:text-4xl font-black text-slate-950">
                    Scan di Kasir
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Tunjukkan QR code ini saat pembayaran.
                  </p>
                </div>

                <div className="mt-8 rounded-3xl border border-slate-100 bg-slate-50/60 p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Total Saldo Poin
                  </p>

                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-5xl font-black text-orange-600 leading-none">
                      {overallPoints.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-slate-400 mb-1">PTS</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 border border-slate-100">
                      <span className="h-2 w-2 rounded-full bg-orange-500" />
                      Cashback: {(user.cashbackPoints || 0).toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 border border-slate-100">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      Gemifikasi: {(user.totalPoints || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-7 flex items-center justify-center relative overflow-hidden">
                <Sparkles className="absolute -right-8 -top-8 h-36 w-36 text-white/10" />
                <Sparkles className="absolute -left-10 bottom-4 h-28 w-28 text-white/10" />

                <div className="relative z-10 rounded-[1.7rem] bg-white p-4 shadow-2xl">
                  {user?.id ? (

                   <button
  type="button"
  onClick={() => setShowQrModal(true)}
  className="bg-white p-4 rounded-3xl shadow-xl hover:scale-105 transition"
>
  <QRCode value={String(user.id)} size={150} />
</button>
                  ) : (
                    <div className="h-[135px] w-[135px] rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                      Memuat QR...
                    </div>
                  )}
                  <p className="mt-3 text-center text-[9px] font-black text-orange-600 uppercase tracking-tighter">
                    ID: {String(user?.id || 'N/A').toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Level Card */}
          <div className="xl:col-span-2 rounded-[2rem] border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-[0_18px_50px_rgba(15,23,42,0.06)] p-7 md:p-8 relative overflow-hidden">
            <Crown className="absolute right-8 top-8 h-14 w-14 text-slate-300" fill="currentColor" />

            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
              Peringkat Member
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 uppercase tracking-wide">
              {levelName}
            </h2>

            <div className="mt-7">
              <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isGold
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                      : 'bg-gradient-to-r from-orange-500 to-amber-400'
                  }`}
                  style={{ width: isGold ? '100%' : '75%' }}
                />
              </div>

              <div className="mt-3 flex justify-between text-xs font-bold text-slate-500">
                <span>{isGold ? 'Level maksimal tercapai' : '750 poin menuju level GOLD'}</span>
                <span>{isGold ? 'MAX' : '750 / 1000'}</span>
              </div>
            </div>

            <div className="mt-7 rounded-3xl border border-orange-100 bg-orange-50/60 p-5">
              <div className="flex gap-3">
                <div className="h-11 w-11 rounded-2xl bg-white flex items-center justify-center text-orange-600 shadow-sm">
                  <Gift size={22} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">Keuntungan {levelName}</h3>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      Bonus poin transaksi
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      Rekomendasi Menu
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      Cashback spesial
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {isGold && (
              <div className="mt-5 flex items-center gap-1 text-amber-500">
                {[1, 2, 3].map((i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Game CTA */}
        <section className="rounded-[1.7rem] border border-orange-100 bg-white shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
              <Gamepad2 size={26} />
            </div>
            <div>
              <h3 className="font-black text-slate-900">
                Kumpulkan Lebih Banyak Ngolab Poin!
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-2xl">
                Mainkan mini-game seru di ekosistem utama kami dan dapatkan tambahan poin
                untuk ditukar dengan makanan.
              </p>
            </div>
          </div>

          <button className="rounded-2xl bg-orange-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-100 hover:bg-orange-700 transition">
            Main Sekarang 🎮
          </button>
        </section>

        {/* AI + Point History */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-7 shadow-sm relative overflow-hidden min-h-[230px]">
            <div className="relative z-10 max-w-md">
              <div className="flex items-center gap-2 text-orange-600 font-black">
                <Sparkles size={22} />
                <span>AI Recommendation</span>
              </div>

              <p className="mt-6 text-base leading-relaxed font-semibold text-slate-800">
                "{aiAdvice}"
              </p>
            </div>

            <Sparkles
  className="absolute right-8 top-8 text-orange-200 opacity-50"
  size={70}
/>

            <Sparkles className="absolute right-4 top-4 h-24 w-24 text-orange-200/50" />
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={21} className="text-orange-600" />
                <h2 className="text-lg font-black text-slate-900">
                  Riwayat Poin Pemasukan
                </h2>
              </div>

              <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-history'))}
              className="hidden sm:inline-flex items-center gap-1 text-sm font-black text-orange-600 hover:underline"
            >
              Lihat Semua <ArrowRight size={16} />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {pointHistory
              .filter((log) => log.type === 'IN')
              .slice(0, 3)
              .map((log) => (
                <div
                  key={log.id}
                  className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 rounded-2xl px-2 transition"
    >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                        log.type === 'IN'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {log.type === 'IN' ? (
                        <ArrowDownLeft size={20} />
                      ) : (
                        <ArrowUpRight size={20} />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-900">{log.source}</p>
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
                    <p
                      className={`text-base font-black ${
                        log.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {log.type === 'IN' ? '+' : '-'}
                      {log.amount.toLocaleString()}
                    </p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-300">
                      Poin
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {pointHistory.length === 0 && (
              <div className="py-12 text-center">
                <History size={42} className="mx-auto mb-3 text-slate-200" />
                <p className="font-medium text-slate-400">Belum ada riwayat poin.</p>
              </div>
            )}
          </div>
        </section>

        {/* Affiliate CTA */}
        <section className="rounded-[2rem] bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-7 md:p-8 text-white shadow-xl shadow-orange-100 relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <h3 className="text-2xl md:text-3xl font-black">
                Dapatkan Penghasilan Tambahan!
              </h3>
              <p className="mt-2 max-w-2xl text-sm md:text-base text-orange-50 font-medium">
                Jadilah Affiliate Partner kami dan mulai kumpulkan komisi dari setiap referral.
              </p>
            </div>

            <button
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('changeTab', { detail: 'upgrade_affiliate' })
                );
              }}
              className="rounded-2xl bg-white px-6 py-3 text-sm font-black text-orange-600 shadow-xl hover:bg-orange-50 transition"
            >
              Aktifkan Fitur Afiliasi Sekarang
            </button>
          </div>

          <TrendingUp className="absolute -right-8 -bottom-8 h-40 w-40 text-white/10 -rotate-12" />
        </section>

        {/* Promo Section */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-900">
              <Gift className="text-orange-600" size={24} />
              Promo Eksklusif
            </h2>

            <button className="inline-flex items-center gap-1 text-sm font-black text-orange-600 hover:underline">
              Lihat Semua Promo <ArrowRight size={16} />
            </button>
          </div>

         <div
  className="flex gap-6 overflow-x-auto pb-4"
  style={{
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  }}
  onWheel={(e) => {
    e.currentTarget.scrollLeft += e.deltaY;
  }}
>
  {recommendedProducts.map((menu) => (
    <div
      key={menu.id}
      className="min-w-[320px] max-w-[320px] flex-shrink-0"
    >
      <MenuRecommendationCard menu={menu} />
    </div>
  ))}
</div>
        </section>

       <footer className="border-t border-slate-200 bg-transparent">
  <div className="max-w-7xl mx-auto px-6 py-14">
    <div className="grid grid-cols-2 md:grid-cols-5 gap-10 text-sm">
      <div>
        <h4 className="font-black text-slate-900 mb-4">NgolabHub</h4>
        <ul className="space-y-3 text-slate-500">
          <li>Membership</li>
          <li>Affiliate Program</li>
          <li>Reward Center</li>
          <li>AI Insight</li>
        </ul>
      </div>

      <div>
        <h4 className="font-black text-slate-900 mb-4">Platform</h4>
        <ul className="space-y-3 text-slate-500">
          <li>QR Member</li>
          <li>Dashboard Member</li>
          <li>Dashboard Affiliate</li>
          <li>Riwayat Transaksi</li>
        </ul>
      </div>

      <div>
        <h4 className="font-black text-slate-900 mb-4">Solusi</h4>
        <ul className="space-y-3 text-slate-500">
          <li>Loyalty Digital</li>
          <li>Referral Commission</li>
          <li>Voucher & Promo</li>
          <li>Gamification</li>
        </ul>
      </div>

      <div>
        <h4 className="font-black text-slate-900 mb-4">Ekosistem</h4>
        <ul className="space-y-3 text-slate-500">
          <li>Ngolab Express</li>
          <li>Bakso Mas Yanto</li>
          <li>Kasir Kiosk</li>
          <li>Gamification App</li>
        </ul>
      </div>

      <div>
        <h4 className="font-black text-slate-900 mb-4">Informasi</h4>
        <ul className="space-y-3 text-slate-500">
          <li>Tentang Kami</li>
          <li>Kontak</li>
          <li>Bantuan</li>
          <li>Keamanan Data</li>
        </ul>
      </div>
    </div>

    <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
      <p>© 2026 Ngolab Express. Member & Affiliate.</p>
      <div className="flex items-center gap-6">
        <span>Terms of Use</span>
        <span>Privacy Policy</span>
      </div>
    </div>
  </div>
</footer>
      </div>
      {showQrModal && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    onClick={() => setShowQrModal(false)}
  >
    <div
      className="bg-white rounded-[2rem] p-8 shadow-2xl max-w-md w-full text-center"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
        Member QR Code
      </p>

      <h2 className="mt-2 text-2xl font-black text-slate-900">
        Scan di Kasir
      </h2>

      <div className="mt-6 flex justify-center">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-lg">
          <QRCode value={String(user.id)} size={280} />
        </div>
      </div>

      <p className="mt-4 text-xs font-black text-orange-600 break-all">
        ID: {String(user.id)}
      </p>

      <button
        onClick={() => setShowQrModal(false)}
        className="mt-6 w-full py-3 rounded-2xl bg-orange-600 text-white font-black hover:bg-orange-700 transition"
      >
        Tutup
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default MemberDashboard;