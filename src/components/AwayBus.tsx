import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  orderBy, 
  serverTimestamp,
  deleteDoc,
  doc,
  where
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, MapPin, Bus, Send, Calendar, Users, Info, DollarSign } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { useAuth } from '../lib/AuthContext';

interface BusPost {
  id: string;
  uid: string;
  authorName: string;
  authorPhoto: string;
  departure: string;
  destination: string;
  date: string;
  time: string;
  cost: string;
  totalSeats: number;
  remainingSeats: number;
  content: string;
  createdAt: any;
}

export const AwayBus: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BusPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [myRequests, setMyRequests] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'busRequests'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mapping: Record<string, string> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        mapping[data.busId] = data.status;
      });
      setMyRequests(mapping);
    });
    return unsubscribe;
  }, [user]);

  // Form State
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [cost, setCost] = useState('');
  const [totalSeats, setTotalSeats] = useState(45);
  const [content, setContent] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'busPosts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BusPost[];
      setPosts(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'busPosts');
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (deletingId) {
      const timer = setTimeout(() => setDeletingId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [deletingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'busPosts'), {
        uid: user.uid,
        authorName: user.displayName || '익명의 팬',
        authorPhoto: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
        departure,
        destination,
        date,
        time,
        cost,
        totalSeats,
        remainingSeats: totalSeats,
        content,
        createdAt: serverTimestamp()
      });
      setShowForm(false);
      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'busPosts');
    }
  };

  const resetForm = () => {
    setDeparture('');
    setDestination('');
    setDate('');
    setTime('');
    setCost('');
    setTotalSeats(45);
    setContent('');
  };

  const handleDelete = async (postId: string, authorUid: string) => {
    if (!user || user.uid !== authorUid) return;
    
    if (deletingId !== postId) {
      setDeletingId(postId);
      return;
    }

    try {
      await deleteDoc(doc(db, 'busPosts', postId));
      setDeletingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'busPosts');
    }
  };

  const handleJoin = async (busId: string) => {
    if (!user) return;
    if (myRequests[busId]) {
      alert('이미 신청한 버스입니다.');
      return;
    }

    try {
      await addDoc(collection(db, 'busRequests'), {
        busId,
        uid: user.uid,
        userName: user.displayName || '익명팬',
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert('탑승 신청이 완료되었습니다! 마이페이지에서 확인 가능합니다.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'busRequests');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black italic text-primary-brand flex items-center gap-2">
            <Bus size={28} strokeWidth={3} /> 원정 응원 버스
          </h2>
          <p className="text-text-dim text-xs font-medium">함께 모여 떠나는 신나는 원정 길</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-primary-brand text-white p-3 rounded-xl shadow-lg shadow-primary-brand/20 hover:scale-105 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-bg/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-surface w-full max-w-md rounded-3xl border border-white/10 shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Bus className="text-primary-brand" size={24} /> 버스 모집하기
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">출발지</label>
                    <input 
                      type="text" 
                      placeholder="예: 잠실역"
                      value={departure} 
                      onChange={(e) => setDeparture(e.target.value)}
                      className="w-full bg-bg border border-white/5 rounded-xl p-3 text-sm focus:border-primary-brand transition-colors outline-none" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">목적지 (구장)</label>
                    <input 
                      type="text" 
                      placeholder="예: 사직 야구장"
                      value={destination} 
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full bg-bg border border-white/5 rounded-xl p-3 text-sm focus:border-primary-brand transition-colors outline-none" 
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">날짜</label>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-bg border border-white/5 rounded-xl p-3 text-sm focus:border-primary-brand transition-colors outline-none" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">출발 시간</label>
                    <input 
                      type="time" 
                      value={time} 
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-bg border border-white/5 rounded-xl p-3 text-sm focus:border-primary-brand transition-colors outline-none" 
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">참가비 (1인)</label>
                    <input 
                      type="text" 
                      placeholder="예: 30,000원"
                      value={cost} 
                      onChange={(e) => setCost(e.target.value)}
                      className="w-full bg-bg border border-white/5 rounded-xl p-3 text-sm focus:border-primary-brand transition-colors outline-none" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">총 좌석 수</label>
                    <input 
                      type="number" 
                      value={totalSeats} 
                      onChange={(e) => setTotalSeats(parseInt(e.target.value))}
                      className="w-full bg-bg border border-white/5 rounded-xl p-3 text-sm focus:border-primary-brand transition-colors outline-none" 
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">추가 안내 사항</label>
                  <textarea 
                    rows={3}
                    placeholder="준비물, 간식 제공 여부, 취소 규정 내용 등을 적어주세요."
                    value={content} 
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-bg border border-white/5 rounded-xl p-4 text-sm focus:border-primary-brand transition-colors outline-none resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-white/5 py-4 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
                  >
                    취소
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-primary-brand py-4 rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-primary-brand/20"
                  >
                    모집 시작
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-4 pb-24">
        {loading ? (
          <div className="py-20 text-center text-text-dim text-sm italic animate-pulse">원정 버스 목록을 불러오는 중...</div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center bg-surface rounded-3xl border border-white/5 border-dashed">
            <Bus className="mx-auto text-text-dim/20 mb-4" size={48} />
            <p className="text-text-dim text-sm">현재 모집 중인 원정 버스가 없습니다.<br/>직접 버스 모집을 시작해보세요!</p>
          </div>
        ) : (
          posts.map(post => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={post.id}
              className="bg-surface rounded-3xl border border-white/5 overflow-hidden hover:border-primary-brand/30 transition-all group relative"
            >
              {/* Route Indicator */}
              <div className="bg-primary-brand/5 p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-primary-brand text-white p-2 rounded-lg">
                    <Bus size={18} />
                  </div>
                  <div className="flex items-center gap-3 font-bold">
                    <span className="text-lg">{post.departure}</span>
                    <span className="text-primary-brand">→</span>
                    <span className="text-lg">{post.destination}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${post.remainingSeats > 0 ? 'bg-accent-blue text-white' : 'bg-surface-light text-text-dim'}`}>
                    {post.remainingSeats > 0 ? `${post.remainingSeats}석 남음` : '매진'}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.authorPhoto} 
                      alt={post.authorName} 
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-sm font-bold">{post.authorName}</div>
                      <div className="text-[10px] text-text-dim font-bold tracking-widest uppercase">총대장 팬</div>
                    </div>
                  </div>
                  {user?.uid === post.uid && (
                    <button 
                      onClick={() => handleDelete(post.id, post.uid)}
                      className={`transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                        deletingId === post.id 
                          ? 'bg-primary-brand text-white border-white/20 scale-105 shadow-lg' 
                          : 'text-text-dim hover:text-primary-brand border-transparent hover:border-white/5'
                      }`}
                    >
                      <Trash2 size={16} />
                      {deletingId === post.id && (
                        <span className="text-[10px] font-black uppercase tracking-tight">정말 삭제?</span>
                      )}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 bg-bg/50 rounded-2xl p-4 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-primary-brand" size={16} />
                    <div className="text-xs font-bold">{post.date} ({post.time})</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-primary-brand" size={16} />
                    <div className="text-xs font-bold">{post.cost}</div>
                  </div>
                </div>

                <p className="text-sm text-text-dim leading-relaxed mb-6 line-clamp-2 italic">
                  "{post.content}"
                </p>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleJoin(post.id)}
                    disabled={!!myRequests[post.id] || post.remainingSeats === 0}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      myRequests[post.id] 
                        ? 'bg-surface-light text-text-dim cursor-default' 
                        : post.remainingSeats === 0 
                        ? 'bg-bg text-text-dim cursor-not-allowed'
                        : 'bg-primary-brand text-white hover:brightness-110 shadow-lg shadow-primary-brand/20'
                    }`}
                  >
                    <Bus size={14} /> 
                    {myRequests[post.id] === 'approved' ? '예약 완료' : 
                     myRequests[post.id] === 'pending' ? '승인 대기 중' : 
                     post.remainingSeats === 0 ? '매진' : '탑승 신청하기'}
                  </button>
                  <button className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-text-dim hover:text-white transition-colors">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
