
import React, { useState } from 'react';
import { UserRole, User, MemberLevel } from '../types';
import { ArrowLeft, Star, Mail, Lock } from 'lucide-react';
import { WEB_APP_URL } from '../constants';

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
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'login', 
          email: email,
          password: password 
        }),
      });
      const result = await response.json();

      if (result.success && result.data) {
        onSuccess(result.data);
      } else {
        setError(result.error || "Email tidak terdaftar atau password salah.");
      }
    } catch (err) {
      setError("Gagal terhubung ke server. Pastikan Web App sudah di-deploy sebagai 'Anyone'.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-orange-50 focus:border-orange-600 outline-none transition-all text-slate-900 font-bold placeholder:text-slate-300";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-6">
      <div className="max-w-md w-full">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-orange-600 mb-8 transition-colors font-semibold"
        >
          <ArrowLeft size={20} className="mr-2" />
          Kembali
        </button>

        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200 p-10 border border-slate-100">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 text-white rounded-2xl mb-4 shadow-lg shadow-orange-100">
               <Star fill="currentColor" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Selamat Datang Kembali</h1>
            <p className="text-slate-500 mt-2">Masuk ke akun LoyaltyHub Anda</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100 animate-in fade-in zoom-in">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
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
              <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
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
              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-orange-100 hover:bg-orange-600 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Memverifikasi..." : "Masuk Sekarang"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
