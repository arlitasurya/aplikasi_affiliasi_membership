import React, { useState, useRef, useCallback } from 'react';
import { UserRole, User } from '../types';
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  Camera,
  RefreshCw,
  Star,
  Mail,
  Lock,
  User as UserIcon,
  Hash,
  Gift,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { API_BASE_URL } from '../constants';
import Webcam from 'react-webcam';

interface RegisterProps {
  role: UserRole;
  onBack: () => void;
  onSuccess: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ role, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    nim: '',
    email: '',
    password: '',
    referralCode: sessionStorage.getItem('referralCodeFromURL') || '',
  });
  const [ktmFile, setKtmFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCamera, setUseCamera] = useState(false);

  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setKtmFile(imageSrc);
      setFileName('KTM_Captured.jpg');
      setUseCamera(false);
    }
  }, [webcamRef]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000000) {
        setError('Ukuran foto maksimal 2MB agar dapat diproses.');
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setKtmFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setError('Semua field wajib diisi.');
      return;
    }

    if (role === UserRole.MEMBER_AFFILIATE && !ktmFile) {
      setError('Silakan unggah atau ambil foto KTM terlebih dahulu untuk mendaftar sebagai Afiliasi.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const body = {
        username: formData.name,
        name: formData.name,
        full_name: formData.name,
        nim: formData.nim,
        NIM: formData.nim,
        student_id: formData.nim,
        email: formData.email,
        password: formData.password,
        ...(formData.referralCode && { referral_code: formData.referralCode }),
      };

      const response = await fetch(`${API_BASE_URL}/api/membership/register`, {
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

      if (result.success && result.data) {
        const payload = result.data;
        const src = payload.user || payload;
        const user: User = {
          ...src,
          id: src.user_id || src.id,
          name: src.name || src.username || src.full_name || formData.name,
          nim: src.nim || src.NIM || src.student_id || formData.nim,
          role: src.role || UserRole.MEMBER,
          totalPoints: src.total_points || 0,
          cashbackPoints: src.cashback_points || 0,
          commissionPoints: src.commission_points || 0,
          referralCode: payload.referral_code || src.referral_code || '',
        };

        const token = result.data.token || result.data.accessToken;
        if (token) {
          localStorage.setItem('jwtToken', token);
        }

        onSuccess(user);
      } else {
        setError(result.message || 'Gagal mendaftar. Silakan coba lagi.');
      }
    } catch (err) {
      console.error('Registration failed:', err);
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
    'w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:ring-4 focus:ring-orange-50 focus:border-orange-500 outline-none transition-all placeholder:text-slate-300 text-slate-900 font-bold';

  return (
    <div className="min-h-screen bg-white flex">
      <section className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.18),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(251,191,36,0.22),transparent_32%)]" />
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
              JOIN.
              <br />
              SCAN.
              <br />
              <span className="text-orange-600">GROW.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-500 font-medium">
              Buat akun membership untuk mengumpulkan poin, menikmati promo, dan membuka peluang menjadi affiliate partner NgolabHub.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-xl">
              <div className="rounded-3xl bg-white/80 border border-slate-100 p-5 shadow-sm">
                <Gift className="mb-4 text-orange-600" size={26} />
                <p className="text-sm font-black text-slate-900">Reward</p>
                <p className="mt-1 text-xs text-slate-500">Promo member</p>
              </div>
              <div className="rounded-3xl bg-white/80 border border-slate-100 p-5 shadow-sm">
                <Sparkles className="mb-4 text-orange-600" size={26} />
                <p className="text-sm font-black text-slate-900">AI Insight</p>
                <p className="mt-1 text-xs text-slate-500">Rekomendasi</p>
              </div>
              <div className="rounded-3xl bg-white/80 border border-slate-100 p-5 shadow-sm">
                <CheckCircle className="mb-4 text-orange-600" size={26} />
                <p className="text-sm font-black text-slate-900">Affiliate</p>
                <p className="mt-1 text-xs text-slate-500">Komisi referral</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-orange-100 bg-white/75 p-6 shadow-sm backdrop-blur max-w-2xl">
            <p className="text-xl font-semibold italic text-slate-700">
              “Mulai dari membership digital, lanjutkan dengan peluang referral dan reward.”
            </p>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.22em] text-orange-500">
              NgolabHub Ecosystem
            </p>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen flex-1 items-center justify-center bg-white px-6 py-10">
        <div className="w-full max-w-lg">
          <button
            onClick={onBack}
            className="mb-8 inline-flex lg:hidden items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors font-semibold"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>

          <div className="rounded-[2.2rem] border border-slate-100 bg-white p-8 md:p-10 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
            <div className="mb-8">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-xl shadow-orange-100">
                <Star fill="currentColor" size={28} />
              </div>
              <h1 className="text-3xl font-black text-slate-950">
                Daftar Membership
              </h1>
              <p className="mt-2 text-slate-500">
                Lengkapi data Anda untuk mulai bergabung.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Nama Lengkap</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    required
                    className={inputClasses}
                    placeholder="Budi Santoso"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">NIM</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    required
                    inputMode="numeric"
                    className={inputClasses}
                    placeholder="1301201234"
                    value={formData.nim}
                    onChange={(e) =>
                      setFormData({ ...formData, nim: e.target.value.replace(/[^0-9]/g, '') })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Email Aktif</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    required
                    type="email"
                    className={inputClasses}
                    placeholder="budi@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    required
                    type="password"
                    className={inputClasses}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {role === UserRole.MEMBER_AFFILIATE && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-slate-700 ml-1">
                      Unggah KTM
                    </label>
                    {!useCamera && !ktmFile && (
                      <button
                        type="button"
                        onClick={() => setUseCamera(true)}
                        className="inline-flex items-center text-xs font-black text-orange-600 hover:text-orange-700"
                      >
                        <Camera size={14} className="mr-1" />
                        Ambil Foto
                      </button>
                    )}
                  </div>

                  {useCamera ? (
                    <div className="space-y-4">
                      <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-video">
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setUseCamera(false)}
                          className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40"
                        >
                          <RefreshCw size={20} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={capture}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center hover:bg-slate-800 transition-all"
                      >
                        <div className="w-4 h-4 bg-rose-500 rounded-full mr-2 animate-pulse" />
                        Capture Now
                      </button>
                    </div>
                  ) : ktmFile ? (
                    <div className="relative group">
                      <img
                        src={ktmFile}
                        className="w-full h-48 object-cover rounded-3xl border-2 border-orange-100"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setKtmFile(null);
                            setFileName(null);
                          }}
                          className="px-4 py-2 bg-white rounded-xl text-slate-900 font-bold text-xs"
                        >
                          Ganti Foto
                        </button>
                      </div>
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                        <CheckCircle size={16} />
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-orange-100 bg-orange-50/40 rounded-[2rem] cursor-pointer hover:bg-orange-50 transition-all group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                          <Upload className="text-orange-500" size={23} />
                        </div>
                        <p className="mb-1 text-sm text-slate-600 font-bold">
                          Tarik & Lepas foto KTM
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                          Atau klik untuk pilih file max 2MB
                        </p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">
                  Kode Referral <span className="text-slate-400">(Opsional)</span>
                </label>
                <div className="relative">
                  <Gift className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    className={inputClasses}
                    placeholder="Masukkan kode unik pengajak"
                    value={formData.referralCode}
                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                  />
                </div>
              </div>

              <button
                disabled={isLoading}
                className="group w-full mt-2 bg-orange-600 text-white py-4 rounded-2xl font-black text-base shadow-xl shadow-orange-100 hover:bg-orange-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
                  {!isLoading && (
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;