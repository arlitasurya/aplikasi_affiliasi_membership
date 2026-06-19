import React from 'react';
import { UserRole } from '../types';
import {
  Star,
  Gift,
  Sparkles,
  Users,
  Gamepad2,
  QrCode,
  ArrowRight,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

interface LandingProps {
  onLogin?: () => void;
  onRegister?: () => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onSelectRole?: (role: UserRole) => void;
}

const Landing: React.FC<LandingProps> = ({
  onLogin,
  onRegister,
  onLoginClick,
  onRegisterClick
}) => {
  const handleLogin = onLogin || onLoginClick;
  const handleRegister = onRegister || onRegisterClick;
  return (
    <div className="min-h-screen bg-white text-slate-950">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl  text-white flex items-center justify-center shadow-lg shadow-orange-100">
             <img src="/ngolab-logo.png" alt="NgolabHub" className="h-11 w-11 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-black leading-none">Ngolab Express</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">
                Member & Affiliate
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#fitur" className="hover:text-orange-600">Fitur</a>
            <a href="#keuntungan" className="hover:text-orange-600">Keuntungan</a>
            <a href="#cara-kerja" className="hover:text-orange-600">Cara Kerja</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogin}
              className="hidden sm:inline-flex px-5 py-2.5 rounded-2xl border border-slate-200 text-sm font-bold hover:bg-slate-50"
            >
              Masuk
            </button>
            <button
             onClick={handleRegister}
              className="px-5 py-2.5 rounded-2xl bg-orange-600 text-white text-sm font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 transition"
            >
              Daftar Sekarang
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-orange-600">
            <Star size={14} fill="currentColor" />
            Platform Loyalitas No. 1
          </div>

          <h2 className="mt-7 text-5xl md:text-7xl font-black leading-[0.95] tracking-tight">
            Satu Platform,
            <br />
            <span className="text-orange-600">Beribu</span>
            <br />
            <span className="text-orange-600">Keuntungan.</span>
          </h2>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-500 font-medium">
            Gabung sebagai member untuk mendapatkan reward, AI recommendation,
            QR member, dan peluang menjadi affiliate partner NgolabHub.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
             onClick={handleRegister}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-orange-100 hover:bg-orange-700"
            >
              Mulai Bergabung <ArrowRight size={18} />
            </button>
            <button
             onClick={handleLogin}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-7 py-4 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              Masuk Akun
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative">
          <div className="absolute -inset-6 bg-orange-100/60 blur-3xl rounded-full" />
          <div className="relative rounded-[2.5rem] border-[10px] border-orange-600 overflow-hidden shadow-2xl shadow-orange-100 bg-white">
            <img
              src="/kontainer ngolab.jpeg"
              alt="Ngolab Express"
              className="h-[520px] w-full object-cover"
            />
          </div>

          <div className="absolute left-6 right-6 -bottom-8 rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-100 shadow-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: QrCode, title: 'Scan QR', desc: 'Poin otomatis' },
              { icon: Gift, title: 'Reward', desc: 'Voucher promo' },
              { icon: Users, title: 'Affiliate', desc: 'Komisi referral' },
              { icon: Sparkles, title: 'AI Insight', desc: 'Rekomendasi' },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 items-center">
                <div className="h-10 w-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">{item.title}</p>
                  <p className="text-[11px] text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
            Fitur Unggulan Kami
          </p>
          <h3 className="mt-3 text-3xl md:text-4xl font-black">
            Semua yang Anda Butuhkan, Dalam Satu Platform
          </h3>
          <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
            Dirancang untuk pengalaman membership yang cepat, mudah, dan menguntungkan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              icon: QrCode,
              title: 'QR Member',
              desc: 'Scan QR di kasir, poin langsung tercatat otomatis tanpa kartu fisik.',
            },
            {
              icon: Sparkles,
              title: 'AI Recommendation',
              desc: 'Dapatkan rekomendasi menu dan promo yang sesuai dengan kebiasaan transaksi.',
            },
            {
              icon: Users,
              title: 'Affiliate Partner',
              desc: 'Undang teman, bangun jaringan, dan dapatkan komisi referral.',
            },
            {
              icon: Gamepad2,
              title: 'Gamification',
              desc: 'Main mini-game, selesaikan misi, dan dapatkan bonus poin menarik.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
            >
              <div className="h-14 w-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
                <feature.icon size={28} />
              </div>
              <h4 className="font-black text-lg">{feature.title}</h4>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">{feature.desc}</p>
              <p className="mt-5 text-sm font-black text-orange-600">Selengkapnya →</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}

      {/* Cara Kerja */}
      <section id="cara-kerja" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
            Cara Kerja
          </p>
          <h3 className="mt-3 text-3xl md:text-4xl font-black">
            Mudah, Cepat, dan Menguntungkan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {[
            ['Daftar Member', 'Buat akun dengan cepat.'],
            ['Scan QR', 'Tunjukkan QR di kasir.'],
            ['Kumpulkan Poin', 'Poin tercatat otomatis.'],
            ['Tukar Reward', 'Gunakan poin untuk promo.'],
            ['Upgrade Affiliate', 'Daftar sebagai partner.'],
            ['Dapat Komisi', 'Komisi dari referral aktif.'],
          ].map(([title, desc], index) => (
            <div key={title} className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center font-black text-xl">
                {index + 1}
              </div>
              <h4 className="mt-4 font-black text-sm">{title}</h4>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-orange-600 to-orange-500 text-white grid grid-cols-1 lg:grid-cols-2">
          <div className="p-10 md:p-14">
            <h3 className="text-3xl md:text-4xl font-black leading-tight">
              Mulai perjalanan membership digital Anda bersama NgolabHub
            </h3>
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['AI Recommendation', 'QR Member', 'Reward & Voucher', 'Affiliate Partner', 'Gamification', 'Komisi Referral'].map((item) => (
                <div key={item} className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle size={18} />
                  {item}
                </div>
              ))}
            </div>
            <button
              onClick={handleRegister}
              className="mt-8 rounded-2xl bg-white px-8 py-4 text-sm font-black text-orange-600 hover:bg-orange-50"
            >
              Daftar Sekarang →
            </button>
          </div>

          <div className="relative min-h-[320px]">
            <img
              src="/kontainer ngolab.jpeg"
              alt="Ngolab CTA"
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-orange-600/30" />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-400">
        © 2024 NgolabHub. Hak Cipta Dilindungi Undang-Undang.
      </footer>
    </div>
  );
};

export default Landing;