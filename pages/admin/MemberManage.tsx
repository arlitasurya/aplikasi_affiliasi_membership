
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { WEB_APP_URL } from '../../constants';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  RefreshCw
} from 'lucide-react';

const AdminMemberManage: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'getAllMembers' }), // Note: I need to add this to google.gs
      });
      const result = await response.json();
      if (result.success) {
        setMembers(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Member</h1>
          <p className="text-slate-500 font-medium">Kelola seluruh pengguna terdaftar di NgolabHub.</p>
        </div>
        <button onClick={fetchMembers} className="p-3 bg-white border border-slate-100 rounded-2xl text-orange-600 hover:bg-orange-50 transition-all shadow-sm">
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari nama atau email..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-50 focus:border-orange-600 outline-none transition-all font-bold"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-slate-600 font-bold flex items-center hover:bg-slate-50">
          <Filter size={20} className="mr-2" /> Filter
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User ID</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama & Email</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center font-bold text-slate-400">Memuat data...</td></tr>
              ) : filteredMembers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center font-bold text-slate-400">Tidak ada member ditemukan.</td></tr>
              ) : filteredMembers.map(member => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 font-mono text-xs text-slate-400 font-bold">{member.id}</td>
                  <td className="px-6 py-5">
                    <div>
                      <p className="font-bold text-slate-800">{member.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{member.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                      member.role === 'ADMIN' ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {member.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                      member.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-slate-400 hover:text-orange-600 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMemberManage;
