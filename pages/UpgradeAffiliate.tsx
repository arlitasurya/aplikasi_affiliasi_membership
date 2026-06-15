
import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, CheckCircle, AlertCircle, Sparkles, ArrowLeft, Upload } from 'lucide-react';
import { User, UserRole } from '../types';
import { verifyAffiliateKtm } from '../services/apiService';
import { API_BASE_URL } from '../constants';

interface UpgradeAffiliateProps {
  user: User;
  onBack: () => void;
  onSuccess: (updatedUser: User) => void;
}

const UpgradeAffiliate: React.FC<UpgradeAffiliateProps> = ({ user, onBack, onSuccess }) => {
  const [step, setStep] = useState<'INTRO' | 'SCANNING' | 'PREVIEW'>('INTRO');
  const [ktmImage, setKtmImage] = useState<string | null>(null);
  const [ktmFile, setKtmFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizeNim = (value?: string | null): string => String(value || '').replace(/\D/g, '');

  const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setKtmImage(imageSrc);
      void dataUrlToFile(imageSrc, `ktm-${user.id || 'upload'}.jpg`).then(setKtmFile).catch(() => setKtmFile(null));
      setStep('PREVIEW');
      void handleUpgrade(imageSrc);
    }
  }, [webcamRef]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setKtmImage(imageData);
        setKtmFile(file);
        setStep('PREVIEW');
        void handleUpgrade(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpgrade = async (imageData: string) => {
    if (!imageData) return;

    setIsVerifying(true);
    setVerificationStatus('📤 Mengunggah KTM ke server...');
    setError(null);

    try {
      const fileToUpload = ktmFile || await dataUrlToFile(imageData, `ktm-${user.id || 'upload'}.jpg`);
      
      console.log('📸 Starting KTM verification upload...');
      console.log(`📤 Uploading to backend: user_id=${user.id}`);
      
      // Backend akan lakukan OCR dan return status + OCR data
      const result = await verifyAffiliateKtm(user.id, fileToUpload);

      console.log('✅ KYC Verification Response:', result);

      if (!result.success) {
        setError('KYC server tidak merespon dengan baik. Silakan coba lagi.');
        setVerificationStatus(null);
        setIsVerifying(false);
        return;
      }

      const verification = result.data?.verification || {};
      const ocrData = result.data?.ocr || {};
      const status = result.status || verification.status || 'PENDING';
      
      console.log('📋 Verification Response:', { status, verification, ocr: ocrData });

      // Extract OCR details from response
      const detectedNim = ocrData.detectedNim || null;
      const confidence = (ocrData.avgConfidence || 0) * 100;
      const isTelkom = ocrData.isTelkom || false;

      console.log(`📊 OCR Result: NIM=${detectedNim}, Telkom=${isTelkom}, Confidence=${confidence.toFixed(1)}%, Status=${status}`);

      // Accept only if backend says APPROVED
      const shouldAcceptAsAffiliate = status === 'APPROVED';

      if (shouldAcceptAsAffiliate) {
        // APPROVED by backend
        const acceptedUser: User = {
          ...user,
          role: UserRole.MEMBER_AFFILIATE,
          referralCode: user.referralCode || `REF_${user.id?.slice(-6) || 'UNKNOWN'}`
        };

        console.log('✨ Approved as Affiliate:', acceptedUser);

        setVerificationStatus(
          `✅ Verifikasi Berhasil!\n` +
          `NIM Terdeteksi: ${detectedNim}\n` +
          `Confidence: ${confidence.toFixed(1)}%\n` +
          `✨ Diaktifkan sebagai MEMBER_AFFILIATE`
        );

        setTimeout(() => {
          // Call parent with upgraded user (role = MEMBER_AFFILIATE)
          onSuccess(acceptedUser);
          // Also sync role update with backend (non-blocking)
        }, 1500);
      } else {
        // PENDING or REJECTED by backendS
        let statusMessage = '';
        
        if (status === 'PENDING') {
          statusMessage = `⏳ Verifikasi Tertunda\n\n` +
                          `Gambar kurang jelas atau confidence rendah.\n` +
                          `Coba ambil foto KTM yang lebih fokus:\n\n` +
                          `💡 Tips:\n` +
                          `• Pastikan kartu terlihat jelas tanpa blur\n` +
                          `• Pencahayaan cukup terang\n` +
                          `• Kartu mengisi seluruh frame\n` +
                          `• Tidak ada bayangan atau refleksi\n\n` +
                          `Confidence: ${confidence.toFixed(1)}%`;
        } else {
          // REJECTED
          statusMessage = `❌ Verifikasi Gagal\n\n`;
          if (!isTelkom) {
            statusMessage += `Kartu bukan dari Telkom University\n`;
          }
          if (!detectedNim) {
            statusMessage += `NIM tidak terdeteksi di kartu\n`;
          }
          statusMessage += `\nConfidence: ${confidence.toFixed(1)}%`;
        }

        setVerificationStatus(statusMessage);

        setTimeout(() => {
          onBack();
        }, status === 'PENDING' ? 4000 : 3000);
      }

      // Helper function to update backend role asynchronously
      // Uses correct endpoint: PATCH /api/membership/admin/users/{id}/role with {role: ...}
      async function updateBackendRoleAsync(userId: string) {
        try {
          console.log('📡 Syncing role update with backend...');
          const response = await fetch(`${API_BASE_URL}/api/membership/admin/users/${encodeURIComponent(userId)}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'MEMBER_AFFILIATE' })
          });
          
          if (response.ok) {
            console.log('✅ Backend role update successful');
          } else {
            const errorText = await response.text();
            console.warn('⚠️ Backend role update returned:', response.status, errorText);
          }
        } catch (err) {
          console.warn('⚠️ Backend role update failed (non-critical):', err instanceof Error ? err.message : 'Unknown error');
          // Non-critical - user is already updated in frontend
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan koneksi. Silakan coba lagi.";
      console.error('❌ OCR Error:', errorMessage);
      setError(errorMessage);
      setVerificationStatus(null);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
  <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <header className="mb-8 flex items-center gap-4">
      <button
        onClick={step === 'INTRO' ? onBack : () => setStep('INTRO')}
        className="h-11 w-11 rounded-2xl border border-slate-100 bg-white text-slate-600 shadow-sm flex items-center justify-center hover:bg-slate-50 transition"
      >
        <ArrowLeft size={22} />
      </button>

      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-500">
          Affiliate Partner
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
          Upgrade ke Afiliasi
        </h1>
        <p className="mt-1 text-sm md:text-base text-slate-500">
          {step === 'INTRO'
            ? 'Bangun jaringan bisnis Anda bersama NgolabHub.'
            : 'Scan KTM Telkom University untuk verifikasi partner.'}
        </p>
      </div>
    </header>

    {step === 'INTRO' && (
      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 rounded-[2.5rem] border border-slate-100 bg-white p-7 md:p-10 shadow-[0_18px_50px_rgba(15,23,42,0.06)] relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-100/60 blur-2xl" />
          <div className="absolute right-10 bottom-10 hidden md:block text-orange-100">
            <Sparkles size={120} />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-orange-50 text-orange-600 shadow-sm border border-orange-100">
              <Sparkles size={38} />
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-slate-950 leading-tight">
              Jadi Partner NgolabHub dan dapatkan penghasilan tambahan.
            </h2>

            <p className="mt-5 text-base md:text-lg leading-relaxed text-slate-500">
              Program afiliasi dirancang untuk mahasiswa Telkom University agar dapat
              membangun jaringan referral, memantau performa, dan mendapatkan komisi
              dari transaksi yang berhasil.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
                  <CheckCircle size={22} />
                </div>
                <h3 className="font-black text-slate-900">Komisi Tinggi</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Dapatkan komisi dari transaksi referral.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
                  <Sparkles size={22} />
                </div>
                <h3 className="font-black text-slate-900">AI Insight</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Pantau performa jaringan dengan insight.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
                  <CheckCircle size={22} />
                </div>
                <h3 className="font-black text-slate-900">Reward Partner</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Dapatkan benefit khusus affiliate aktif.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep('SCANNING')}
              className="mt-9 inline-flex w-full sm:w-auto items-center justify-center rounded-2xl bg-orange-600 px-8 py-4 text-base font-black text-white shadow-xl shadow-orange-100 hover:bg-orange-700 transition active:scale-95"
            >
              Mulai Verifikasi Sekarang
              <ArrowLeft className="ml-2 rotate-180" size={20} />
            </button>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-[2.5rem] border border-orange-100 bg-gradient-to-br from-orange-600 to-amber-500 p-7 text-white shadow-xl shadow-orange-100 relative overflow-hidden">
            <Sparkles className="absolute -right-8 -top-8 h-36 w-36 text-white/10" />
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-100">
              Syarat Verifikasi
            </p>
            <h3 className="mt-3 text-3xl font-black">
              KTM Telkom University Aktif
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-orange-50">
              Pastikan KTM terlihat jelas, tidak blur, dan NIM dapat terbaca oleh sistem AI OCR.
            </p>
          </div>

          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm">
            <h3 className="text-xl font-black text-slate-950">Tahapan Verifikasi</h3>

            <div className="mt-6 space-y-5">
              {[
                ['1', 'Upload KTM', 'Ambil foto atau upload gambar KTM.'],
                ['2', 'AI OCR Validation', 'Sistem membaca Telkom dan NIM.'],
                ['3', 'Review Admin', 'Admin dapat melakukan validasi manual.'],
                ['4', 'Affiliate Aktif', 'Role berubah menjadi member affiliate.'],
              ].map(([num, title, desc]) => (
                <div key={num} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-sm font-black text-orange-600 border border-orange-100">
                    {num}
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{title}</p>
                    <p className="mt-1 text-sm text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )}

    {step === 'SCANNING' && (
      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 rounded-[2.5rem] border border-slate-100 bg-white p-6 md:p-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-500">
                Step 1
              </p>
              <h2 className="text-2xl font-black text-slate-950">
                Verifikasi KTM
              </h2>
            </div>

            <span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-black text-orange-600 border border-orange-100">
              AI OCR
            </span>
          </div>

          <div className="relative aspect-[4/3] bg-black rounded-[2rem] overflow-hidden shadow-inner border border-slate-100">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: 'environment',
              }}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 border-2 border-dashed border-white/30 m-10 rounded-3xl pointer-events-none flex items-center justify-center">
              <p className="text-white/60 text-xs font-black uppercase tracking-[0.22em]">
                Posisikan KTM di sini
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={capture}
              className="py-4 bg-orange-600 text-white rounded-2xl font-black text-base flex items-center justify-center shadow-xl shadow-orange-100 hover:bg-orange-700 transition active:scale-95"
            >
              <Camera size={22} className="mr-3" />
              Ambil Foto
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-4 bg-white text-orange-600 border-2 border-orange-600 rounded-2xl font-black text-base flex items-center justify-center hover:bg-orange-50 transition active:scale-95"
            >
              <Upload size={22} className="mr-3" />
              Upload Foto
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <aside className="xl:col-span-2 space-y-6">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm">
            <h3 className="text-xl font-black text-slate-950">Tips Foto KTM</h3>
            <div className="mt-5 space-y-4">
              {[
                'Pastikan KTM terkena cahaya cukup.',
                'NIM dan logo Telkom University harus terlihat jelas.',
                'Hindari foto blur atau terlalu miring.',
                'Gunakan KTM aktif milik akun yang sedang login.',
              ].map((tip) => (
                <div key={tip} className="flex gap-3">
                  <CheckCircle size={18} className="mt-0.5 text-emerald-500 shrink-0" />
                  <p className="text-sm font-semibold text-slate-600">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-orange-100 bg-orange-50 p-7">
            <h3 className="font-black text-orange-900">Keuntungan Afiliasi</h3>
            <ul className="mt-3 space-y-2 text-sm text-orange-800/80">
              <li>• Komisi hingga 10% dari setiap transaksi referral</li>
              <li>• Dashboard bisnis eksklusif & AI Insight</li>
              <li>• Reward khusus partner Telkom University</li>
            </ul>
          </div>
        </aside>
      </section>
    )}

    {step === 'PREVIEW' && (
      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 rounded-[2.5rem] border border-slate-100 bg-white p-6 md:p-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-5">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-500">
              Preview KTM
            </p>
            <h2 className="text-2xl font-black text-slate-950">
              Hasil Foto KTM
            </h2>
          </div>

          <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg border border-orange-100">
            <img src={ktmImage!} alt="KTM Preview" className="w-full h-full object-cover" />

            {isVerifying && (
              <div className="absolute inset-0 bg-orange-600/85 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 text-center">
                <RefreshCw size={48} className="animate-spin mb-4" />
                <p className="text-xl font-black mb-2">Memproses Verifikasi...</p>
                <p className="text-sm opacity-90">
                  Sistem sedang memvalidasi KTM Telkom University.
                </p>
              </div>
            )}
          </div>

          {!isVerifying && (
            <button
              onClick={() => {
                setVerificationStatus(null);
                setError(null);
                setKtmFile(null);
                setStep('SCANNING');
              }}
              className="mt-5 w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
            >
              Foto Ulang
            </button>
          )}
        </div>

        <aside className="xl:col-span-2 space-y-6">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm">
            <h3 className="text-xl font-black text-slate-950">Hasil Verifikasi</h3>

            {verificationStatus && (
              <div className="mt-5 rounded-3xl bg-emerald-50 border border-emerald-100 p-5 flex items-start gap-3 text-emerald-700">
                <CheckCircle size={22} className="shrink-0 mt-0.5" />
                <p className="text-sm font-black whitespace-pre-line">{verificationStatus}</p>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-3xl bg-rose-50 border border-rose-100 p-5 flex items-start gap-3 text-rose-600">
                <AlertCircle size={22} className="shrink-0 mt-0.5" />
                <p className="text-sm font-black">{error}</p>
              </div>
            )}

            {!verificationStatus && !error && !isVerifying && (
              <div className="mt-5 rounded-3xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">
                Hasil verifikasi akan muncul setelah KTM diproses oleh sistem AI OCR.
              </div>
            )}
          </div>

          <div className="rounded-[2.5rem] border border-orange-100 bg-orange-50 p-7">
            <h3 className="font-black text-orange-900">Catatan</h3>
            <p className="mt-2 text-sm leading-relaxed text-orange-800/80">
              Jika hasil OCR gagal, data tetap dapat masuk antrean review dan admin dapat
              melakukan approval manual melalui halaman Verifikasi KTM.
            </p>
          </div>
        </aside>
      </section>
    )}
  </div>

  );
};

export default UpgradeAffiliate;
