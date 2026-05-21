
import React, { useState, useEffect } from 'react';
import { User, UserRole, Transaction, Voucher } from './types';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import MemberDashboard from './pages/member/Dashboard';
import AffiliateDashboard from './pages/affiliate/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMemberManage from './pages/admin/MemberManage';
import AdminGlobalSettings from './pages/admin/GlobalSettings';
import Profile from './pages/Profile';
import UpgradeAffiliate from './pages/UpgradeAffiliate';
import { VoucherCard } from './pages/RewardsCommon';
import { TransactionList } from './pages/HistoryCommon';
import { MOCK_VOUCHERS, API_BASE_URL, GAMIFICATION_LINK } from './constants';
import { Clock, LogOut, Settings, Users, Star, Zap, ArrowRight, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>(MOCK_VOUCHERS);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

  useEffect(() => {
    // Detect Referral Code from URL (?ref=CODE)
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      sessionStorage.setItem('referralCodeFromURL', ref);
    }
  }, []);

  useEffect(() => {
    const handleTabChange = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, []);

  useEffect(() => {
    let interval: any;
      if (user && user.role !== UserRole.ADMIN) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/membership/profile/${user.id}`, {
            method: 'GET'
          });
          const result = await response.json();
          if (result.success && result.data) {
            const latest = result.data.user || result.data;
            if (JSON.stringify(latest) !== JSON.stringify(user)) {
              // normalize id field
              const normalized = { ...latest, id: latest.user_id || latest.id };
              setUser(normalized as any);
            }
          }
        } catch (e) {
          console.error('Sync failed:', e);
        }
      }, 8000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    if (user && user.role !== UserRole.ADMIN) {
      if (user.role === UserRole.MEMBER_AFFILIATE) {
        setTransactions([
          { id: 'aff1', date: new Date().toISOString(), description: 'Bonus Referral Pertama', amount: 5000, type: 'COMMISSION', points: 0, status: 'SUCCESS' },
          { 
            id: 'aff2', 
            date: new Date().toISOString(), 
            description: 'Makan Siang Bakso', 
            amount: 25000, 
            type: 'PURCHASE', 
            points: 0, 
            status: 'SUCCESS',
            items: [
              { name: 'Mie Yamin Bakso', quantity: 1 },
              { name: 'Es Teh Manis', quantity: 1 }
            ]
          },
        ]);
      } else {
        setTransactions([
          { 
            id: 'mem1', 
            date: new Date().toISOString(), 
            description: 'Selamat Datang di NgolabHub', 
            amount: 0, 
            type: 'PURCHASE', 
            points: 0, 
            status: 'SUCCESS',
            items: [
              { name: 'Voucher Welcome', quantity: 1 }
            ]
          },
        ]);
      }
    }
  }, [user?.id]);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setIsRegistering(true);
    setIsLoggingIn(false);
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsLoggingIn(false);
    setIsRegistering(false);
    setActiveTab('dashboard');
  };

  const handleRegisterSuccess = (newUser: User) => {
    setUser(newUser);
    setIsRegistering(false);
    setIsLoggingIn(false);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedRole(null);
    setIsRegistering(false);
    setIsLoggingIn(false);
    setActiveTab('dashboard');
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setIsLoadingUpdate(true);
    try {
      // Prepare payload dengan hanya field yang backend support
      const updatePayload = {
        name: updatedUser.name,
        phone: updatedUser.phone,
        photoURL: updatedUser.photoURL,
        nim: updatedUser.nim  // Try to include NIM in the payload
      };

      const response = await fetch(`${API_BASE_URL}/api/membership/profile/${updatedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });
      const result = await response.json();
      if (result.success) {
        const latest = result.data.user || result.data;
        setUser({ ...latest, id: latest.user_id || latest.id, nim: updatedUser.nim } as any);
        alert('Profil berhasil diperbarui!');
      } else {
        alert('Gagal update: ' + (result.error || 'unknown'));
      }
    } catch (e) {
      alert("Koneksi gagal.");
    } finally {
      setIsLoadingUpdate(false);
    }
  };

  const handleClaimVoucher = async (id: string) => {
    const voucher = vouchers.find(v => v.id === id);
    if (!voucher) return;

    if (voucher.pointCost && voucher.pointCost > 0) {
      if (!user) return;
      
      const currentPoints = user.commissionPoints || 0;
      if (currentPoints < voucher.pointCost) {
        alert("Poin komisi tidak cukup untuk menukarkan voucher ini.");
        return;
      }

      setIsLoadingUpdate(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/membership/redeem-points`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, voucher_code: voucher.code, points_to_redeem: voucher.pointCost }),
        });
        const result = await response.json();
        if (result.success) {
          // optionally refresh profile
          const ref = await fetch(`${API_BASE_URL}/api/membership/profile/${user.id}`);
          const refRes = await ref.json().catch(() => ({}));
          if (refRes.success && refRes.data) {
            const latest = refRes.data.user || refRes.data;
            setUser({ ...latest, id: latest.user_id || latest.id } as any);
          }
          setVouchers(prev => prev.map(v => v.id === id ? { ...v, isClaimed: true } : v));
          alert(`Berhasil menukarkan ${voucher.pointCost} poin untuk ${voucher.title}`);
        } else {
          alert('Gagal tukar poin: ' + (result.message || result.error || 'unknown'));
        }
      } catch (e) {
        alert("Koneksi gagal.");
      } finally {
        setIsLoadingUpdate(false);
      }
    } else {
      // Normal free claim
      setVouchers(prev => prev.map(v => v.id === id ? { ...v, isClaimed: true } : v));
    }
  };

  if (!user) {
    if (isRegistering && selectedRole) {
      return <Register role={selectedRole} onBack={() => setIsRegistering(false)} onSuccess={handleRegisterSuccess} />;
    }
    if (isLoggingIn) {
      return <Login onBack={() => setIsLoggingIn(false)} onSuccess={handleLoginSuccess} />;
    }
    return <Landing onSelectRole={handleSelectRole} onLoginClick={() => setIsLoggingIn(true)} />;
  }

  const renderContent = () => {
    // ROUTING UNTUK ADMIN
    if (user.role === UserRole.ADMIN) {
      switch (activeTab) {
        case 'dashboard':
        case 'affiliate_verify':
          return <AdminDashboard adminUser={user} />;
        case 'member_manage':
          return <AdminMemberManage />;
        case 'global_settings':
          return <AdminGlobalSettings />;
        default:
          return <AdminDashboard adminUser={user} />;
      }
    }

    // ROUTING UNTUK MEMBER & AFFILIATE
    switch (activeTab) {
      case 'dashboard':
        return (user.role === UserRole.MEMBER_AFFILIATE)
          ? <AffiliateDashboard user={user} transactions={transactions} />
          : <MemberDashboard user={user} transactions={transactions} />;
      case 'rewards':
        return (
          <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
             <header><h1 className="text-2xl font-bold text-slate-900">Reward & Promo</h1></header>
             <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {vouchers.map(v => (
                    <VoucherCard key={v.id} voucher={v} onClaim={() => handleClaimVoucher(v.id)} />
                  ))}
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Zap size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Mau Voucher Lebih Menarik?</h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        Mainkan mini-game seru di aplikasi gamifikasi kami! Kumpulkan poin harian dan tukarkan dengan voucher diskon hingga 50% atau menu gratis.
                      </p>
                      <a 
                        href={GAMIFICATION_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all"
                      >
                        <span>Main & Dapatkan Poin</span>
                        <ArrowRight size={16} />
                      </a>
                    </div>
                    <div className="absolute -right-8 -bottom-8 text-slate-50 opacity-50 group-hover:text-orange-50 transition-colors">
                      <Sparkles size={160} />
                    </div>
                  </div>
                </div>
             </section>
          </div>
        );
      case 'history':
      case 'history_purchase':
      case 'history_commission':
        // Prepare combined history from pointLogs (backend) and transactions (state/mock)
        const combinedLogs = user.pointLogs || [];
        return (
          <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
            <header>
              <h1 className="text-2xl font-bold text-slate-900">Riwayat Poin & Transaksi</h1>
              <p className="text-slate-500 text-sm">Pantau semua aktivitas belanja, reward, dan komisi Anda.</p>
            </header>
            <TransactionList 
              transactions={transactions || []} 
              pointLogs={combinedLogs}
            />
          </div>
        );
      case 'profile':
        return <Profile user={user} onUpdateUser={handleUpdateUser} />;
      case 'upgrade_affiliate':
        return <UpgradeAffiliate user={user} onBack={() => setActiveTab('dashboard')} onSuccess={handleLoginSuccess} />;
      default:
        return (
          <div className="p-20 text-center bg-white rounded-3xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-400">Halaman Sedang Dikembangkan</h2>
            <button onClick={() => setActiveTab('dashboard')} className="mt-4 text-orange-600 font-bold">Kembali ke Dashboard</button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fff7ed]">
      <Sidebar role={user.role} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} userName={user.name} />
      <main className="ml-64 p-8 md:p-12 flex flex-col min-h-screen">
        <div className="max-w-7xl mx-auto flex-1 w-full">
          {isLoadingUpdate && (
            <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[100] flex items-center justify-center">
              <div className="bg-white p-6 rounded-2xl shadow-xl font-bold text-orange-600 animate-pulse">Menyimpan Perubahan...</div>
            </div>
          )}
          {renderContent()}
        </div>
        
        {/* Footer Section */}
        <footer className="mt-16 pt-8 border-t border-slate-100 text-center w-full max-w-7xl mx-auto pb-8">
          <div className="flex items-center justify-center space-x-2 text-slate-400 font-bold text-lg mb-2">
            <Star fill="currentColor" size={20} className="text-orange-600" />
            <span>NgolabHub</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            © 2024 NgolabHub Ecosystem. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <div className="flex items-center justify-center space-x-4 mt-2">
            <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Privacy Policy</span>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Terms of Service</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
