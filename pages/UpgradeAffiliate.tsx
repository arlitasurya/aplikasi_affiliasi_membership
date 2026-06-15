
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
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center space-x-4">
        <button 
          onClick={step === 'INTRO' ? onBack : () => setStep('INTRO')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Upgrade ke Afiliasi</h1>
          <p className="text-slate-500">
            {step === 'INTRO' ? 'Bangun jaringan bisnis Anda bersama NgolabHub.' : 'Scan KTM Telkom University untuk verifikasi partner.'}
          </p>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        {step === 'INTRO' && (
          <div className="p-10 space-y-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-orange-100/50">
                <Sparkles size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Siap Menjadi Partner Kami?</h2>
              <p className="text-slate-500 leading-relaxed">
                Program Afiliasi NgolabHub dirancang khusus untuk mahasiswa Telkom University agar bisa mendapatkan penghasilan tambahan sambil membangun jaringan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm">
                  <CheckCircle size={20} />
                </div>
                <h3 className="font-bold text-slate-900">Komisi Tinggi</h3>
                <p className="text-xs text-slate-500">Dapatkan hingga 10% dari setiap transaksi referral Anda.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-bold text-slate-900">AI Insight</h3>
                <p className="text-xs text-slate-500">Pantau performa jaringan Anda dengan bantuan AI cerdas.</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setStep('SCANNING')}
                className="w-full py-5 bg-orange-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95"
              >
                Mulai Verifikasi Sekarang
                <ArrowLeft className="ml-2 rotate-180" size={20} />
              </button>
              <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">Memerlukan KTM Telkom University Aktif</p>
            </div>
          </div>
        )}

        {step === 'SCANNING' && (
          <div className="p-8 space-y-6">
            <div className="relative aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-inner border-4 border-slate-50">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: "environment"
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-dashed border-white/30 m-12 rounded-2xl pointer-events-none flex items-center justify-center">
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Posisikan KTM di sini</p>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-sm text-slate-500 font-medium">Pastikan pencahayaan cukup dan data pada KTM terbaca jelas oleh AI kami.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={capture}
                  className="py-5 bg-orange-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95"
                >
                  <Camera size={24} className="mr-3" />
                  Ambil Foto
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-5 bg-white text-orange-600 border-2 border-orange-600 rounded-2xl font-bold text-lg flex items-center justify-center hover:bg-orange-50 transition-all active:scale-95"
                >
                  <Upload size={24} className="mr-3" />
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
          </div>
        )}

        {step === 'PREVIEW' && (
          <div className="p-8 space-y-6">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border-4 border-orange-100">
              <img src={ktmImage!} alt="KTM Preview" className="w-full h-full object-cover" />
              {isVerifying && (
                <div className="absolute inset-0 bg-orange-600/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 text-center">
                  <RefreshCw size={48} className="animate-spin mb-4" />
                  <p className="text-xl font-bold mb-2">Memproses Verifikasi...</p>
                  <p className="text-sm opacity-80">Sistem sedang memvalidasi KTM Telkom University.</p>
                </div>
              )}
            </div>

            {verificationStatus && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start space-x-3 text-emerald-700">
                <CheckCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-bold whitespace-pre-line">{verificationStatus}</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-3 text-rose-600">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            {!isVerifying && (
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => {
                    setVerificationStatus(null);
                    setError(null);
                    setKtmFile(null);
                    setStep('SCANNING');
                  }}
                  className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Foto Ulang
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {step !== 'INTRO' && (
        <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100 flex items-start space-x-4">
          <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <h3 className="font-bold text-orange-900">Keuntungan Afiliasi</h3>
            <ul className="text-sm text-orange-800/70 mt-1 space-y-1">
              <li>• Komisi hingga 10% dari setiap transaksi referral</li>
              <li>• Dashboard bisnis eksklusif & AI Insight</li>
              <li>• Reward khusus partner Telkom University</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpgradeAffiliate;
