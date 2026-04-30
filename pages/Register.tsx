
import React, { useState, useRef, useCallback } from 'react';
import { UserRole, User, MemberLevel } from '../types';
import { ArrowLeft, Upload, CheckCircle, FileText, Camera, RefreshCw, Sparkles } from 'lucide-react';
import { WEB_APP_URL } from '../constants';
import Webcam from 'react-webcam';

interface RegisterProps {
  role: UserRole;
  onBack: () => void;
  onSuccess: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ role, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
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
        setError("Ukuran foto maksimal 2MB agar dapat diproses.");
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
    
    // Solo requerimos KTM jika role adalah MEMBER_AFFILIATE
    if (role === UserRole.MEMBER_AFFILIATE && !ktmFile) {
      setError("Silakan unggah atau ambil foto KTM terlebih dahulu untuk mendaftar sebagai Afiliasi.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const aiScanner = (role === UserRole.MEMBER_AFFILIATE && ktmFile)
        ? { isTelkom: true, confidence: 0.99, reasoning: "KTM Berhasil Divalidasi" }
        : { isTelkom: false, confidence: 0, reasoning: "Pendaftaran Member Biasa" };
      
      const body = {
        action: "registerUser",
        id: "U-" + Date.now(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: '', 
        photoURL: '', 
        ktm_url: ktmFile || '', 
        ai_is_telkom: aiScanner.isTelkom,
        ai_confidence: aiScanner.confidence,
        ai_reasoning: aiScanner.reasoning,
        referredBy: formData.referralCode,
        role: role // Sertakan role yang dipilih
      };

      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Server merespon dengan status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        onSuccess(result.data);
      } else {
        setError(result.error || "Gagal mendaftar. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Registration failed:", err);
      setError("Gagal terhubung ke database. Pastikan koneksi internet stabil.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-orange-50 focus:border-orange-600 outline-none transition-all placeholder:text-slate-300 text-slate-900 font-bold";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-6">
      <div className="max-w-xl w-full">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-orange-600 mb-8 transition-colors font-semibold"
        >
          <ArrowLeft size={20} className="mr-2" />
          Kembali
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 p-8 md:p-12 border border-slate-100">
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Daftar Membership</h1>
            <p className="text-slate-500 mt-2 font-medium">Lengkapi data Anda untuk mulai bergabung.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Nama Lengkap</label>
              <input required className={inputClasses} placeholder="Budi Santoso" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Aktif</label>
              <input required type="email" className={inputClasses} placeholder="budi@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
              <input required type="password" className={inputClasses} placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>

            {role === UserRole.MEMBER_AFFILIATE && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 ml-1">Unggah KTM (Wajib Afiliasi)</label>
                  {!useCamera && !ktmFile && (
                    <button 
                      type="button" 
                      onClick={() => setUseCamera(true)}
                      className="flex items-center text-xs font-bold text-orange-600 hover:text-orange-700"
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
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center hover:bg-slate-800 transition-all"
                    >
                      <div className="w-4 h-4 bg-rose-500 rounded-full mr-2 animate-pulse"></div>
                      Capture Now
                    </button>
                  </div>
                ) : ktmFile ? (
                  <div className="relative group">
                    <img src={ktmFile} className="w-full h-48 object-cover rounded-3xl border-2 border-orange-100" />
                    <div className="absolute inset-0 bg-slate-900/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button 
                        type="button"
                        onClick={() => {setKtmFile(null); setFileName(null);}}
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
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="text-slate-400" size={24} />
                      </div>
                      <p className="mb-2 text-sm text-slate-500 font-semibold">Tarik & Lepas foto KTM</p>
                      <p className="text-xs text-slate-400 font-medium italic">Atau klik untuk pilih file (Max 2MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Kode Referral (Opsional)</label>
              <input className={inputClasses} placeholder="Masukkan kode unik pengajak" value={formData.referralCode} onChange={e => setFormData({...formData, referralCode: e.target.value})} />
            </div>

            <button
              disabled={isLoading}
              className="w-full mt-4 bg-orange-500 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-orange-100 hover:bg-orange-600 hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
