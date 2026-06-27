
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
import { Ticket, Clock, LogOut, Settings, Users, Star, Zap, ArrowRight, Sparkles, Gift } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [commissionLogs, setCommissionLogs] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
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

   const CONNECTION_KEY = 'kw7ZPgN5A8Y7';

useEffect(() => {
      // Profile sync disabled - endpoint /api/membership/users/ not available on backend
      // To re-enable, ensure backend has endpoint: GET /api/membership/users/{userId}
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


useEffect(() => {
  const fetchUserVouchers = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/membership/users/${user.id}/vouchers`
      );

      const result = await response.json();

      if (result.success) {
        const mappedVouchers: Voucher[] = result.data.map((item: any) => ({
          id: item.voucher_code,
          code: item.voucher_code,
          title: item.voucher_name,
          discount:
            item.voucher_type === 'discount'
              ? `${Number(item.value_amount || 0)}%`
              : `${Number(item.value_amount || 0).toLocaleString('id-ID')} Poin`,
          expiry: item.expired_at || item.claimed_at || '-',
          minSpend: Number(item.min_purchase || 0),
          isClaimed: true,
        }));

        setVouchers(mappedVouchers);
      }
    } catch (error) {
      console.error('Gagal mengambil voucher user:', error);
      setVouchers([]);
    }
  };

  fetchUserVouchers();
}, [user?.id]);


  useEffect(() => {
  const handleNavigateProfile = () => {
   setActiveTab('profile');
  };

  window.addEventListener(
    'navigate-profile',
    handleNavigateProfile
  );

  return () => {
    window.removeEventListener(
      'navigate-profile',
      handleNavigateProfile
    );
  };
}, []);

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

  // Fetch transaction history from backend
  // Fetch transaction history from backend
useEffect(() => {
  const fetchTransactions = async () => {
    if (!user || !['history', 'history_purchase', 'history_commission'].includes(activeTab)) {
      return;
    }

    try {
      const token = localStorage.getItem('jwtToken');
      const userId = user.id;

      console.log('USER ID UNTUK HISTORY:', userId);
      console.log('TOKEN:', token);

      const response = await fetch(
        `${API_BASE_URL}/api/membership/transactions/history/${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
console.log('HASIL HISTORY:', result);

if (Array.isArray(result?.data)) {

  const mappedTransactions = result.data.map((t: any) => ({
    id: t.order_id || t.order_code,
    date: t.transaction_date || t.created_at,
    description: t.order_code
      ? `Pesanan ${t.order_code}`
      : 'Pesanan Ngolab Express',
    amount: Number(t.total || 0),
    type: 'PURCHASE',
    points: Number(t.points_earned || 0),
    status: t.status || 'SUCCESS',
    items: (t.items || []).map((item: any) => ({
      name: item.product_name_snapshot || item.item_name || 'Produk',
      quantity: item.qty || 1,
    })),
  })) as Transaction[];

  setTransactions(mappedTransactions);

} else {
  setTransactions([]);
}
    } catch (error) {
      console.error('Fetch transactions failed:', error);
      setTransactions([]);
    }
  };

  fetchTransactions();
}, [user?.id, activeTab]);


useEffect(() => {
  const handleNavigateToHistory = () => {
    setActiveTab('history');
  };

  window.addEventListener('navigate-to-history', handleNavigateToHistory);

  return () => {
    window.removeEventListener('navigate-to-history', handleNavigateToHistory);
  };
}, []);
// Fetch commission logs from backend
// Fetch commission logs from backend
useEffect(() => {
  const fetchCommissionLogs = async () => {
    if (!user || !['history', 'history_purchase', 'history_commission'].includes(activeTab)) {
      return;
    }

    try {
      const token = localStorage.getItem('jwtToken');
      const userId = user.id;

      const response = await fetch(
        `${API_BASE_URL}/api/membership/commission-logs/${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      console.log('HASIL KOMISI:', result);

      if (Array.isArray(result?.data)) {
        const mappedCommissionLogs = result.data.map((log: any) => ({
          id: log.id,
          created_at: log.created_at,
          note: log.member_id
            ? `Komisi Referral: ${log.member_id}`
            : 'Komisi Referral',
          points: Number(log.commission_earned || 0),
          point_type: 'commission',
          reference_type: 'affiliate',
          reference_id: log.transaction_code || log.member_id,
        }));

        setCommissionLogs(mappedCommissionLogs);
      } else {
        setCommissionLogs([]);
      }
    } catch (error) {
      console.error('Fetch commission logs failed:', error);
      setCommissionLogs([]);
    }
  };

  fetchCommissionLogs();
}, [user?.id, activeTab]);

  const handleRegisterSuccess = (newUser: User) => {
    setUser(newUser);
    setIsRegistering(false);
    setIsLoggingIn(false);
    setActiveTab('dashboard');
  };

   const handleLogout = () => {
     localStorage.removeItem('jwtToken');
     setUser(null);
     setSelectedRole(null);
     setIsRegistering(false);
     setIsLoggingIn(false);
     setActiveTab('dashboard');
   };

  const handleUpgradeAffiliateSuccess = (upgradedUser: User) => {
    console.log('✨ User upgrade successful, new role:', upgradedUser.role);
    // Update user state with MEMBER_AFFILIATE role + referral code
    setUser(upgradedUser);
    // Switch to dashboard - routing will auto-detect MEMBER_AFFILIATE and show AffiliateDashboard
    setActiveTab('dashboard');
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setIsLoadingUpdate(true);
    try {
      const formData = new FormData();
      formData.append('username', updatedUser.username || updatedUser.name || '');
      formData.append('phone_number', updatedUser.phone_number || updatedUser.phone || '');
      formData.append('nim', updatedUser.nim || '');

      if (updatedUser.photoURL) {
        const photoField = updatedUser.photoURL as unknown;
        if (photoField instanceof File) {
          formData.append('profile_picture', photoField as File);
        } else if (typeof photoField === 'string' && photoField.startsWith('data:')) {
          const response = await fetch(photoField);
          const blob = await response.blob();
          const file = new File([blob], 'profile.jpg', { type: blob.type || 'image/jpeg' });
          formData.append('profile_picture', file);
        }
      }
const currentUserId = user?.id || user?.user_id;

if (!currentUserId) {
  alert('User belum ditemukan. Silakan login ulang.');
  return;
}

const response = await fetch(`${API_BASE_URL}/api/membership/profile/${currentUserId}`, {
  method: 'PUT',
  body: formData,
  headers: {
    'X-Connection-Key': CONNECTION_KEY,
  },
});
      const result = await response.json();
      if (result.success) {
        const latest = result.data.user || result.data;
       setUser({
  ...latest,
  id: latest.user_id || latest.id,
  nim: updatedUser.nim,
  photoURL: latest.photoURL || latest.profile_picture || latest.photo_url,
} as any);
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
          headers: { 
            'Content-Type': 'application/json',
            'X-Connection-Key': CONNECTION_KEY 
          },
          body: JSON.stringify({ user_id: user.id, voucher_code: voucher.code, points_to_redeem: voucher.pointCost }),
        });
        const result = await response.json();
        if (result.success) {
          // optionally refresh profile
          const ref = await fetch(`${API_BASE_URL}/api/membership/users/${user.id}`, {
            headers: { 'X-Connection-Key': CONNECTION_KEY }
          });
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
    return (
      <Register
        role={selectedRole}
        onBack={() => setIsRegistering(false)}
        onSuccess={handleRegisterSuccess}
      />
    );
  }

  if (isLoggingIn) {
    return (
     <Login
  onBack={() => setIsLoggingIn(false)}
  onSuccess={handleLoginSuccess}
  onRegisterClick={() => {
    setIsLoggingIn(false);
    handleSelectRole(UserRole.MEMBER);
  }}
/>
    );
  }

  return (
    <Landing
      onSelectRole={handleSelectRole}
      onLoginClick={() => setIsLoggingIn(true)}
      onRegisterClick={() => handleSelectRole(UserRole.MEMBER)}
    />
  );
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
          <div className="space-y-8 animate-in fade-in duration-200">
  <header className="mb-6">
    <h1 className="text-2xl font-bold text-slate-900">
      Reward & Promo
    </h1>
  </header>

  <section className="flex justify-center">
    <div className="w-full max-w-xl">
      {vouchers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Gift size={48} className="text-orange-600" />
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Belum Ada Voucher Tersedia
          </h3>

          <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
            Saat ini belum ada voucher yang dapat ditukarkan. Voucher akan muncul ketika tersedia promo baru atau setelah Anda memiliki poin yang mencukupi dari gemifikasi.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {vouchers.map((v) => (
            <VoucherCard
              key={v.id}
              voucher={v}
              onClaim={() => handleClaimVoucher(v.id)}
            />
          ))}
        </div>
      )}
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
            pointLogs={commissionLogs}
            />
          </div>
        );
      case 'profile':
        return <Profile user={user} onUpdateUser={handleUpdateUser} />;
      case 'upgrade_affiliate':
        return <UpgradeAffiliate user={user} onBack={() => setActiveTab('dashboard')} onSuccess={handleUpgradeAffiliateSuccess} />;
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
    <div className="min-h-screen bg-slate-50">
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
        
      </main>
    </div>
  );
};

export default App;
