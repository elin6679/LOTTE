import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Search, Play, Volume2, Mic2 } from 'lucide-react';
import { CHEER_SONGS } from '../lib/constants';

export const CheerLyrics: React.FC = () => {
  const [activeTeam, setActiveTeam] = useState(CHEER_SONGS[0].team);
  const [search, setSearch] = useState('');

  const currentTeamData = CHEER_SONGS.find(t => t.team === activeTeam);
  const filteredPlayers = currentTeamData?.players.filter(p => 
    p.name.includes(search)
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black italic">응원가 가사</h2>
          <p className="text-text-dim text-xs font-medium">떼창 필수! 선수별 응원가 한눈에</p>
        </div>
      </div>

      {/* Team Selection Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide py-2">
        {CHEER_SONGS.map((data) => (
          <button
            key={data.team}
            onClick={() => {
              setActiveTeam(data.team);
              setSearch('');
            }}
            className={`whitespace-nowrap px-6 py-3 rounded-full text-xs font-bold transition-all border ${
              activeTeam === data.team 
                ? 'bg-primary-brand border-primary-brand text-white shadow-lg shadow-primary-brand/20' 
                : 'bg-surface border-white/5 text-text-dim hover:text-white'
            }`}
          >
            {data.team}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="text-text-dim group-focus-within:text-accent-blue transition-colors" size={18} />
        </div>
        <input 
          type="text" 
          placeholder="선수 이름으로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface border border-white/5  rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-accent-blue/30 transition-all"
        />
      </div>

      {/* Content */}
      <div className="space-y-6 pb-10">
        <section className="bg-gradient-to-br from-surface to-bg p-6 rounded-[2rem] border border-white/10 relative overflow-hidden">
          <Music className="absolute -right-4 -bottom-4 text-white/5" size={100} />
          <div className="relative z-10">
            <h4 className="text-[10px] font-black uppercase text-accent-blue tracking-widest mb-2">Team Anthem</h4>
            <h3 className="text-xl font-bold mb-3">{currentTeamData?.teamSong}</h3>
            {currentTeamData?.teamSongUrl ? (
              <a 
                href={currentTeamData.teamSongUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[10px] font-bold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-colors"
              >
                <Play size={12} fill="currentColor" /> 듣기 바로가기
              </a>
            ) : (
              <button className="flex items-center gap-2 text-[10px] font-bold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-colors opacity-50 cursor-not-allowed">
                <Play size={12} fill="currentColor" /> 듣기 준비 중
              </button>
            )}
          </div>
        </section>

        <div className="grid gap-4">
          <h4 className="text-[10px] font-black uppercase text-text-dim tracking-widest px-2">Player Songs</h4>
          {filteredPlayers.map((player) => (
            <motion.div 
              layout
              key={player.name}
              className="bg-surface p-6 rounded-3xl border border-white/5 group hover:border-primary-brand/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-light rounded-xl flex items-center justify-center text-primary-brand">
                    <Mic2 size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg">{player.name} 응원가</h5>
                    <p className="text-[10px] text-accent-blue font-bold tracking-widest uppercase">{activeTeam}</p>
                  </div>
                </div>
                <button className="text-text-dim hover:text-white transition-colors">
                  <Volume2 size={18} />
                </button>
              </div>
              <div className="bg-bg/50 p-5 rounded-2xl border border-white/5">
                <p className="text-sm leading-relaxed text-text-main font-medium whitespace-pre-wrap italic">
                  "{player.lyrics}"
                </p>
              </div>
            </motion.div>
          ))}

          {filteredPlayers.length === 0 && (
            <div className="py-20 text-center opacity-30 italic text-sm">해당 선수의 응원가가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};
