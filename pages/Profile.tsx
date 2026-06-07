import React, { useState, useRef, useEffect } from 'react';
import QRCode from "react-qr-code";
import { User, UserRole, MemberLevel } from '../types';
import { 
  Key, 
  Headphones, 
  HelpCircle, 
  ChevronRight,
  Mail,
  Phone,
  Camera,
  User as UserIcon,
  Save,
  ArrowLeft,
  MessageCircle,
  Trash2,
  QrCode,
  Copy,
  CheckCircle,
  FileText
} from 'lucide-react';
import { API_BASE_URL } from '../constants';



interface ProfileProps {
  user: User;
  transactions?: any[];
  onUpdateUser?: (updatedUser: User) => void;
}

type ProfileView = 'MAIN' | 'PASSWORD' | 'SUPPORT' | 'FAQ' | 'EDIT';

const Profile: React.FC<ProfileProps> = ({ user, transactions, onUpdateUser }) => {
  const [view, setView] = useState<ProfileView>('MAIN');
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editForm, setEditForm] = useState({
    name: user.username || user.name,
    phone: user.phone_number || user.phone || '',
    nim: user.nim || '',
    photoURL: user.photoURL
  });

  // Display name - prioritize username, fallback to name
  const displayName = user.username || user.name;
  const initials = displayName ? displayName.substring(0, 2).toUpperCase() : 'UN';

  const handleCopyCode = () => {
    if (user.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      const cleaned = dateStr.replace(',', '');
      const dateFallback = new Date(cleaned);
      if (isNaN(dateFallback.getTime())) return 'Baru Bergabung';
      return dateFallback.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    }
    return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        username: editForm.name, 
        phone_number: editForm.phone,
        nim: editForm.nim,
        photoURL: editForm.photoURL
      } as any);
    }
    setView('MAIN');
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Konfirmasi password baru tidak cocok.");
      return;
    }
    
    if (!passwordForm.newPassword || !passwordForm.oldPassword) {
      alert("Harap isi semua kolom password.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/membership/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword })
      });
      const result = await response.json();
      if (result.success) {
        alert('Kata sandi berhasil diperbarui!');
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setView('MAIN');
      } else {
        alert('Gagal: ' + (result.error || 'unknown'));
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setEditForm({ ...editForm, photoURL: compressedDataUrl });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = () => {
    setEditForm({ ...editForm, photoURL: undefined });
  };

  const SettingItem = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) => (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[1.5rem] hover:shadow-md transition-all cursor-pointer group mb-4"
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
          <Icon size={20} />
        </div>
        <span className="font-bold text-slate-700">{label}</span>
      </div>
      <ChevronRight size={20} className="text-slate-300 group-hover:text-orange-400 transition-colors" />
    </div>
  );

  const SubPageHeader = ({ title }: { title: string }) => (
    <div className="flex items-center space-x-4 mb-8">
      <button 
        onClick={() => setView('MAIN')}
        className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-all"
      >
        <ArrowLeft size={20} />
      </button>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
    </div>
  );

  const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f97316&color=fff&size=128`;
  const editAvatarUrl = editForm.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(editForm.name)}&background=f97316&color=fff&size=128`;

  if (view === 'EDIT') {
    return (
      <div className="max-w-2xl mx-auto py-8 animate-in fade-in duration-200">
        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-100 p-10 md:p-12 border border-slate-50">
          <SubPageHeader title="Edit Profil" />
          
          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-orange-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                <img 
                  src={editAvatarUrl} 
                  alt={editForm.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 flex space-x-1.5">
                <button 
                  onClick={handleDeletePhoto}
                  className="p-1.5 bg-rose-500 rounded-md shadow-md border-2 border-white text-white hover:scale-110 transition-transform"
                  title="Hapus Foto"
                >
                  <Trash2 size={14} />
                </button>
                <button 
                  onClick={handlePhotoClick}
                  className="p-1.5 bg-orange-600 rounded-md shadow-md border-2 border-white text-white hover:scale-110 transition-transform"
                  title="Ganti Foto"
                >
                  <Camera size={14} />
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Ganti Foto Profil</p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">NAMA LENGKAP / USERNAME</label>
              <div className="relative">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-4 focus:ring-orange-50 focus:border-orange-600 focus:bg-white outline-none transition-all font-bold text-slate-900"
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  placeholder="Nama Lengkap / Username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">NOMOR TELEPON</label>
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-4 focus:ring-orange-50 focus:border-orange-600 focus:bg-white outline-none transition-all font-bold text-slate-900"
                  value={editForm.phone}
                  onChange={e => setEditForm({...editForm, phone: e.target.value})}
                  placeholder="Contoh: 0812xxxx"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">NIM (NOMOR INDUK MAHASISWA)</label>
              <div className="relative">
                <FileText className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-4 focus:ring-orange-50 focus:border-orange-600 focus:bg-white outline-none transition-all font-bold text-slate-900"
                  value={editForm.nim}
                  onChange={e => setEditForm({...editForm, nim: e.target.value})}
                  placeholder="Contoh: 3152201034"
                  maxLength={12}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-orange-100 hover:bg-orange-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
            >
              <Save size={18} />
              Simpan Perubahan
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'PASSWORD') {
    return (
      <div className="max-w-2xl mx-auto py-8 animate-in fade-in duration-200">
        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-100 p-10 md:p-12 border border-slate-50">
          <SubPageHeader title="Ganti Kata Sandi" />
          <form onSubmit={handlePasswordUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">KATA SANDI LAMA</label>
              <input 
                required
                type="password" 
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-4 focus:ring-orange-50 outline-none font-bold text-slate-900" 
                placeholder="••••••••" 
                value={passwordForm.oldPassword}
                onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">KATA SANDI BARU</label>
              <input 
                required
                type="password" 
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-4 focus:ring-orange-50 outline-none font-bold text-slate-900" 
                placeholder="••••••••" 
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">KONFIRMASI KATA SANDI BARU</label>
              <input 
                required
                type="password" 
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-4 focus:ring-orange-50 outline-none font-bold text-slate-900" 
                placeholder="••••••••" 
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              />
            </div>
            <button 
              type="submit" 
              disabled={isUpdatingPassword}
              className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black shadow-xl shadow-orange-100 hover:scale-[1.01] transition-all uppercase tracking-widest text-sm mt-4 disabled:opacity-50"
            >
              {isUpdatingPassword ? 'MEMPROSES...' : 'UPDATE KATA SANDI'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'SUPPORT') {
    return (
      <div className="max-w-3xl mx-auto py-8 animate-in fade-in duration-200">
        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-100 p-10 md:p-12 border border-slate-50">
          <SubPageHeader title="Pusat Bantuan" />
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">Tim dukungan kami siap membantu Anda 24/7. Hubungi kami melalui kanal di bawah ini:</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 bg-orange-50/30 border border-orange-50 rounded-[2rem] hover:shadow-md transition-all cursor-pointer group"><div className="flex items-center space-x-4"><div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-sm"><MessageCircle size={24} /></div><div><h4 className="font-bold text-slate-800">WhatsApp Support</h4><p className="text-xs text-orange-600 font-medium">Respon cepat dalam &lt; 5 menit</p></div></div><ChevronRight size={20} className="text-orange-200 group-hover:text-orange-400 transition-colors" /></div>
            <div className="flex items-center justify-between p-6 bg-blue-50/30 border border-orange-50 rounded-[2rem] hover:shadow-md transition-all cursor-pointer group"><div className="flex items-center space-x-4"><div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-sm"><Mail size={24} /></div><div><h4 className="font-bold text-slate-800">Email Official</h4><p className="text-xs text-orange-600 font-medium">support@ngolab.id</p></div></div><ChevronRight size={20} className="text-orange-200 group-hover:text-orange-400 transition-colors" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'FAQ') {
    return (
      <div className="max-w-3xl mx-auto py-8 animate-in fade-in duration-200">
        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-100 p-10 md:p-12 border border-slate-50">
          <SubPageHeader title="FAQ" />
          <div className="space-y-6">
            <div className="p-8 bg-[#F8FAFC] rounded-[2rem] border border-slate-50"><h4 className="font-bold text-slate-900 mb-4">Bagaimana cara menggunakan poin?</h4><p className="text-sm text-slate-500 leading-relaxed font-medium">Poin Anda dapat ditukarkan langsung dengan berbagai voucher menarik di Reward Center atau digunakan sebagai potongan belanja di merchant NgolabHub.</p></div>
            <div className="p-8 bg-[#F8FAFC] rounded-[2rem] border border-slate-50"><h4 className="font-bold text-slate-900 mb-4">Berapa lama poin kadaluarsa?</h4><p className="text-sm text-slate-500 leading-relaxed font-medium">Poin Ngolab berlaku selama 1 tahun sejak transaksi terakhir dilakukan.</p></div>
            <div className="p-8 bg-[#F8FAFC] rounded-[2rem] border border-slate-50"><h4 className="font-bold text-slate-900 mb-4">Mengapa status akun saya Verifying?</h4><p className="text-sm text-slate-500 leading-relaxed font-medium">Untuk Partner Afiliasi, tim kami memerlukan waktu maksimal 2×24 jam untuk memverifikasi foto KTM Anda.</p></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-100 p-10 md:p-16 border border-slate-50">
        
        {/* Page Title */}
        <div className="mb-10">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {user.role === UserRole.MEMBER ? 'Profil Saya' : 'Profil'}
          </h2>
        </div>

        {/* Profile Header Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12 pb-12 border-b border-slate-100">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-orange-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
              <img 
                src={avatarUrl} 
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{displayName}</h1>
              {user.role === UserRole.MEMBER_AFFILIATE && (
                <span className="w-fit px-3 py-1 bg-orange-100/50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border border-orange-100">
                  MEMBER AFFILIATE • ACTIVE
                </span>
              )}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-5 text-slate-500 font-bold text-sm">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-slate-300" />
                {user.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-slate-300" />
                {user.phone_number || user.phone || 'Belum ada nomor telepon'}
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              setEditForm({ name: user.username || user.name, phone: user.phone_number || user.phone || '', photoURL: user.photoURL });
              setView('EDIT');
            }}
            className="px-8 py-3.5 bg-orange-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-orange-100 hover:bg-orange-700 hover:-translate-y-0.5 transition-all"
          >
            Edit Profil
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-16">
          <div className="flex-1 space-y-10">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-1.5 h-8 bg-slate-900 rounded-full"></div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Database ID</h2>
            </div>

            <div className="space-y-8">
<div>
                <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-2">
                  QR Code Member
                </p>
                <div className="flex items-center gap-6">
                  <div className="p-3 bg-white border-4 border-slate-50 rounded-2xl shadow-sm">
 {user?.id ? (
  <QRCode value={String(user.id)} size={120} />
) : (
  <div style={{ width: 120, height: 120, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 12, color: '#9ca3af' }}>
    Memuat QR...
  </div>
)}
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 uppercase">
                      {String(user?.id || 'N/A')}
                    </p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID UNIK MEMBER NGOLABHUB</p>
                   </div>
                </div>
              </div>

              {user.role === UserRole.MEMBER_AFFILIATE && (
                <div>
                  <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-2">KODE REFERAL AFILIASI</p>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-black text-orange-600 uppercase">
                      {user.referralCode || 'NGOLAB-XXXX'}
                    </p>
                    <button 
                      onClick={handleCopyCode}
                      className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-all"
                      title="Salin Kode"
                    >
                      {isCopied ? <CheckCircle size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">BAGIKAN KODE UNTUK KOMISI</p>
                </div>
              )}

              <div>
                <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-2">UPLINE PERMANEN</p>
                <p className={`text-2xl font-black ${(user.referredBy || user.referred_by) ? 'text-slate-900' : 'text-slate-400'}`}>
                  {user.referredBy || user.referred_by || '-'}
                </p>
              </div>

              <div>
                <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-2">MEMBERSHIP LEVEL</p>
                <p className="text-2xl font-black text-slate-900">
                  {user.level || 'SILVER'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-10">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-1.5 h-8 bg-orange-100 rounded-full"></div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pengaturan Akun</h2>
            </div>

            <div className="space-y-2">
              <SettingItem icon={Key} label="Ganti Kata Sandi" onClick={() => setView('PASSWORD')} />
              <SettingItem icon={Headphones} label="Bantuan Support" onClick={() => setView('SUPPORT')} />
              <SettingItem icon={HelpCircle} label="FAQ" onClick={() => setView('FAQ')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;