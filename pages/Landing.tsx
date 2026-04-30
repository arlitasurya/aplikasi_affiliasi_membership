
import React, { useState } from 'react';
import { UserRole } from '../types';
import { 
  ChevronDown, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  Zap, 
  Star, 
  Gift, 
  Sparkles,
  LogIn
} from 'lucide-react';

interface LandingProps {
  onSelectRole: (role: UserRole) => void;
  onLoginClick: () => void;
}

const Landing: React.FC<LandingProps> = ({ onSelectRole, onLoginClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-orange-600 font-bold text-2xl">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
              <Star fill="currentColor" size={24} />
            </div>
            <span className="tracking-tight">NgolabHub</span>
          </div>

          <div className="flex items-center space-x-6">
            <button 
              onClick={() => onSelectRole(UserRole.MEMBER)}
              className="px-6 py-2.5 rounded-full border border-slate-200 hover:border-orange-600 hover:text-orange-600 transition-all font-semibold text-sm"
            >
              Daftar Sekarang
            </button>

            <button 
              onClick={onLoginClick}
              className="flex items-center space-x-2 bg-orange-500 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-orange-100 hover:bg-orange-600 hover:scale-105 transition-all"
            >
              <LogIn size={18} />
              <span>Masuk</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        {/* Abstract Background Decor */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-50 rounded-full blur-3xl opacity-50 -mr-40 -mt-40 z-0"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-50 rounded-full blur-3xl opacity-50 -ml-20 -mb-20 z-0"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="animate-in fade-in duration-300">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={14} />
              <span>Platform Loyalitas No. 1</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8">
              Satu Platform, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Beribu Keuntungan</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
              Gabung sebagai member untuk dapatkan cashback eksklusif, atau jadilah afiliasi kami untuk membangun jaringan bisnis dengan komisi yang menjanjikan.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 relative">
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-10 py-5 bg-orange-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-orange-100 hover:bg-orange-600 hover:-translate-y-1 transition-all flex items-center justify-center w-full sm:w-auto"
                >
                  Mulai Bergabung <ChevronDown className={`ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} size={20} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-4 w-64 bg-white rounded-3xl shadow-3xl border border-slate-100 p-3 z-20 animate-in fade-in slide-in-from-top-4 duration-200">
                    <button 
                      onClick={() => onSelectRole(UserRole.MEMBER)}
                      className="w-full text-left p-4 hover:bg-orange-50 rounded-2xl transition-colors group"
                    >
                      <div className="font-bold text-slate-900 group-hover:text-orange-600">Daftar Member</div>
                      <div className="text-xs text-slate-500 font-medium mt-1">Dapatkan cashback & reward menarik.</div>
                    </button>
                    <button 
                      onClick={() => onSelectRole(UserRole.MEMBER_AFFILIATE)}
                      className="w-full text-left p-4 hover:bg-orange-50 rounded-2xl transition-colors group mt-1"
                    >
                      <div className="font-bold text-slate-900 group-hover:text-orange-600">Daftar Afiliasi</div>
                      <div className="text-xs text-slate-500 font-medium mt-1">Mulai bisnis & raih komisi jaringan.</div>
                    </button>
                  </div>
                )}
              </div>
              
              <button 
                onClick={onLoginClick}
                className="px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center"
              >
                Lihat Demo
              </button>
            </div>

            <div className="mt-12 flex items-center space-x-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/150?u=${i}`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="User" />
                ))}
              </div>
              <p className="text-sm text-slate-500 font-medium">Dipercaya oleh <span className="text-orange-600 font-bold">2.500+</span> pengguna aktif</p>
            </div>
          </div>

          <div className="relative animate-in fade-in duration-500">
            <div className="bg-gradient-to-tr from-orange-500 to-amber-600 rounded-[3rem] p-4 shadow-3xl transition-transform duration-500">
               <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-square flex flex-col justify-center items-center text-center">
                  <img 
                    src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=800" 
                    alt="Loyalty Experience" 
                    className="w-full h-full object-cover"
                  />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Fitur Unggulan Kami</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Kami merancang setiap detail untuk memberikan pengalaman terbaik bagi Anda, baik sebagai penikmat kuliner maupun pebisnis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Gift size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Reward Tracker</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Saran personal berbasis kecerdasan buatan untuk membantu Anda mendapatkan voucher yang tepat sesuai selera.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Komisi Instan</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Dapatkan komisi dari setiap transaksi downline Anda tanpa delay. Transparan dan mudah dicairkan.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Gamification</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Kumpulkan poin ekstra dengan memainkan mini-game seru setiap hari. Belanja tak pernah semenyenangkan ini.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Minimalist */}
      <footer className="py-12 border-t border-slate-100 text-center">
        <div className="flex items-center justify-center space-x-2 text-slate-400 font-bold text-xl mb-4">
          <Star fill="currentColor" size={20} />
          <span>NgolabHub</span>
        </div>
        <p className="text-slate-400 text-sm">© 2024 NgolabHub. Hak Cipta Dilindungi Undang-Undang.</p>
      </footer>
    </div>
  );
};

export default Landing;
