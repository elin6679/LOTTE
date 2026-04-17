import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Layout, Circle as BallIcon, MapPin, Users, Calendar, Utensils, Zap, ChevronRight, LogOut, Info, Share2, MessageSquare, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './lib/AuthContext';
import { Diary } from './components/Diary';
import { StadiumGuide } from './components/StadiumGuide';
import { CheerLyrics } from './components/CheerLyrics';
import { MateFinder } from './components/MateFinder';
import { FancamFeed } from './components/FancamFeed';
import { AwayBus } from './components/AwayBus';
import { MyPage } from './components/MyPage';

export default function App() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0, total: 0, rate: 0 });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'diaries'),
      where('uid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => doc.data());
      const wins = records.filter(r => r.result === 'win').length;
      const losses = records.filter(r => r.result === 'loss').length;
      const draws = records.filter(r => r.result === 'draw').length;
      const total = records.length;
      const rate = total > 0 ? (wins / total) * 100 : 0;

      setStats({ wins, losses, draws, total, rate });
    });

    return unsubscribe;
  }, [user]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = () => auth.signOut();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg text-text-main">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <BallIcon className="w-12 h-12 text-primary-brand" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 bg-bg text-text-main text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#1E2945_0%,transparent_70%)] opacity-30 pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md relative z-10"
        >
          <BallIcon className="w-20 h-20 text-primary-brand mx-auto mb-6 drop-shadow-[0_0_15px_rgba(230,57,70,0.5)]" />
          <h1 className="text-5xl font-extrabold mb-4 tracking-tighter">직관<span>메이트</span></h1>
          <p className="text-text-dim mb-8 leading-relaxed text-lg">
            대한민국 야구 팬들을 위한 가장 우아한 커뮤니티.<br/>
            어디서든 즐거운 직관 문화를 선도합니다.
          </p>
          <button
            onClick={login}
            className="w-full bg-primary-brand text-white font-bold py-5 px-6 rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-2xl shadow-primary-brand/20"
          >
            <Zap className="w-5 h-5 fill-current" />
            구글로 1초만에 시작하기
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-24 min-h-screen bg-bg text-text-main">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-white/5 px-6 lg:px-10 py-5 flex justify-between items-center">
        <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
          직관<span className="text-primary-brand">메이트</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-bold leading-none mb-1">{profile?.displayName || '최강팬'}님</div>
            <div className="text-[10px] text-accent-blue font-semibold">매너온도 {profile?.mannerTemperature || 36.5}℃</div>
          </div>
          <motion.img 
            whileHover={{ scale: 1.1 }}
            onClick={() => setActiveTab('mypage')}
            src={profile?.photoURL || 'https://picsum.photos/seed/kbo/100/100'} 
            alt="profile" 
            className="w-10 h-10 rounded-xl border-2 border-white/10 object-cover cursor-pointer"
          />
          <button 
            onClick={logout}
            className="p-2 text-text-dim hover:text-primary-brand transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 lg:px-10 py-8 lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {/* Today's Live Match Card */}
              <section className="relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-surface-light to-bg opacity-100 rounded-[2rem] border border-white/10" />
                <div className="relative p-8 flex flex-col gap-6">
                  <div className="flex justify-between items-center text-xs font-bold text-text-dim uppercase tracking-widest">
                    <span>2026.04.17 (금) 18:30</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} /> 잠실 야구장</span>
                  </div>
                  
                  <div className="grid grid-cols-3 items-center text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-bg font-black text-2xl shadow-xl shadow-white/5">LG</div>
                      <div className="font-bold text-sm">LG 트윈스</div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                      <motion.div 
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="bg-primary-brand px-3 py-1 rounded-full text-[10px] font-black"
                      >
                        LIVE
                      </motion.div>
                      <div className="text-5xl font-black tracking-widest italic">4 : 2</div>
                      <div className="text-[10px] text-text-dim">현재 5회말 공격 중</div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-bg font-black text-2xl shadow-xl shadow-white/5">SSG</div>
                      <div className="font-bold text-sm">SSG 랜더스</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Feature Selection Grid */}
              <section className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <FeatureCard 
                  icon="🤝"
                  title="직관 메이트"
                  desc="응원 스타일이 맞는 단짝 매칭"
                  onClick={() => setActiveTab('mate')}
                />
                <FeatureCard 
                  icon="🚌"
                  title="원정 버스"
                  desc="함께 떠나는 원정 응원 여행"
                  onClick={() => setActiveTab('bus')}
                />
                <FeatureCard 
                  icon="🏟️"
                  title="구장 가이드"
                  desc="좌석 시야부터 구장 맛집까지"
                  onClick={() => setActiveTab('guide')}
                />
                <FeatureCard 
                  icon="📸"
                  title="직캠 커뮤"
                  desc="생생한 현장 명장면 공유"
                  onClick={() => setActiveTab('cam')}
                />
                <FeatureCard 
                  icon="📣"
                  title="응원가 가사"
                  desc="전 구단 떼창 필수템 모음"
                  onClick={() => setActiveTab('cheer')}
                />
                <FeatureCard 
                  icon="🗓️"
                  title="직관 일기"
                  desc="승리의 역사 기록 관리"
                  onClick={() => setActiveTab('diary')}
                />
              </section>
            </motion.div>
          )}

          {activeTab === 'diary' && (
            <motion.div
              key="diary"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Diary />
            </motion.div>
          )}

          {activeTab === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <StadiumGuide />
            </motion.div>
          )}

          {activeTab === 'cheer' && (
            <motion.div
              key="cheer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CheerLyrics />
            </motion.div>
          )}

          {activeTab === 'mate' && (
            <motion.div
              key="mate"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MateFinder />
            </motion.div>
          )}

          {activeTab === 'cam' && (
            <motion.div
              key="fancam"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <FancamFeed />
            </motion.div>
          )}

          {activeTab === 'bus' && (
            <motion.div
              key="bus"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AwayBus />
            </motion.div>
          )}

          {activeTab === 'mypage' && (
            <motion.div
              key="mypage"
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <MyPage />
            </motion.div>
          )}

          {activeTab !== 'home' && activeTab !== 'diary' && activeTab !== 'guide' && activeTab !== 'cheer' && activeTab !== 'mate' && activeTab !== 'cam' && activeTab !== 'bus' && activeTab !== 'mypage' && (
            <motion.div
              key="fallback"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center p-12 text-center h-[50vh] bg-surface rounded-[2rem] border border-white/5"
            >
              <Zap className="w-12 h-12 text-primary-brand mb-6 animate-bounce" />
              <h2 className="text-2xl font-black mb-3">준비 중인 기능입니다</h2>
              <p className="text-text-dim leading-relaxed max-w-xs mb-8">
                더욱 완벽한 직관 문화를 위해<br/>열심히 개발하고 있습니다!
              </p>
              <button 
                onClick={() => setActiveTab('home')}
                className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-xl text-sm font-bold transition-all"
              >
                메인으로 돌아가기
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar / Desktop Right Panel */}
        <aside className="mt-12 lg:mt-0 space-y-8">
          {/* Stats Summary */}
          <section className="bg-surface border-l-4 border-primary-brand p-6 rounded-2xl shadow-xl">
            <div className="text-text-dim text-sm font-semibold mb-2">2026 시즌 나의 승률</div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black italic">{stats.rate.toFixed(1)}</span>
              <span className="text-lg text-text-dim font-bold">%</span>
            </div>
            <div className="text-[11px] text-text-dim mt-2 font-medium">
              {stats.wins}승 {stats.losses}패 {stats.draws}무 (직관 {stats.total}회)
            </div>
            <div className="h-2 bg-bg rounded-full mt-4 overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.rate}%` }}
                className="h-full bg-primary-brand shadow-[0_0_10px_rgba(230,57,70,0.5)]"
              />
            </div>
          </section>

          {/* Quick Real-time List */}
          <section className="bg-surface p-6 rounded-3xl border border-white/5 flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">인기 메이트 모집</h3>
              <span className="text-xs text-accent-blue font-bold cursor-pointer hover:underline underline-offset-4">전체보기</span>
            </div>
            
            <div className="space-y-4">
              <MateCard color="#FF9F43" name="잠실나들이" tags="#LG #먹부림 #30대" msg="금요일 경기 치맥하실 분!" />
              <MateCard color="#54A0FF" name="홈런왕강백호" tags="#KT #열혈응원 #20대" msg="원정 응원석 1루 쪽 같이 가요!" />
              <MateCard color="#10AC84" name="야구조아" tags="#SSG #조용히관람" msg="혼자 가기 심심해서 모집해요~" />
            </div>
          </section>
        </aside>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-white/5 flex justify-center items-center h-20 gap-8 sm:gap-20 z-50">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Layout size={24} />} label="홈" />
        <NavButton active={activeTab === 'cam'} onClick={() => setActiveTab('cam')} icon={<Camera size={24} />} label="직캠" />
        <NavButton active={activeTab === 'mate'} onClick={() => setActiveTab('mate')} icon={<Users size={24} />} label="메이트" />
        <NavButton active={activeTab === 'diary'} onClick={() => setActiveTab('diary')} icon={<Calendar size={24} />} label="다이어리" />
        <NavButton active={activeTab === 'guide'} onClick={() => setActiveTab('guide')} icon={<MapPin size={24} />} label="가이드" />
      </nav>
    </div>
  );
}

