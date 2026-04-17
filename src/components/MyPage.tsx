import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { User, Heart, Settings, Bus, ChevronRight, LogOut, ShieldCheck } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

const TEAMS = [
  'LG 트윈스', 'SSG 랜더스', '두산 베어스', 'KIA 타이거즈', '삼성 라이온즈',
  '롯데 자이언츠', 'NC 다이노스', '한화 이글스', '키움 히어로즈', 'KT 위즈'
];

export const MyPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [busRequests, setBusRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'busRequests'),
      where('uid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBusRequests(requests);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'busRequests');
    });

    return unsubscribe;
  }, [user]);

  const updateFavoriteTeam = async (team: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        favoriteTeam: team
      });
      setShowTeamModal(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Profile Card */}
      <section className="bg-surface rounded-3xl p-8 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <User size={120} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 text-center md:text-left">
          <img 
            src={profile?.photoURL || 'https://picsum.photos/seed/kbo/200/200'}
            alt="profile"
            className="w-24 h-24 rounded-3xl border-4 border-white/10 shadow-2xl object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic">{profile?.displayName || '팬'}님</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="bg-primary-brand/10 text-primary-brand px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-primary-brand/20">
                <Heart size={12} className="fill-primary-brand" /> {profile?.favoriteTeam || '선호 팀 미설정'}
              </span>
              <span className="bg-accent-blue/10 text-accent-blue px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">
                매너온도 {profile?.mannerTemperature || 36.5}℃
              </span>
            </div>
          </div>
          <button 
            onClick={() => setShowTeamModal(true)}
            className="md:ml-auto p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/5"
          >
            <Settings size={20} className="text-text-dim" />
          </button>
        </div>
      </section>

      {/* Stats Summary - Simple list */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface p-6 rounded-2xl border border-white/5">
          <div className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-1">참여 중인 원정버스</div>
          <div className="text-2xl font-black italic">{busRequests.length}개</div>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-white/5">
          <div className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-1">인증 배지</div>
          <div className="text-2xl font-black italic flex items-center gap-2">
             <ShieldCheck className="text-accent-blue" size={24} /> 2개
          </div>
        </div>
      </div>

      {/* Applied Buses List */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold px-2 flex items-center gap-2 text-primary-brand">
          <Bus size={20} /> 나의 원정버스 신청 내역
        </h3>
        
        {loading ? (
          <div className="p-10 text-center animate-pulse text-text-dim">로딩 중...</div>
        ) : busRequests.length === 0 ? (
          <div className="bg-surface p-12 rounded-3xl border border-white/5 border-dashed text-center flex flex-col items-center gap-3">
            <Bus className="text-text-dim/20" size={48} />
            <p className="text-text-dim text-sm italic">아직 신청한 원정버스가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {busRequests.map(req => (
              <div key={req.id} className="bg-surface p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4">
                   <div className={`w-2 h-2 rounded-full ${req.status === 'approved' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : req.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                   <div>
                     <div className="text-sm font-bold">버스 예약 #{req.id.slice(-4)}</div>
                     <p className="text-[10px] text-text-dim font-medium">상태: {req.status === 'approved' ? '승인됨 (예약 완료)' : req.status === 'pending' ? '승인 대기 중' : '거절됨'}</p>
                   </div>
                </div>
                <ChevronRight className="text-text-dim group-hover:text-white transition-colors" size={16} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Team Selection Modal */}
      <AnimatePresence>
        {showTeamModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-surface w-full max-w-sm rounded-[2.5rem] border border-white/10 shadow-2xl p-8"
            >
              <h3 className="text-xl font-black mb-6 text-center italic">나의 응원 팀 설정</h3>
              <div className="grid grid-cols-2 gap-2">
                {TEAMS.map(team => (
                  <button
                    key={team}
                    onClick={() => updateFavoriteTeam(team)}
                    className={`p-3 rounded-2xl text-[11px] font-black transition-all ${
                      profile?.favoriteTeam === team 
                        ? 'bg-primary-brand text-white shadow-lg' 
                        : 'bg-white/5 hover:bg-white/10 text-text-dim hover:text-white'
                    }`}
                  >
                    {team}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setShowTeamModal(false)}
                className="w-full mt-6 py-4 text-xs font-bold text-text-dim hover:text-white transition-colors"
              >
                닫기
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
