
import { Transaction, PointLog } from '../types';
import { Calendar, ArrowDownLeft, ArrowUpRight, ShoppingBag, Zap } from 'lucide-react';

export const TransactionList: React.FC<{ transactions: Transaction[], pointLogs?: PointLog[] }> = ({ transactions, pointLogs = [] }) => {
  // Combine pointLogs and items that aren't duplicative if necessary,
  // but usually pointLogs will be the primary source of truth for point movements.
  // For transparency, we show both but differentiate them.
  
  const hasHistory = transactions.length > 0 || pointLogs.length > 0;

  return (
    <div className="space-y-6">
      {!hasHistory ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-medium">Belum ada riwayat transaksi.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Aktivitas Terbaru</h3>
          
          {/* Render Point Logs from Backend (Primary) */}
          {pointLogs.map((log) => (
            <div key={log.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  log.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {log.type === 'IN' ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm md:text-base">
                    {log.source}
                  </h4>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] mt-1.5">
                    {new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black text-base md:text-xl ${log.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {log.type === 'IN' ? '+' : '-'} {log.amount.toLocaleString('id-ID')}
                </p>
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">NGOLAB POIN</p>
              </div>
            </div>
          ))}

          {/* Render Transactions (Mock/Legacy if any) */}
          {transactions.map((t) => (
            <div key={t.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  t.type === 'COMMISSION' ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-600'
                }`}>
                  {t.type === 'COMMISSION' ? <Zap size={22} /> : <ShoppingBag size={22} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm md:text-base">
                    {t.description}
                  </h4>
                  {t.items && t.items.length > 0 && (
                    <p className="text-[10px] md:text-xs font-medium text-slate-400 mt-1 leading-relaxed">
                      {t.items.map(item => item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name).join(' • ')}
                    </p>
                  )}
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] mt-2">
                    {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black text-base md:text-xl ${t.type === 'COMMISSION' ? 'text-orange-600' : 'text-slate-900'}`}>
                  {t.type === 'COMMISSION' 
                    ? `+ ${t.amount.toLocaleString('id-ID')} pts` 
                    : t.type === 'PURCHASE' 
                      ? `Rp ${t.amount.toLocaleString('id-ID')}`
                      : `${t.amount.toLocaleString('id-ID')} pts`}
                </p>
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                  {t.type === 'PURCHASE' ? 'TRANSAKSI' : 'TRANSAKSI'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