function FeatureCard({ icon, title, desc, onClick }: { icon: string, title: string, desc: string, onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(30, 41, 69, 0.4)', borderColor: 'rgba(230, 57, 70, 0.4)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-surface p-5 rounded-2xl border border-white/5 text-left flex flex-col gap-3 transition-colors group"
    >
      <div className="text-3xl filter drop-shadow-md">{icon}</div>
      <div>
        <div className="font-bold text-sm tracking-tight group-hover:text-primary-brand transition-colors">{title}</div>
        <div className="text-[10px] text-text-dim font-medium leading-tight mt-1">{desc}</div>
      </div>
    </motion.button>
  );
}

function MateCard({ color, name, tags, msg }: { color: string, name: string, tags: string, msg: string }) {
  return (
    <motion.div 
      whileHover={{ x: 5 }}
      className="flex gap-4 p-3.5 bg-surface-light/50 rounded-2xl border border-white/5"
    >
      <div className="w-12 h-12 rounded-xl shrink-0 shadow-lg" style={{ backgroundColor: color }} />
      <div className="flex flex-col justify-center gap-1">
        <div className="text-sm font-bold leading-none">{name}</div>
        <div className="text-[10px] text-accent-blue font-bold tracking-tight">{tags}</div>
        <div className="text-[11px] text-text-dim line-clamp-1">{msg}</div>
      </div>
    </motion.div>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 px-4 transition-all relative ${active ? 'text-primary-brand' : 'text-text-dim hover:text-white'}`}
    >
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-60'}`}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="tab-indicator"
          className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary-brand shadow-[0_0_8px_rgba(230,57,70,0.8)]" 
        />
      )}
    </button>
  );
}
