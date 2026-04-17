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
  doc
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, MapPin, Users, Send, MessageSquare, Filter } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { useAuth } from '../lib/AuthContext';

interface MatePost {
  id: string;
  uid: string;
  authorName: string;
  authorPhoto: string;
  stadium: string;
  content: string;
  tags: string[];
  createdAt: any;
}

export const MateFinder: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<MatePost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [stadium, setStadium] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'matePosts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MatePost[];
      setPosts(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'matePosts');
    });

    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const tags = tagInput.split(',').map(t => t.trim()).filter(t => t !== '');

    try {
      await addDoc(collection(db, 'matePosts'), {
        uid: user.uid,
        authorName: user.displayName || '익명의 팬',
        authorPhoto: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
        stadium,
        content,
        tags,
        createdAt: serverTimestamp()
      });
      setShowForm(false);
      setStadium('');
      setContent('');
      setTagInput('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'matePosts');
    }
  };

  const handleDelete = async (postId: string, authorUid: string) => {
    if (!user || user.uid !== authorUid) return;
    
    if (deletingId !== postId) {
      setDeletingId(postId);
      return;
    }

    try {
      await deleteDoc(doc(db, 'matePosts', postId));
      setDeletingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'matePosts');
    }
  };

  useEffect(() => {
    if (deletingId) {
      const timer = setTimeout(() => setDeletingId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [deletingId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black italic">직관 메이트 찾기</h2>
          <p className="text-text-dim text-xs font-medium">함께 응원할 단짝을 구해보세요</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-accent-blue text-white p-3 rounded-xl shadow-lg shadow-accent-blue/20 hover:scale-105 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-bg/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface w-full max-w-md rounded-3xl border border-white/10 shadow-2xl p-8"
            >
              <h3 className="text-xl font-bold mb-6">메이트 모집하기</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">목표 구장</label>
                  <input 
                    type="text" 
                    placeholder="예: 잠실, 사직, 문학 등"
                    value={stadium} 
                    onChange={(e) => setStadium(e.target.value)}
                    className="w-full bg-bg border border-white/5 rounded-xl p-3 text-sm focus:border-accent-blue transition-colors outline-none" 
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">모집 내용</label>
                  <textarea 
                    rows={4}
                    placeholder="응원 스타일, 선호하는 좌석 등 내용을 적어주세요!"
                    value={content} 
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-bg border border-white/5 rounded-xl p-4 text-sm focus:border-accent-blue transition-colors outline-none resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">태그 (쉼표로 구분)</label>
                  <input 
                    type="text" 
                    placeholder="예: LG, 먹부림, 20대"
                    value={tagInput} 
                    onChange={(e) => setTagInput(e.target.value)}
                    className="w-full bg-bg border border-white/5 rounded-xl p-3 text-sm focus:border-accent-blue transition-colors outline-none" 
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
                    className="flex-1 bg-accent-blue py-4 rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-accent-blue/20"
                  >
                    등록하기
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-4 pb-12">
        {loading ? (
          <div className="py-20 text-center text-text-dim text-sm italic animate-pulse">모집글을 불러오는 중...</div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center bg-surface rounded-3xl border border-white/5 border-dashed">
            <Users className="mx-auto text-text-dim/20 mb-4" size={48} />
            <p className="text-text-dim text-sm">현재 모집 중인 메이트가 없습니다.<br/>직관 파트너를 먼저 구해보세요!</p>
          </div>
        ) : (
          posts.map(post => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={post.id}
              className="bg-surface rounded-3xl border border-white/5 overflow-hidden hover:border-accent-blue/30 transition-colors"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.authorPhoto} 
                      alt={post.authorName} 
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-sm font-bold">{post.authorName}</div>
                      <div className="text-[10px] text-text-dim font-medium uppercase tracking-tight flex items-center gap-1">
                        <MapPin size={10} /> {post.stadium}
                      </div>
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

                <p className="text-sm text-text-main leading-relaxed mb-4">
                  {post.content}
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-accent-blue/5 text-accent-blue rounded-lg text-[10px] font-bold">
                      #{tag}
                    </span>
                  ))}
                </div>

                <button className="w-full bg-white/5 hover:bg-white/10 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all text-text-main group">
                  <MessageSquare size={14} className="group-hover:text-accent-blue transition-colors" /> 대화하기
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
