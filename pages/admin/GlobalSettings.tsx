
import React, { useState, useEffect } from 'react';
import { WEB_APP_URL } from '../../constants';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Info,
  ShieldCheck,
  Zap,
  Globe,
  Users
} from 'lucide-react';

const AdminGlobalSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'getGlobalSettings' }),
      });
      const result = await response.json();
      if (result.success) {
        setSettings(result.data || {});
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateSetting = async (key: string, value: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'updateGlobalSetting', key, value }),
      });
      const result = await response.json();
      if (result.success) {
        setSettings(prev => ({ ...prev, [key]: value }));
      }
    } catch (error) {
      alert("Gagal memperbarui pengaturan.");
    } finally {
      setIsSaving(false);
    }
  };

  const settingsConfig = [
    { key: 'app_name', label: 'Nama Aplikasi', description: 'Nama yang muncul di brand dashboard.', icon: <Globe size={20} /> },
    { key: 'min_redeem_points', label: 'Minimum Point Redeem', description: 'Jumlah poin minimal untuk penukaran voucher.', icon: <Zap size={20} /> },
    { key: 'affiliate_referral_base_points', label: 'Base Poin Referral', description: 'Nilai dasar poin untuk perhitungan komisi referral.', icon: <Zap size={20} /> },
    { key: 'affiliate_level_pro_min_downlines', label: 'Min Downline Level Pro', description: 'Jumlah minimal downline agar affiliate naik ke level Pro.', icon: <Users size={20} /> },
    { key: 'affiliate_level_elite_min_downlines', label: 'Min Downline Level Elite', description: 'Jumlah minimal downline agar affiliate naik ke level Elite.', icon: <Users size={20} /> },
    { key: 'affiliate_commission_rate_starter', label: 'Rate Komisi Starter (%)', description: 'Persentase komisi untuk level Starter.', icon: <ShieldCheck size={20} /> },
    { key: 'affiliate_commission_rate_pro', label: 'Rate Komisi Pro (%)', description: 'Persentase komisi untuk level Pro.', icon: <ShieldCheck size={20} /> },
    { key: 'affiliate_commission_rate_elite', label: 'Rate Komisi Elite (%)', description: 'Persentase komisi untuk level Elite.', icon: <ShieldCheck size={20} /> },
    { key: 'affiliate_commission_rate', label: 'Rate Komisi Global Fallback (%)', description: 'Dipakai jika rate khusus level belum diisi.', icon: <ShieldCheck size={20} /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pengaturan Sistem</h1>
          <p className="text-slate-500 font-medium">Konfigurasi parameter global NgolabHub.</p>
        </div>
        <button onClick={fetchSettings} className="p-3 bg-white border border-slate-100 rounded-2xl text-orange-600 hover:bg-orange-50 transition-all shadow-sm">
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {settingsConfig.map((item) => (
          <div key={item.key} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-8">
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-black text-slate-900 text-lg mb-1">{item.label}</h4>
              <p className="text-sm text-slate-400 font-medium">{item.description}</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input 
                type="text" 
                className="flex-1 md:w-64 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-50 focus:border-orange-600 outline-none transition-all font-bold text-slate-900"
                value={settings[item.key] || ''}
                onChange={e => setSettings(prev => ({ ...prev, [item.key]: e.target.value }))}
              />
              <button 
                onClick={() => handleUpdateSetting(item.key, settings[item.key])}
                disabled={isSaving}
                className="p-3.5 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 disabled:opacity-50"
              >
                <Save size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-start space-x-4">
        <Info className="text-orange-500 shrink-0" size={24} />
        <div>
          <p className="font-bold text-sm mb-1 uppercase tracking-widest text-orange-400">Peringatan Mode Admin</p>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            Perubahan pada pengaturan ini akan berdampak langsung ke seluruh pengguna aplikasi. Gunakan dengan bijak.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminGlobalSettings;
