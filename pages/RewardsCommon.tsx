
import React from 'react';
import { Voucher } from '../types';
import { Ticket, Clock, CheckCircle } from 'lucide-react';

export const VoucherCard: React.FC<{ voucher: Voucher, onClaim?: () => void }> = ({ voucher, onClaim }) => (
  <div className={`relative bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row ${voucher.isClaimed ? 'opacity-75' : ''}`}>
    <div className="md:w-32 bg-orange-50 flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-100 border-dashed">
      <div className="text-center">
        <Ticket className="mx-auto text-orange-600 mb-1" size={32} />
        <span className="text-xs font-bold text-orange-700">{voucher.discount}</span>
      </div>
    </div>
    <div className="p-5 flex-1 flex flex-col justify-between">
      <div>
        <h4 className="font-bold text-slate-800 mb-1">{voucher.title}</h4>
        <div className="flex items-center text-xs text-slate-500 mb-3">
          <Clock size={12} className="mr-1" />
          Berakhir: {voucher.expiry}
        </div>
        <p className="text-xs text-slate-400">Min. Belanja {voucher.minSpend.toLocaleString()} pts</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
          {voucher.code}
        </span>
        {voucher.isClaimed ? (
          <span className="flex items-center text-orange-600 text-xs font-bold uppercase tracking-widest">
            <CheckCircle size={14} className="mr-1" /> Terklaim
          </span>
        ) : (
          <button 
            onClick={onClaim}
            className="bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors"
          >
            Klaim
          </button>
        )}
      </div>
    </div>
  </div>
);
