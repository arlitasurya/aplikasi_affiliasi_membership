import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { ArrowLeft, Star, Mail, Lock, ArrowRight, Sparkles, QrCode, Gift } from 'lucide-react';
import { API_BASE_URL } from '../constants';

interface LoginProps {
  onBack: () => void;
  onSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const body = {
        email,
        username: email,
        password,
      };

      const response = await fetch(`${API_BASE_URL}/api/membership/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data && result.data.user) {
        const src = result.data.user;
        const user: User = {
          ...src,
          id: src.user_id || src.id,
          role: src.role || UserRole.MEMBER,
          totalPoints: result.data.points?.total_points || src.total_points || 0,
          cashbackPoints: result.data.points?.cashback_points || src.cashback_points || 0,
          commissionPoints: result.data.points?.commission_points || src.commission_points || 0,
          referralCode: result.data.affiliate_network?.referral_code || src.referral_code || '',
        };

        const token = result.data.token || result.data.accessToken;
        if (token) {
          localStorage.setItem('jwtToken', token);
        }

        onSuccess(user);
      } else {
        setError(result.message || 'Email tidak terdaftar atau password salah.');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal terhubung ke server. Pastikan backend pusat berjalan.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    'w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:ring-4 focus:ring-orange-50 focus:border-orange-500 outline-none transition-all text-slate-900 font-bold placeholder:text-slate-300';

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Branding */}
      <section className="hidden lg:flex lg:w-[58%] relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.18),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(251,191,36,0.22),transparent_32%)]" />
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />

        <div className="relative z-10 flex min-h-screen w-full flex-col justify-between p-12 xl:p-16">
          <button
            onClick={onBack}
            className="w-fit inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-slate-500 shadow-sm border border-slate-100 hover:text-orange-600 transition"
          >
            <ArrowLeft size={18} />
            Kembali
          </button>

          <div className="max-w-2xl">
            <div className="mb-10 flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-xl shadow-orange-100">
                <Star fill="currentColor" size={30} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-orange-600">NgolabHub</h2>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Membership & Affiliate
                </p>
              </div>
            </div>

            <h1 className="text-6xl xl:text-7xl font-black leading-[0.95] tracking-tight text-slate-950">
              SCAN.
              <br />
              COLLECT.
              <br />
              <span className="text-orange-600">EARN.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-500 font-medium">
              Satu akun untuk mengumpulkan poin, menikmati reward, dan membangun
              jaringan afiliasi Ngolab Express berbasis layanan AI.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-xl">
              <div className="rounded-3xl bg-white/80 border border-slate-100 p-5 shadow-sm">
                <QrCode className="mb-4 text-orange-600" size={26} />
                <p className="text-sm font-black text-slate-900">QR Member</p>
                <p className="mt-1 text-xs text-slate-500">Scan di kasir</p>
              </div>

              <div className="rounded-3xl bg-white/80 border border-slate-100 p-5 shadow-sm">
                <Gift className="mb-4 text-orange-600" size={26} />
                <p className="text-sm font-black text-slate-900">Reward</p>
                <p className="mt-1 text-xs text-slate-500">Tukar poin</p>
              </div>

              <div className="rounded-3xl bg-white/80 border border-slate-100 p-5 shadow-sm">
                <Sparkles className="mb-4 text-orange-600" size={26} />
                <p className="text-sm font-black text-slate-900">AI Insight</p>
                <p className="mt-1 text-xs text-slate-500">Rekomendasi</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-orange-100 bg-white/75 p-6 shadow-sm backdrop-blur max-w-2xl">
            <p className="text-xl font-semibold italic text-slate-700">
              “Belanja lebih praktis, poin lebih terarah, dan peluang afiliasi lebih mudah dipantau.”
            </p>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.22em] text-orange-500">
              NgolabHub Ecosystem
            </p>
          </div>
        </div>
      </section>

      {/* Right Login Form */}
      <section className="flex min-h-screen flex-1 items-center justify-center bg-white px-6 py-10">
        <div className="w-full max-w-md">
          <button
            onClick={onBack}
            className="mb-8 inline-flex lg:hidden items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors font-semibold"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>

          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-100">
              <Star fill="currentColor" size={26} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-orange-600">NgolabHub</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Membership & Affiliate
              </p>
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-slate-100 bg-white p-8 md:p-10 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
            <div className="text-center mb-9">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 text-white rounded-2xl mb-5 shadow-xl shadow-orange-100">
                <Star fill="currentColor" size={32} />
              </div>
              <h1 className="text-3xl font-black text-slate-950">
                Selamat Datang
              </h1>
              <p className="text-slate-500 mt-2">
                Masuk untuk mengakses akun NgolabHub Anda.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100 animate-in fade-in zoom-in">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    size={18}
                  />
                  <input
                    required
                    type="email"
                    placeholder="name@email.com"
                    className={inputClasses}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    size={18}
                  />
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className={inputClasses}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                disabled={isLoading}
                className="group w-full bg-orange-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-orange-100 hover:bg-orange-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {isLoading ? 'Memverifikasi...' : 'Masuk Sekarang'}
                  {!isLoading && (
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}
                </span>
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              Belum memiliki akun?{' '}
              <span className="font-black text-orange-600">
                Daftar melalui halaman registrasi
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;