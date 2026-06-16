
import React from 'react';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  History, 
  Ticket, 
  UserCircle, 
  LogOut, 
  Gift, 
  Zap,
  Star,
  Users,
  Settings,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab, onLogout, userName }) => {
  const commonClasses = "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer";
  const activeClasses = "bg-orange-600 text-white shadow-lg shadow-orange-100";
  const inactiveClasses = "text-slate-600 hover:bg-orange-50 hover:text-orange-600";

  const memberLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'rewards', label: 'Reward Center', icon: <Gift size={20} /> },
    { id: 'history', label: 'Poin & Transaksi', icon: <History size={20} /> },
    { id: 'upgrade_affiliate', label: 'Upgrade Afiliasi', icon: <Zap size={20} /> },
    { id: 'profile', label: 'Profil Saya', icon: <UserCircle size={20} /> },
  ];

  const affiliateLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'rewards', label: 'Voucher & Promo', icon: <Ticket size={20} /> },
    { id: 'history', label: 'Poin & Transaksi', icon: <History size={20} /> },
    { id: 'profile', label: 'Profil Afiliasi', icon: <UserCircle size={20} /> },
  ];

  const adminLinks = [
    { id: 'dashboard', label: 'Dashboard Admin', icon: <LayoutDashboard size={20} /> },
    { id: 'affiliate_verify', label: 'Verifikasi Afiliasi', icon: <ShieldAlert size={20} /> },
    { id: 'member_manage', label: 'Manajemen Member', icon: <Users size={20} /> },
    { id: 'global_settings', label: 'Pengaturan Sistem', icon: <Settings size={20} /> },
  ];

  const getLinks = () => {
    if (role === UserRole.ADMIN) return adminLinks;
    if (role === UserRole.MEMBER_AFFILIATE) return affiliateLinks;
    return memberLinks;
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-white h-screen border-r border-slate-100 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
  <img
    src="/ngolab-logo.png"
    alt="Ngolab Express"
    className="w-14 h-14 object-contain"
  />

  <div>
    <h1 className="text-xl font-black text-slate-900 leading-tight">
      Ngolab Express
    </h1>
    <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">
      Member & Affiliate
    </p>
  </div>
</div>

        <nav className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`${commonClasses} ${activeTab === link.id ? activeClasses : inactiveClasses}`}
            >
              {link.icon}
              <span className="font-medium">{link.label}</span>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-100">
        <div className="mb-6 px-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">User Aktif</p>
          <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
          <div className="mt-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
              role === UserRole.MEMBER ? 'bg-orange-50 text-orange-600' : 
              role === UserRole.MEMBER_AFFILIATE ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {role.replace('_', ' ')} {role === UserRole.MEMBER_AFFILIATE ? '• ACTIVE' : ''}
            </span>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
