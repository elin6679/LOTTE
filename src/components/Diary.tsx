import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Calendar as CalIcon, MapPin, Trophy, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { useAuth } from '../lib/AuthContext';

interface DiaryEntry {
  id: string;
  date: string;
  stadium: string;
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  content: string;
  mvp?: string;
  emotion?: string;
}

export const Diary: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [stadium, setStadium] = useState('');
  const [opponent, setOpponent] = useState('');
  const [result, setResult] = useState<'win' | 'loss' | 'draw'>('win');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'diaries'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DiaryEntry[];
      setEntries(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'diaries');
    });

    return unsubscribe;
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'diaries'), {
        uid: user.uid,
        date,
        stadium,
        opponent,
        result,
        content,
        createdAt: serverTimestamp()
      });
      setShowForm(false);
      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'diaries');
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId !== id) {
      setDeletingId(id);
      return;
    }

    try {
      await deleteDoc(doc(db, 'diaries', id));
      setDeletingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'diaries');
    }
  };

  useEffect(() => {
    if (deletingId) {
      const timer = setTimeout(() => setDeletingId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [deletingId]);

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setStadium('');
    setOpponent('');
    setResult('win');
    setContent('');
  };

  const winRate = entries.length > 0 
    ? ((entries.filter(e => e.result === 'win').length / entries.length) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black italic">직관 다이어리</h2>
          <p className="text-text-dim text-xs font-medium">나의 야구 관전 기록</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-primary-brand text-white p-3 rounded-xl shadow-lg shadow-primary-brand/20 hover:scale-105 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Stats Mini Card */}
      <div className="bg-surface p-5 rounded-2xl border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-primary-brand/10 p-3 rounded-xl">
            <Trophy className="text-primary-brand" size={24} />
          </div>
          <div>
            <div className="text-[10px] text-text-dim font-bold uppercase tracking-widest">누적 승률</div>
            <div className="text-2xl font-black italic">{winRate}%</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-text-dim font-bold uppercase tracking-widest">총 직관</div>
          <div className="text-2xl font-black italic">{entries.length}회</div>
        </div>
      </div>

      {/* Entry Form Modal Overlay */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-bg/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface w-full max-w-md rounded-3xl border border-white/10 shadow-2xl p-8"
            >
              <h3 className="text-xl font-bold mb-6">새 직관 기록하기</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">경기 날짜</label>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-bg border border-white/5 rounded-xl p-3 text-sm focus:border-primary-brand transition-colors outline-none" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">경기장</label>
                    <input 
                      type="text" 
                      placeholder="예: 잠실"
                      value={stadium} 
                      onChange={(e) => setStadium(e.target.value)}
                      className="w-full bg-bg border border-white/5 rounded-xl p-3 text-sm focus:border-primary-brand transition-colors outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">상대 팀</label>
                  <input 
                    type="text" 
                    placeholder="예: SSG 랜더스"
                    value={opponent} 
                    onChange={(e) => setOpponent(e.target.value)}
                    className="w-full bg-bg border border-white/5 rounded-xl p-3 text-sm focus:border-primary-brand transition-colors outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">경기 결과</label>
                  <div className="flex gap-2">
                    {(['win', 'loss', 'draw'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setResult(r)}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all uppercase ${
                          result === r 
                            ? (r === 'win' ? 'bg-primary-brand text-white' : 'bg-surface-light text-white')
                            : 'bg-bg text-text-dim border border-white/5'
                        }`}
                      >
                        {r === 'win' ? '승리' : r === 'loss' ? '패배' : '무승부'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">관전 일기</label>
                  <textarea 
                    rows={4}
                    placeholder="오늘 경기 어땠나요?"
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
                    저장하기
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Diary List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-text-dim text-sm italic">기록을 불러오는 중...</div>
        ) : entries.length === 0 ? (
          <div className="py-20 text-center bg-surface rounded-3xl border border-white/5 border-dashed">
            <ImageIcon className="mx-auto text-text-dim/20 mb-4" size={48} />
            <p className="text-text-dim text-sm">아직 작성된 직관 일기가 없습니다.<br/>첫 관전 평을 남겨보세요!</p>
          </div>
        ) : (
          entries.map(entry => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={entry.id}
              className="bg-surface rounded-3xl border border-white/5 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg font-black text-xs uppercase ${
                      entry.result === 'win' ? 'bg-primary-brand text-white shadow-lg shadow-primary-brand/20' : 'bg-surface-light text-text-dim'
                    }`}>
                      {entry.result === 'win' ? 'Victory' : entry.result === 'loss' ? 'Lost' : 'Draw'}
                    </div>
                    <div className="text-xs font-bold opacity-50 tracking-widest">{entry.date}</div>
                  </div>
                  <button 
                    onClick={() => handleDelete(entry.id)}
                    className={`transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                      deletingId === entry.id 
                        ? 'bg-primary-brand text-white border-white/20' 
                        : 'text-text-dim hover:text-primary-brand border-transparent hover:border-white/5 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Trash2 size={16} />
                    {deletingId === entry.id && (
                      <span className="text-[10px] font-black uppercase tracking-tight">삭제?</span>
                    )}
                  </button>
                </div>

                <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-accent-blue">{entry.stadium}</span>
                  <span className="text-text-dim font-medium text-sm">vs</span>
                  <span>{entry.opponent}</span>
                </h4>

                <p className="text-sm text-text-dim leading-relaxed italic line-clamp-3">
                  "{entry.content}"
                </p>

                <div className="mt-5 flex gap-4 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-text-dim uppercase tracking-tighter">
                    <CalIcon size={12} /> {entry.date}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-text-dim uppercase tracking-tighter">
                    <MapPin size={12} /> {entry.stadium}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
