
import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, CheckCircle, AlertCircle, Sparkles, ArrowLeft, Upload, FileText } from 'lucide-react';
import { User } from '../types';
import { API_BASE_URL } from '../constants';
import { scanKTM } from '../services/geminiService';

interface UpgradeAffiliateProps {
  user: User;
  onBack: () => void;
  onSuccess: (updatedUser: User) => void;
}

const UpgradeAffiliate: React.FC<UpgradeAffiliateProps> = ({ user, onBack, onSuccess }) => {
  const [step, setStep] = useState<'INTRO' | 'SCANNING' | 'PREVIEW'>('INTRO');
  const [ktmImage, setKtmImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizeNim = (value?: string | null): string => String(value || '').replace(/\D/g, '');

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setKtmImage(imageSrc);
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
        setStep('PREVIEW');
        void handleUpgrade(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpgrade = async (imageData: string) => {
    if (!imageData) return;

    const registeredNim = normalizeNim(user.nim);
    if (!registeredNim) {
      setError('NIM akun Anda belum terdaftar. Mohon lengkapi NIM saat registrasi/di profil sebelum upgrade afiliasi.');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('Memverifikasi KTM dan mencocokkan NIM...');
    setError(null);

    try {
      const verificationResult = await scanKTM(imageData);
      const detectedNim = normalizeNim(verificationResult.nim);

      if (!verificationResult.isTelkom) {
        throw new Error(verificationResult.reasoning || 'KTM tidak terdeteksi sebagai KTM Telkom University.');
      }

      if (!detectedNim) {
        throw new Error('NIM pada foto KTM tidak terbaca. Pastikan foto jelas dan tidak blur.');
      }

      if (detectedNim !== registeredNim) {
        throw new Error(`NIM pada KTM (${detectedNim}) tidak sama dengan NIM akun Anda (${registeredNim}).`);
      }

      setVerificationStatus(`KTM terverifikasi. NIM cocok (${detectedNim}).`);

      // Call backend pusat REST API: POST /api/membership/affiliate/verify
      const response = await fetch(`${API_BASE_URL}/api/membership/affiliate/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          ktm_picture: imageData, // Backend expects ktm_picture
          ai_is_telkom: verificationResult.isTelkom,
          ai_confidence: verificationResult.confidence,
          ai_reasoning: verificationResult.reasoning || 'KTM dan NIM terverifikasi.',
          detected_nim: detectedNim
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with status: ${response.status}`);
      }

      const result = await response.json();

      // Backend returns: { success: true, data: { user: {...} } } or { success: true, data: { /* affiliate data */ } }
      if (result.success) {
        const src = result.data?.user || result.data || {};
        await new Promise(resolve => setTimeout(resolve, 300));
        const updatedUser: User = {
          ...src,
          id: src.user_id || src.id,
          totalPoints: src.total_points || 0,
          cashbackPoints: src.cashback_points || 0,
          commissionPoints: src.commission_points || 0,
          referralCode: result.data?.affiliate_network?.referral_code || src.referral_code || ''
        } as any;
        onSuccess(updatedUser);
      } else {
        setError(result.message || "Gagal verifikasi KTM. Pastikan foto jelas.");
        setVerificationStatus(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi. Silakan coba lagi.");
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
                <p className="text-sm font-bold">{verificationStatus}</p>
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
