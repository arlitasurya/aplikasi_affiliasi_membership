
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import Card from '../../components/Card';
import { WEB_APP_URL } from '../../constants';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  ShieldCheck, 
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';

interface AdminDashboardProps {
  adminUser: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminUser }) => {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'ACTIVE' | 'ALL'>('PENDING');

  const fetchAffiliates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'getAllAffiliates' }),
      });
      const result = await response.json();
      if (result.success) {
        setAffiliates(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    if (!confirm(`Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`)) return;

    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'updateAccountStatus', 
          userId, 
          newStatus 
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert("Status berhasil diperbarui!");
        fetchAffiliates();
      }
    } catch (error) {
      alert("Gagal memperbarui status.");
    }
  };

  const filteredData = affiliates.filter(aff => {
    if (filter === 'ALL') return true;
    return aff.status === filter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Verifikasi Afiliasi Baru</h1>
          <p className="text-slate-500 font-medium">Tinjau dokumen pendaftaran mitra NgolabHub.</p>
        </div>
        <button 
          onClick={fetchAffiliates}
          className="p-3 bg-white border border-slate-100 rounded-2xl text-orange-600 hover:bg-orange-50 transition-all shadow-sm"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-orange-600 text-white border-none shadow-orange-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-orange-100 text-xs font-bold uppercase tracking-widest mb-1">Menunggu Verifikasi</p>
              <h3 className="text-3xl font-black">{affiliates.filter(a => a.status === 'PENDING').length}</h3>
            </div>
            <ShieldCheck size={40} className="text-orange-400 opacity-50" />
          </div>
        </Card>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
           <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Users size={24} /></div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Mitra Aktif</p>
              <p className="text-xl font-black text-slate-800">{affiliates.filter(a => a.status === 'ACTIVE').length}</p>
           </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 w-fit shadow-sm">
        {(['PENDING', 'ACTIVE', 'ALL'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              filter === t 
                ? 'bg-orange-600 text-white shadow-lg' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {t === 'PENDING' ? 'Perlu Disetujui' : t === 'ACTIVE' ? 'Telah Aktif' : 'Semua'}
          </button>
        ))}
      </div>

      {/* Data List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-50 animate-pulse">
            <p className="font-bold text-slate-400">Sedang memuat data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <CheckCircle size={32} />
            </div>
            <p className="text-slate-500 font-bold">Tidak ada pendaftaran {filter.toLowerCase()} saat ini.</p>
          </div>
        ) : (
          filteredData.map((aff) => (
            <div key={aff.id} className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl overflow-hidden shrink-0">
                <img 
                  src={aff.ktmUrl || `https://ui-avatars.com/api/?name=${aff.name}&background=f97316&color=fff`} 
                  alt="KTM" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-black text-slate-900 text-lg">{aff.name}</h4>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-orange-100 text-orange-600">
                    {aff.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-medium">Mitra Aktif NgolabHub</p>
                <div className="flex items-center mt-2 space-x-4">
                  <a 
                    href={aff.ktmUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs font-bold text-orange-600 flex items-center hover:underline"
                  >
                    <ExternalLink size={12} className="mr-1" /> Lihat KTM Asli
                  </a>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Referral: {aff.referralCode}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {aff.status === 'PENDING' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(aff.id, 'ACTIVE')}
                      className="flex items-center px-5 py-3 bg-orange-600 text-white rounded-2xl font-bold text-sm hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
                    >
                      <CheckCircle size={18} className="mr-2" /> Terima
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(aff.id, 'REJECTED')}
                      className="flex items-center px-5 py-3 bg-white border border-rose-100 text-rose-500 rounded-2xl font-bold text-sm hover:bg-rose-50 transition-all"
                    >
                      <XCircle size={18} className="mr-2" /> Tolak
                    </button>
                  </>
                )}
                {aff.status === 'ACTIVE' && (
                  <button 
                    onClick={() => handleUpdateStatus(aff.id, 'PENDING')}
                    className="text-xs font-bold text-slate-400 hover:text-orange-500 underline"
                  >
                    Kembalikan ke Pending
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
