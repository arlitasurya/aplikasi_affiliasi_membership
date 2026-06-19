
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { User, UserRole } from '../types';
import { API_BASE_URL } from '../constants';
import { Html5QrcodeScanner } from 'html5-qrcode';



interface UpgradeAffiliateProps {
  user: User;
  onBack: () => void;
  onSuccess: (updatedUser: User) => void;
}

const UpgradeAffiliate: React.FC<UpgradeAffiliateProps> = ({ user, onBack, onSuccess }) => {
const [step, setStep] = useState<'INTRO' | 'SCANNING'>('INTRO');
  //const [ktmImage, setKtmImage] = useState<string | null>(null);//
  //const [ktmFile, setKtmFile] = useState<File | null>(null);//
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [barcodeValue, setBarcodeValue] = useState(''); //COBA PAKE BARCODE
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const userId = user.user_id || user.id;
  //const webcamRef = useRef<Webcam>(null);//

  //const fileInputRef = useRef<HTMLInputElement>(null);//
  useEffect(() => {
  if (!isScannerOpen) return;

  const scanner = new Html5QrcodeScanner(
    "reader",
    {
      fps: 10,
      qrbox: {
        width: 250,
        height: 250,
      },
    },
    false
  );

  scanner.render(
    async (decodedText) => {
      setBarcodeValue(decodedText);

      try {
        await scanner.clear();
      } catch {}

      setIsScannerOpen(false);

      // langsung verifikasi
      setTimeout(() => {
        handleVerifyBarcode(decodedText);
      }, 300);
    },
    () => {}
  );

  return () => {
    scanner.clear().catch(() => {});
  };
}, [isScannerOpen]);

  const normalizeNim = (value?: string | null): string => String(value || '').replace(/\D/g, '');

 const handleVerifyBarcode = async (value?: string) => {

const finalBarcode = value || barcodeValue;

if (!finalBarcode.trim()) {
  setError('Barcode/NIM tidak boleh kosong.');
  return;
}
  if (!barcodeValue.trim()) {
    setError('Barcode/NIM tidak boleh kosong.');
    return;
  }

  setIsVerifying(true);
  setError(null);
  setVerificationStatus('🔍 Memvalidasi barcode KTM...');

  try {
    const token =
      localStorage.getItem('jwtToken') ||
      localStorage.getItem('token');

    const response = await fetch(
      `${API_BASE_URL}/api/membership/affiliate/verify-barcode`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
         barcode_value: finalBarcode,
        }),
      }
    );

    const result = await response.json();

    console.log('BARCODE RESPONSE STATUS:', response.status);
    console.log('BARCODE RESPONSE RESULT:', result);

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Verifikasi barcode gagal.');
    }

    const updatedUser: User = {
      ...user,
      role: UserRole.MEMBER_AFFILIATE,
      referralCode:
        result.data?.referral_code ||
        result.data?.user?.referral_code ||
        user.referralCode ||
        `REF_${userId.slice(-6)}`
    };

    setVerificationStatus('✅ Barcode valid! Akun berhasil di-upgrade menjadi Member Affiliate.');

    setTimeout(() => {
      onSuccess(updatedUser);
    }, 1200);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat verifikasi barcode.');
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
          Barcode KTM
        </span>
      </div>

      <div className="rounded-3xl border border-orange-100 bg-orange-50 p-5">
        <h3 className="font-black text-orange-900">
          Test Barcode KTM Digital
        </h3>

        <p className="mt-1 text-sm text-orange-700">
          Masukkan hasil scan barcode atau NIM untuk mencoba verifikasi otomatis.
        </p>

        <input
          type="text"
          value={barcodeValue}
          onChange={(e) => setBarcodeValue(e.target.value)}
          placeholder="Masukkan hasil barcode / NIM"
          className="mt-4 w-full rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-orange-500"
        />
        <button
  type="button"
  onClick={() => setIsScannerOpen(true)}
  className="mt-4 w-full rounded-2xl border border-orange-600 px-5 py-3 font-bold text-orange-600 hover:bg-orange-50"
>
  📷 Scan Barcode KTM
</button>

{isScannerOpen && (
  <div className="mt-4 rounded-2xl overflow-hidden bg-white p-3 border border-orange-100">
    <div id="reader"></div>
  </div>
)}

        <button
  type="button"
  onClick={() => handleVerifyBarcode()}
  disabled={isVerifying}
  className="mt-4 w-full rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black text-white hover:bg-orange-700 disabled:opacity-60"
>
  {isVerifying ? 'Memvalidasi...' : 'Verify Barcode'}
</button>

      </div>

      {verificationStatus && (
        <div className="mt-5 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="font-black text-emerald-700 whitespace-pre-line">
            {verificationStatus}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-3xl border border-rose-100 bg-rose-50 p-5">
          <p className="font-black text-rose-600">
            {error}
          </p>
        </div>
      )}
    </div>

    <aside className="xl:col-span-2 space-y-6">
      <div className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm">
        <h3 className="text-xl font-black text-slate-950">
          Panduan Verifikasi
        </h3>

        <div className="mt-6 space-y-5">
          {[
            [
              '1',
              'Scan Barcode KTM',
              'Pindai barcode pada KTM Digital Telkom University.',
            ],
            [
              '2',
              'Validasi NIM',
              'Sistem mencocokkan barcode dengan NIM akun yang sedang login.',
            ],
            [
              '3',
              'Upgrade Otomatis',
              'Jika data valid, role akan berubah otomatis.',
            ],
            [
              '4',
              'Affiliate Aktif',
              'Referral code aktif dan siap digunakan.',
            ],
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

      <div className="rounded-[2.5rem] border border-orange-100 bg-orange-50 p-7">
        <h3 className="font-black text-orange-900">
          Catatan
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-orange-800/80">
          Jika barcode valid, akun akan langsung menjadi Member Affiliate tanpa
          memerlukan persetujuan manual dari admin.
        </p>
      </div>
    </aside>
  </section>
)}
  </div>

  );
};

export default UpgradeAffiliate;
