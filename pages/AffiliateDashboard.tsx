import React, { useState, useEffect } from 'react';
import { User, Copy, Share2, TrendingUp, Users, Award, ArrowLeft } from 'lucide-react';
import { User as UserType } from '../types';

interface AffiliateDashboardProps {
  user: UserType;
  onBack: () => void;
}

const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ user, onBack }) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const copyReferralCode = () => {
    if (user.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const shareReferral = () => {
    const message = `Bergabunglah dengan NgolabHub sebagai member affiliate! Gunakan kode referral saya: ${user.referralCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'NgolabHub Affiliate',
        text: message,
        url: window.location.href
      });
    } else {
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-orange-200 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-orange-700" />
        </button>
        <h1 className="text-3xl font-bold text-orange-900">Affiliate Dashboard</h1>
      </div>

      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-[2.5rem] shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 p-4 rounded-full">
            <User size={40} />
          </div>
          <div>
            <p className="text-orange-100">Selamat datang,</p>
            <h2 className="text-2xl font-bold">{user.name}</h2>
          </div>
        </div>
        <p className="text-orange-50 mt-2">Anda telah resmi menjadi <span className="font-bold">MEMBER AFFILIATE</span> NgolabHub! 🎉</p>
      </div>

      {/* Referral Code Section */}
      <div className="bg-white rounded-[2.5rem] shadow-lg p-8 mb-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Award size={24} className="text-orange-600" />
          Kode Referral Anda
        </h3>
        
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 mb-4">
          <p className="text-slate-600 text-sm mb-2">Bagikan kode ini ke teman:</p>
          <div className="flex items-center gap-3">
            <code className="text-2xl font-mono font-bold text-orange-600 flex-1">
              {user.referralCode || 'N/A'}
            </code>
            <button
              onClick={copyReferralCode}
              className="p-3 hover:bg-orange-200 rounded-lg transition-colors"
              title="Copy referral code"
            >
              <Copy size={24} className={copiedCode ? 'text-green-600' : 'text-orange-600'} />
            </button>
          </div>
          {copiedCode && <p className="text-green-600 text-sm mt-2">✓ Kode disalin!</p>}
        </div>

        <button
          onClick={shareReferral}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Share2 size={20} />
          Bagikan Kode Referral
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Downlines */}
        <div className="bg-white rounded-[2.5rem] shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
            <h4 className="font-bold text-slate-900">Downline Anda</h4>
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-2">0</p>
          <p className="text-slate-600 text-sm">Teman yang bergabung via kode Anda</p>
        </div>

        {/* Commission */}
        <div className="bg-white rounded-[2.5rem] shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            <h4 className="font-bold text-slate-900">Komisi Anda</h4>
          </div>
          <p className="text-3xl font-bold text-green-600 mb-2">
            Rp {(user.commissionPoints || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-slate-600 text-sm">Total komisi yang diterima</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-[2.5rem] shadow-lg p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Fitur Affiliate Anda</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl">
            <div className="text-2xl">🎁</div>
            <div>
              <h4 className="font-bold text-slate-900">Dapatkan Komisi</h4>
              <p className="text-slate-600 text-sm">Setiap orang yang bergabung via kode Anda akan memberi Anda komisi</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl">📊</div>
            <div>
              <h4 className="font-bold text-slate-900">Monitor Penjualan</h4>
              <p className="text-slate-600 text-sm">Lihat statistik downline dan komisi real-time</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
            <div className="text-2xl">🚀</div>
            <div>
              <h4 className="font-bold text-slate-900">Kembangkan Jaringan</h4>
              <p className="text-slate-600 text-sm">Semakin banyak downline, semakin besar penghasilan Anda</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
            <div className="text-2xl">💳</div>
            <div>
              <h4 className="font-bold text-slate-900">Withdraw Komisi</h4>
              <p className="text-slate-600 text-sm">Tarik komisi Anda kapan saja ke rekening bank</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4">
        <p className="text-blue-900 text-sm">
          <strong>💡 Tips:</strong> Bagikan kode referral Anda ke media sosial, grup WhatsApp, atau teman-teman untuk mulai mendapatkan komisi!
        </p>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
