import { useState } from 'react';
import { Transaction, PointLog } from '../types';
import { Calendar, ArrowDownLeft, ArrowUpRight, ShoppingBag } from 'lucide-react';

export const TransactionList: React.FC<{ transactions: Transaction[], pointLogs?: PointLog[] }> = ({ transactions, pointLogs = [] }) => {
  const [filter, setFilter] = useState<'all' | 'transactions' | 'commission'>('all');

  const showTransactions = filter === 'all' || filter === 'transactions';
  const showCommission = filter === 'all' || filter === 'commission';
  const hasHistory = transactions.length > 0 || pointLogs.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100 w-fit">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'transactions', label: 'Transaksi' },
          { key: 'commission', label: 'Komisi' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              filter === tab.key
                ? 'bg-orange-600 text-white'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!hasHistory ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-medium">Belum ada riwayat transaksi.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {showCommission && (
            <section>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                Riwayat Komisi Referral
              </h3>

              {pointLogs.length === 0 ? (
                <p className="text-sm text-slate-400 bg-white rounded-2xl p-5">
                  Belum ada komisi referral.
                </p>
              ) : (
                <div className="space-y-4">
                  {pointLogs.map((log: any) => {
                    const date = log.date || log.created_at;
                    const amount = Number(log.amount ?? log.points ?? 0);
                    const title = log.source || log.note || 'Komisi Referral';

                    return (
                      <div key={log.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
                            <ArrowDownLeft size={22} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm md:text-base">{title}</h4>
                            {log.reference_id && (
                              <p className="text-[10px] md:text-xs font-medium text-slate-400 mt-1">
                                Ref: {log.reference_id}
                              </p>
                            )}
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] mt-1.5">
                              {date ? new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase() : '-'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-black text-base md:text-xl text-emerald-600">
                            + {amount.toLocaleString('id-ID')}
                          </p>
                          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                            KOMISI
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {showTransactions && (
            <section>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                Riwayat Transaksi KIOSK
              </h3>

              {transactions.length === 0 ? (
                <p className="text-sm text-slate-400 bg-white rounded-2xl p-5">
                  Belum ada transaksi KIOSK.
                </p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((t) => (
                    <div key={t.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 text-slate-600">
                          <ShoppingBag size={22} />
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
                        <p className="font-black text-base md:text-xl text-slate-900">
                          Rp {Number(t.amount || 0).toLocaleString('id-ID')}
                        </p>
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                          TRANSAKSI
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
};