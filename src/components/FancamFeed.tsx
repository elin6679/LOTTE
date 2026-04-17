import React, { useState, useEffect, useRef } from 'react';
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
  updateDoc,
  increment
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Heart, Share2, MapPin, Camera, Video, X, Send, Image as ImageIcon, Upload } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { useAuth } from '../lib/AuthContext';

interface FancamPost {
  id: string;
  uid: string;
  authorName: string;
  authorPhoto: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  stadium: string;
  likes: number;
  createdAt: any;
}

export const FancamFeed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FancamPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [stadium, setStadium] = useState('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'fancams'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FancamPost[];
      setPosts(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'fancams');
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (deletingId) {
      const timer = setTimeout(() => setDeletingId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [deletingId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) { // Limit to ~800KB for Firestore doc limit safety
      alert('파일 크기가 너무 큽니다. 800KB 이하의 이미지를 올려주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => setIsUploading(true);
    reader.onloadend = () => {
      setMediaUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!mediaUrl) {
      alert(mediaType === 'image' ? '이미지를 업로드해주세요.' : '영상 주소를 입력해주세요.');
      return;
    }

    try {
      await addDoc(collection(db, 'fancams'), {
        uid: user.uid,
        authorName: user.displayName || '익명의 팬',
        authorPhoto: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
        mediaUrl,
        mediaType,
        stadium,
        caption,
        likes: 0,
        createdAt: serverTimestamp()
      });
      setShowForm(false);
      setMediaUrl('');
      setStadium('');
      setCaption('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'fancams');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await updateDoc(doc(db, 'fancams', postId), {
        likes: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'fancams');
    }
  };

  const handleDelete = async (postId: string, authorUid: string) => {
    if (!user || user.uid !== authorUid) {
      console.warn('Delete attempt failed: User mismatch', user?.uid, authorUid);
      return;
    }

    if (deletingId !== postId) {
      setDeletingId(postId);
      return;
    }

    try {
      await deleteDoc(doc(db, 'fancams', postId));
      setDeletingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'fancams');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black italic">직캠 커뮤니티</h2>
          <p className="text-text-dim text-xs font-medium">현장의 생생한 순간을 공유하세요</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-primary-brand text-white p-3 rounded-xl shadow-lg shadow-primary-brand/20 hover:scale-105 transition-transform"
        >
          <Camera size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-bg/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-surface w-full max-w-md rounded-3xl border border-white/10 shadow-2xl p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-brand to-accent-blue" />
              <button 
                onClick={() => setShowForm(false)}
                className="absolute top-6 right-6 text-text-dim hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Camera className="text-primary-brand" size={24} /> 새 직캠 올리기
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2 p-1 bg-bg rounded-xl border border-white/5">
                  <button 
                    type="button"
                    onClick={() => { setMediaType('image'); setMediaUrl(''); }}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mediaType === 'image' ? 'bg-surface-light text-white shadow-sm' : 'text-text-dim hover:text-white'}`}
                  >
                    이미지 업로드
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setMediaType('video'); setMediaUrl(''); }}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mediaType === 'video' ? 'bg-surface-light text-white shadow-sm' : 'text-text-dim hover:text-white'}`}
                  >
                    영상 링크
                  </button>
                </div>

                {mediaType === 'image' ? (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">사진 선택</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-video bg-bg border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-brand/50 transition-all overflow-hidden relative"
                    >
                      {mediaUrl ? (
                        <img src={mediaUrl} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <>
                          <Upload className="text-text-dim" size={32} />
                          <span className="text-xs text-text-dim font-bold">{isUploading ? '처리 중...' : '클릭하여 사진 업로드'}</span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">영상 주소 (YouTube 등)</label>
                    <input 
                      type="url" 
                      placeholder="https://youtu.be/..."
                      value={mediaUrl} 
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="w-full bg-bg border border-white/5 rounded-xl p-3 text-sm focus:border-primary-brand transition-colors outline-none" 
                      required={mediaType === 'video'}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">구장 정보</label>
                  <input 
                    type="text" 
                    placeholder="예: 잠실 야구장"
                    value={stadium} 
                    onChange={(e) => setStadium(e.target.value)}
                    className="w-full bg-bg border border-white/5 rounded-xl p-3 text-sm focus:border-primary-brand transition-colors outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-dim mb-1 uppercase tracking-widest">캡션</label>
                  <textarea 
                    rows={2}
                    placeholder="현장의 감동을 짧게 적어주세요!"
                    value={caption} 
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full bg-bg border border-white/5 rounded-xl p-4 text-sm focus:border-primary-brand transition-colors outline-none resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isUploading}
                  className="w-full bg-primary-brand py-4 rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-primary-brand/20 mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={18} /> 공유하기
                </button>
                {mediaUrl && mediaType === 'image' && (
                  <button 
                    type="button" 
                    onClick={() => setMediaUrl('')}
                    className="w-full text-[10px] text-text-dim hover:text-primary-brand font-bold uppercase tracking-widest transition-colors mt-2"
                  >
                    이미지 초기화
                  </button>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {loading ? (
          <div className="col-span-full py-20 text-center text-text-dim text-sm italic animate-pulse">피드를 불러오는 중...</div>
        ) : posts.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-surface rounded-3xl border border-white/5 border-dashed">
            <Video className="mx-auto text-text-dim/20 mb-4" size={48} />
            <p className="text-text-dim text-sm">아직 공유된 직캠이 없습니다.<br/>오늘의 첫 직캠 주인공이 되어보세요!</p>
          </div>
        ) : (
          posts.map(post => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={post.id}
              className="bg-surface rounded-3xl border border-white/5 overflow-hidden group hover:border-primary-brand/30 transition-all relative"
            >
              {/* Delete Button - Double-tap to delete confirmation UI */}
              {user?.uid === post.uid && (
                <button 
                  onClick={(e) => { 
                    e.preventDefault();
                    e.stopPropagation(); 
                    handleDelete(post.id, post.uid); 
                  }}
                  className={`absolute top-4 right-4 p-3 rounded-full text-white transition-all border z-[60] shadow-2xl active:scale-95 flex items-center gap-2 ${
                    deletingId === post.id 
                      ? 'bg-primary-brand border-white/40 px-4 ring-4 ring-primary-brand/30 scale-110' 
                      : 'bg-black/80 backdrop-blur-xl border-white/20'
                  }`}
                  title={deletingId === post.id ? "한 번 더 눌러 삭제" : "게시물 삭제"}
                >
                  <Trash2 size={18} />
                  {deletingId === post.id && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      className="text-[10px] font-black uppercase tracking-tight overflow-hidden whitespace-nowrap"
                    >
                      진짜 삭제?
                    </motion.span>
                  )}
                </button>
              )}

              <div className="relative aspect-[4/5] overflow-hidden bg-bg">
                {post.mediaType === 'image' ? (
                  <img 
                    src={post.mediaUrl} 
                    alt={post.caption} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <a 
                    href={post.mediaUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full h-full flex flex-col items-center justify-center bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
                  >
                    <Video className="text-white/40 group-hover:text-primary-brand/80 transition-colors" size={56} />
                    <div className="mt-4 flex flex-col items-center gap-2">
                       <p className="text-white text-[12px] font-black bg-primary-brand px-4 py-2 rounded-full shadow-xl">영상 재생하기</p>
                       <p className="text-white/40 text-[10px] font-medium tracking-tight">외부 링크로 이동합니다</p>
                    </div>
                  </a>
                )}
                
                <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <img 
                      src={post.authorPhoto} 
                      alt={post.authorName} 
                      className="w-5 h-5 rounded-full object-cover border border-white/20"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[10px] font-bold text-white">{post.authorName}</span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
                  <div className="flex items-center gap-1.5 text-primary-brand text-[10px] font-black uppercase tracking-widest mb-2">
                    <MapPin size={10} /> {post.stadium || '경기장 정보 없음'}
                  </div>
                  <p className="text-sm text-white font-medium line-clamp-2 leading-relaxed">
                    {post.caption}
                  </p>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between border-t border-white/5 bg-surface/50">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 text-text-dim hover:text-primary-brand transition-colors group"
                  >
                    <Heart size={18} className={post.likes > 0 ? "fill-primary-brand text-primary-brand" : ""} />
                    <span className="text-xs font-bold font-mono">{post.likes}</span>
                  </button>
                  <button className="text-text-dim hover:text-white transition-colors">
                    <Share2 size={18} />
                  </button>
                </div>
                <div className="text-[10px] text-text-dim/60 font-medium">
                  {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : '방금 전'}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
