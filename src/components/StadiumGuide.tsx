import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Info, Utensils, Star, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { STADIUMS } from '../lib/constants';

export const StadiumGuide: React.FC = () => {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredStadiums = STADIUMS.filter(s => 
    s.name.includes(search) || s.team.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black italic">구장 가이드</h2>
          <p className="text-text-dim text-xs font-medium">전국 10개 구장 시야 & 맛집</p>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="text-text-dim group-focus-within:text-primary-brand transition-colors" size={18} />
        </div>
        <input 
          type="text" 
          placeholder="구장 이름 또는 팀명으로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-primary-brand/30 transition-all shadow-xl"
        />
      </div>

      <div className="space-y-4">
        {filteredStadiums.map((stadium) => (
          <motion.div 
            layout
            key={stadium.id}
            className={`bg-surface border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-500 ${expandedId === stadium.id ? 'shadow-2xl ring-1 ring-primary-brand/20' : ''}`}
          >
            <div 
              onClick={() => setExpandedId(expandedId === stadium.id ? null : stadium.id)}
              className="p-6 cursor-pointer flex justify-between items-center"
            >
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 bg-surface-light rounded-2xl flex items-center justify-center text-primary-brand">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold tracking-tight">{stadium.name}</h4>
                  <p className="text-[11px] text-accent-blue font-bold uppercase tracking-widest">{stadium.team}</p>
                </div>
              </div>
              <div className="text-text-dim">
                {expandedId === stadium.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            <AnimatePresence>
              {expandedId === stadium.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-8 space-y-6"
                >
                  <div className="h-px bg-white/5" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="space-y-3">
                      <h5 className="flex items-center gap-2 text-primary-brand font-bold text-xs uppercase tracking-widest">
                        <Utensils size={14} /> 대표 먹거리
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {stadium.food.map(f => (
                          <span key={f} className="px-3 py-1.5 bg-bg border border-white/5 rounded-full text-[11px] font-medium text-text-main shadow-sm">
                            {f}
                          </span>
                        ))}
                      </div>
                    </section>
                    
                    <section className="space-y-3">
                      <h5 className="flex items-center gap-2 text-accent-blue font-bold text-xs uppercase tracking-widest">
                        <Star size={14} /> 직관 팁
                      </h5>
                      <p className="text-xs text-text-dim leading-relaxed bg-bg p-4 rounded-2xl border border-white/5 italic">
                        "{stadium.tip}"
                      </p>
                    </section>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-xl text-[11px] font-bold transition-all uppercase tracking-widest cursor-not-allowed opacity-50">좌석 시야 보기</button>
                    {stadium.wayToComeUrl ? (
                      <a 
                        href={stadium.wayToComeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-primary-brand py-4 rounded-xl text-[11px] font-bold transition-all uppercase tracking-widest shadow-lg shadow-primary-brand/20 text-center"
                      >
                        가는 길 찾기
                      </a>
                    ) : (
                      <button className="flex-1 bg-primary-brand py-4 rounded-xl text-[11px] font-bold transition-all uppercase tracking-widest shadow-lg shadow-primary-brand/20 opacity-50 cursor-not-allowed">
                        가는 길 찾기
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {filteredStadiums.length === 0 && (
          <div className="py-20 text-center opacity-30 italic text-sm">해당 검색어와 일치하는 구장이 없습니다.</div>
        )}
      </div>
    </div>
  );
};
