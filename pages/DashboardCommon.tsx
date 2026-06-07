import React from 'react';
import { Gamepad2, Info } from 'lucide-react';
import { GAMIFICATION_LINK } from '../constants';

export const PlayGameCard: React.FC = () => (
  <div className="bg-gradient-to-br from-orange-600 to-amber-700 rounded-2xl p-6 text-white overflow-hidden relative group">
    <div className="relative z-10">
      <h3 className="text-xl font-bold mb-2">Mainkan Game Seru!</h3>
      <p className="text-orange-100 text-sm mb-4">Dapatkan kesempatan memenangkan poin tambahan setiap hari.</p>
      <a 
        href={GAMIFICATION_LINK} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center bg-white text-orange-600 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-orange-50 transition-colors"
      >
        <Gamepad2 className="mr-2" size={18} />
        Mulai Main
      </a>
    </div>
    <div className="absolute -right-10 -bottom-10 opacity-20 transition-transform group-hover:scale-110 duration-500">
      <Gamepad2 size={160} />
    </div>
  </div>
);

export const MenuRecommendationCard: React.FC<{ menu: any }> = ({ menu }) => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="h-40 overflow-hidden relative">
      <img src={menu.image} alt={menu.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute top-2 right-2 bg-orange-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
        Promo
      </div>
      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-slate-800 border border-slate-100">
        {menu.price.toLocaleString()} Poin
      </div>
    </div>
    <div className="p-4">
      <h4 className="font-bold text-slate-800 line-clamp-1">{menu.name}</h4>
      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{menu.description}</p>
      <button 
        className="mt-4 flex items-center justify-center w-full py-2 bg-orange-50 text-orange-600 rounded-xl text-sm font-bold hover:bg-orange-600 hover:text-white transition-all"
      >
        Lihat Detail <Info size={14} className="ml-2" />
      </button>
    </div>
  </div>
);
