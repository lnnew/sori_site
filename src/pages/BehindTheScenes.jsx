import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List, Plus, X, Heart, MessageCircle, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import PageTransition from '../components/PageTransition';

// Helper: check admin or matching password (handles undefined/null passwords)
const isAuthorized = (inputPw, storedPw) => {
    if (inputPw === null) return false;
    if (inputPw.trim() === 'admin') return true;
    if (!storedPw) return true; // no password set on post → anyone can manage
    return inputPw === storedPw;
};

// Swipeable image carousel for a post
const MediaCarousel = ({ images }) => {
    const [idx, setIdx] = useState(0);
    const touchStart = useRef(null);

    if (!images || images.length === 0) return null;

    const isVideo = (url) => url && (url.includes('/video/') || /\.(mp4|mov|webm|avi)$/i.test(url));

    const prev = (e) => { e.stopPropagation(); setIdx(i => Math.max(0, i - 1)); };
    const next = (e) => { e.stopPropagation(); setIdx(i => Math.min(images.length - 1, i + 1)); };

    return (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#111', overflow: 'hidden' }}
            onTouchStart={e => { touchStart.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
                if (touchStart.current === null) return;
                const diff = touchStart.current - e.changedTouches[0].clientX;
                if (diff > 40) setIdx(i => Math.min(images.length - 1, i + 1));
                else if (diff < -40) setIdx(i => Math.max(0, i - 1));
                touchStart.current = null;
            }}
        >
            {isVideo(images[idx])
                ? <video src={images[idx]} controls style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <img src={images[idx]} alt="bts" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            }
            {images.length > 1 && (
                <>
                    {idx > 0 && (
                        <button onClick={prev} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', color: '#fff', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                            <ChevronLeft size={18} />
                        </button>
                    )}
                    {idx < images.length - 1 && (
                        <button onClick={next} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', color: '#fff', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                            <ChevronRight size={18} />
                        </button>
                    )}
                    <div style={{ position: 'absolute', bottom: '8px', width: '100%', display: 'flex', justifyContent: 'center', gap: '5px' }}>
                        {images.map((_, i) => (
                            <div key={i} style={{ width: i === idx ? '16px' : '6px', height: '6px', borderRadius: '3px', background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const getImages = (post) => {
    if (post.images && post.images.length > 0) return post.images;
    if (post.image) return [post.image];
    return [];
};

const BehindTheScenes = () => {
    const [viewMode, setViewMode] = useState('gallery');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [randomPost, setRandomPost] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [posts, setPosts] = useState([]);
    const [activeMenuId, setActiveMenuId] = useState(null); // ID of post whose "..." menu is open

    useEffect(() => {
        fetch('https://kvdb.io/RrstMNy45q8KjYXtvzMkPQ/soriApp_bts_posts')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && Array.isArray(data) && data.length > 0) setPosts(data);
                else setPosts([{ id: 1, author: '진아동생', caption: '오늘도 새벽연습 ㅠㅠ 그래도 바이올린 씬 너무 재밌다!', images: ['https://images.unsplash.com/photo-1596720230230-67c0cdbc0228?w=500&h=500&fit=crop'], date: '2026-03-01', likes: 24, comments: [] }]);
            })
            .catch(() => {
                const saved = localStorage.getItem('soriApp_bts_posts');
                if (saved) setPosts(JSON.parse(saved));
                else {
                    const initData = [{ id: 1, author: '진아동생', caption: '오늘도 새벽연습 ㅠㅠ 그래도 바이올린 씬 너무 재밌다!', images: ['https://images.unsplash.com/photo-1596720230230-67c0cdbc0228?w=500&h=500&fit=crop'], date: '2026-03-01', likes: 24, comments: [] }];
                    setPosts(initData);
                    localStorage.setItem('soriApp_bts_posts', JSON.stringify(initData));
                }
            });
    }, []);

    const [form, setForm] = useState({ author: '', caption: '', password: '', date: '' });
    const [fileInputs, setFileInputs] = useState([]); // multiple files
    const [previews, setPreviews] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const CLOUD_NAME = 'dsdedmlvx';
    const UPLOAD_PRESET = 'sori_num';

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setFileInputs(files);
        setPreviews(files.map(f => URL.createObjectURL(f)));
        if (files[0].lastModified) {
            const dateStr = new Date(files[0].lastModified).toISOString().split('T')[0];
            setForm(prev => ({ ...prev, date: dateStr }));
        }
    };

    const uploadToCloudinary = async (file) => {
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', UPLOAD_PRESET);
        const resourceType = file.type.startsWith('video') ? 'video' : 'image';
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, { method: 'POST', body: data });
        const json = await res.json();
        if (!json.secure_url) throw new Error('Upload failed');
        return json.secure_url;
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!form.author) return alert('닉네임을 입력해주세요.');

        let mediaUrls = ['https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500&h=500&fit=crop'];

        if (fileInputs.length > 0) {
            setIsUploading(true);
            try {
                mediaUrls = await Promise.all(fileInputs.map(uploadToCloudinary));
            } catch (err) {
                alert('파일 업로드 실패: ' + err.message);
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        const newPost = {
            id: Date.now(),
            author: form.author,
            caption: form.caption,
            images: mediaUrls,
            password: form.password || '', // empty = no password
            date: form.date || new Date().toISOString().split('T')[0],
            likes: 0,
            comments: []
        };

        const updated = [newPost, ...posts];
        setPosts(updated);
        savePosts(updated);
        setForm({ author: '', caption: '', password: '', date: '' });
        setFileInputs([]);
        setPreviews([]);
        setIsModalOpen(false);
    };

    const handleDelete = (id, storedPw) => {
        const inputPw = prompt('게시글 비밀번호를 입력해주세요:\n(비밀번호 없는 게시물은 아무 값이나 입력)');
        if (inputPw === null) return;
        if (isAuthorized(inputPw, storedPw)) {
            const updated = posts.filter(p => p.id !== id);
            setPosts(updated);
            savePosts(updated);
            if (selectedPost && selectedPost.id === id) setSelectedPost(null);
        } else {
            alert('비밀번호가 일치하지 않습니다.');
        }
    };

    const handleEditPrompt = (post) => {
        const inputPw = prompt('게시글 비밀번호를 입력해주세요:\n(비밀번호 없는 게시물은 아무 값이나 입력)');
        if (inputPw === null) return;
        if (isAuthorized(inputPw, post.password)) {
            setEditingPost(post);
        } else {
            alert('비밀번호가 일치하지 않습니다.');
        }
    };

    const submitEdit = (e) => {
        e.preventDefault();
        const updated = posts.map(p => p.id === editingPost.id ? editingPost : p);
        setPosts(updated);
        savePosts(updated);
        if (selectedPost && selectedPost.id === editingPost.id) setSelectedPost(editingPost);
        setEditingPost(null);
    };

    const handleRandomPick = () => {
        if (posts.length === 0) return;
        setRandomPost(posts[Math.floor(Math.random() * posts.length)]);
    };

    const handleLike = (postId) => {
        const updated = posts.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p);
        setPosts(updated);
        savePosts(updated);
    };

    const handleAddComment = (postId, text, authorName) => {
        if (!text.trim()) return;
        const comment = { id: Date.now(), text, author: authorName || '익명', date: new Date().toLocaleDateString() };
        const updated = posts.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p);
        setPosts(updated);
        savePosts(updated);
        if (selectedPost && selectedPost.id === postId) {
            setSelectedPost({ ...selectedPost, comments: [...(selectedPost.comments || []), comment] });
        }
    };

    const savePosts = (updated) => {
        fetch('https://kvdb.io/RrstMNy45q8KjYXtvzMkPQ/soriApp_bts_posts', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated)
        }).catch(console.error);
        localStorage.setItem('soriApp_bts_posts', JSON.stringify(updated));
    };

    const [commentInputs, setCommentInputs] = useState({});
    const [commentAuthors, setCommentAuthors] = useState({});

    const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white', fontFamily: 'inherit', fontSize: '16px' };

    return (
        <PageTransition>
            <div style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="serif" style={{ color: 'var(--nacre)', margin: 0 }}>BEHIND THE SCENES</h2>
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                        <button onClick={handleRandomPick} style={{ background: 'transparent', border: '1px solid var(--nacre)', borderRadius: '15px', color: 'var(--nacre)', fontSize: '0.85rem', cursor: 'pointer', padding: '4px 10px', fontWeight: 'bold' }}>랜덤 ?</button>
                        <button onClick={() => setViewMode('feed')} style={{ background: 'transparent', border: 'none', color: viewMode === 'feed' ? 'var(--nacre)' : 'var(--text-muted)' }}><List size={22} /></button>
                        <button onClick={() => setViewMode('gallery')} style={{ background: 'transparent', border: 'none', color: viewMode === 'gallery' ? 'var(--nacre)' : 'var(--text-muted)' }}><Grid size={22} /></button>
                    </div>
                </div>

                {/* Random Photo Modal */}
                {randomPost && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} onClick={() => setRandomPost(null)}>
                        <div style={{ maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
                            <MediaCarousel images={getImages(randomPost)} />
                            <p style={{ color: '#fff', textAlign: 'center', marginTop: '1rem', fontWeight: 'bold' }}>{randomPost.author}</p>
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem' }}>{randomPost.caption}</p>
                            <button onClick={handleRandomPick} style={{ display: 'block', margin: '1rem auto 0', padding: '10px 24px', background: 'var(--nacre)', color: '#000', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>다시 뽑기 🎲</button>
                        </div>
                    </div>
                )}

                {/* View Layouts */}
                <AnimatePresence mode="wait">
                    {viewMode === 'feed' ? (
                        <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div onClick={() => setIsModalOpen(true)} style={{ padding: '1.2rem', borderRadius: '16px', background: 'rgba(200, 230, 224, 0.05)', border: '1px dashed var(--nacre)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--nacre)', cursor: 'pointer', marginBottom: '1rem' }}>
                                <Plus size={20} /> <span style={{ fontWeight: 'bold' }}>연습실 사진 공유하기</span>
                            </div>

                            {posts.map((post) => (
                                <div key={post.id} className="glass-panel" style={{ overflow: 'hidden' }}>
                                    <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(200,230,224,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--nacre)' }}>{post.author[0]}</div>
                                            <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.9rem' }}>{post.author}</span>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)}
                                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }}
                                            >
                                                <MoreHorizontal size={20} />
                                            </button>
                                            <AnimatePresence>
                                                {activeMenuId === post.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        style={{ position: 'absolute', top: '100%', right: 0, background: 'rgba(20,20,20,0.95)', border: '1px solid var(--glass-border)', borderRadius: '8px', zIndex: 10, minWidth: '80px', padding: '5px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}
                                                    >
                                                        <button
                                                            onClick={() => { handleEditPrompt(post); setActiveMenuId(null); }}
                                                            style={{ width: '100%', background: 'none', border: 'none', color: 'var(--nacre)', padding: '8px 12px', textAlign: 'left', fontSize: '0.8rem', cursor: 'pointer' }}
                                                        >수정</button>
                                                        <button
                                                            onClick={() => { handleDelete(post.id, post.password); setActiveMenuId(null); }}
                                                            style={{ width: '100%', background: 'none', border: 'none', color: '#ff6b6b', padding: '8px 12px', textAlign: 'left', fontSize: '0.8rem', cursor: 'pointer' }}
                                                        >삭제</button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <MediaCarousel images={getImages(post)} />

                                    <div style={{ padding: '0.8rem 1rem' }}>
                                        <div style={{ display: 'flex', gap: '15px', marginBottom: '0.8rem' }}>
                                            <button onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', color: '#ff4b4b', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: 0 }}>
                                                <Heart size={24} fill={post.likes > 0 ? "#ff4b4b" : "none"} />
                                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{post.likes || 0}</span>
                                            </button>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-main)' }}>
                                                <MessageCircle size={24} />
                                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{post.comments?.length || 0}</span>
                                            </div>
                                        </div>
                                        <p style={{ color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                            <span style={{ fontWeight: 'bold', marginRight: '8px' }}>{post.author}</span>
                                            {post.caption}
                                        </p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.5rem' }}>{post.date}</p>

                                        {post.comments && post.comments.length > 0 && (
                                            <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.8rem' }}>
                                                {post.comments.slice(-3).map(c => (
                                                    <p key={c.id} style={{ fontSize: '0.8rem', margin: '4px 0', color: 'var(--text-main)' }}>
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginRight: '5px' }}>{c.author || '익명'}:</span> {c.text}
                                                    </p>
                                                ))}
                                                {post.comments.length > 3 && <p onClick={() => setSelectedPost(post)} style={{ fontSize: '0.75rem', color: 'var(--nacre-dim)', cursor: 'pointer', marginTop: '4px' }}>댓글 {post.comments.length}개 모두 보기...</p>}
                                            </div>
                                        )}

                                        <div style={{ marginTop: '0.8rem', display: 'flex', gap: '10px' }}>
                                            <input type="text" placeholder="닉네임" value={commentAuthors[post.id] || ''} onChange={(e) => setCommentAuthors({ ...commentAuthors, [post.id]: e.target.value })} style={{ width: '65px', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '16px', padding: '5px 0', outline: 'none' }} />
                                            <input type="text" placeholder="댓글 달기..." value={commentInputs[post.id] || ''} onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && (handleAddComment(post.id, commentInputs[post.id], commentAuthors[post.id]), setCommentInputs({ ...commentInputs, [post.id]: '' }))} style={{ flex: 1, background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '16px', padding: '5px 0', outline: 'none' }} />
                                            <button onClick={() => { handleAddComment(post.id, commentInputs[post.id], commentAuthors[post.id]); setCommentInputs({ ...commentInputs, [post.id]: '' }); }} style={{ background: 'none', border: 'none', color: 'var(--nacre)', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>게시</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                            <div onClick={() => setIsModalOpen(true)} style={{ aspectRatio: '1/1', width: '100%', background: 'rgba(200, 230, 224, 0.05)', border: '1px dashed var(--nacre)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--nacre)' }}>
                                <Plus size={32} />
                            </div>
                            {posts.map((post) => {
                                const imgs = getImages(post);
                                const first = imgs[0] || '';
                                const isVid = first && (first.includes('/video/') || /\.(mp4|mov|webm|avi)$/i.test(first));
                                return (
                                    <div key={post.id} onClick={() => setSelectedPost(post)} style={{ aspectRatio: '1/1', width: '100%', overflow: 'hidden', background: '#222', cursor: 'pointer', position: 'relative' }}>
                                        {isVid
                                            ? <><video src={first} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><div style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '1rem' }}>▶</div></>
                                            : <img src={first} alt="bts" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        }
                                        {imgs.length > 1 && <div style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', padding: '1px 5px', fontSize: '0.65rem', color: '#fff' }}>+{imgs.length}</div>}
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Post Detail Modal */}
                <AnimatePresence>
                    {selectedPost && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPost(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} />
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="glass-panel" style={{ width: '100%', maxWidth: '450px', overflow: 'hidden', position: 'relative', zIndex: 301, padding: 0, maxHeight: '90vh', overflowY: 'auto' }}>
                                <div style={{ padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                                    <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.9rem' }}>{selectedPost.author}</span>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                onClick={() => setActiveMenuId(activeMenuId === `modal_${selectedPost.id}` ? null : `modal_${selectedPost.id}`)}
                                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }}
                                            >
                                                <MoreHorizontal size={20} />
                                            </button>
                                            <AnimatePresence>
                                                {activeMenuId === `modal_${selectedPost.id}` && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        style={{ position: 'absolute', top: '100%', right: 0, background: 'rgba(20,20,20,0.95)', border: '1px solid var(--glass-border)', borderRadius: '8px', zIndex: 10, minWidth: '80px', padding: '5px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}
                                                    >
                                                        <button
                                                            onClick={() => { handleEditPrompt(selectedPost); setActiveMenuId(null); }}
                                                            style={{ width: '100%', background: 'none', border: 'none', color: 'var(--nacre)', padding: '8px 12px', textAlign: 'left', fontSize: '0.8rem', cursor: 'pointer' }}
                                                        >수정</button>
                                                        <button
                                                            onClick={() => { handleDelete(selectedPost.id, selectedPost.password); setActiveMenuId(null); }}
                                                            style={{ width: '100%', background: 'none', border: 'none', color: '#ff6b6b', padding: '8px 12px', textAlign: 'left', fontSize: '0.8rem', cursor: 'pointer' }}
                                                        >삭제</button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <button onClick={() => setSelectedPost(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                                    </div>
                                </div>

                                <MediaCarousel images={getImages(selectedPost)} />

                                <div style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '15px', marginBottom: '1rem' }}>
                                        <button onClick={() => handleLike(selectedPost.id)} style={{ background: 'none', border: 'none', color: '#ff4b4b', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: 0 }}>
                                            <Heart size={24} fill={selectedPost.likes > 0 ? "#ff4b4b" : "none"} />
                                            <span style={{ fontWeight: 'bold' }}>{selectedPost.likes || 0}</span>
                                        </button>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-main)' }}>
                                            <MessageCircle size={24} />
                                            <span style={{ fontWeight: 'bold' }}>{selectedPost.comments?.length || 0}</span>
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                        <span style={{ fontWeight: 'bold', marginRight: '8px' }}>{selectedPost.author}</span>
                                        {selectedPost.caption}
                                    </p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.6rem' }}>{selectedPost.date}</p>

                                    <div style={{ marginTop: '1.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                                        {selectedPost.comments && selectedPost.comments.map(c => (
                                            <div key={c.id} style={{ marginBottom: '8px' }}>
                                                <p style={{ fontSize: '0.85rem', margin: '0', color: 'var(--text-main)' }}>
                                                    <span style={{ color: 'var(--nacre-dim)', fontWeight: 'bold', marginRight: '5px' }}>{c.author || '익명'}</span> {c.text}
                                                </p>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.date}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
                                        <input type="text" placeholder="닉네임" value={commentAuthors[`modal_${selectedPost.id}`] || ''} onChange={(e) => setCommentAuthors({ ...commentAuthors, [`modal_${selectedPost.id}`]: e.target.value })} style={{ width: '65px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '20px', color: 'white', fontSize: '16px', padding: '8px 12px', outline: 'none' }} />
                                        <input type="text" placeholder="댓글 달기..." value={commentInputs[`modal_${selectedPost.id}`] || ''} onChange={(e) => setCommentInputs({ ...commentInputs, [`modal_${selectedPost.id}`]: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && (handleAddComment(selectedPost.id, commentInputs[`modal_${selectedPost.id}`], commentAuthors[`modal_${selectedPost.id}`]), setCommentInputs({ ...commentInputs, [`modal_${selectedPost.id}`]: '' }))} style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '20px', color: 'white', fontSize: '16px', padding: '8px 12px', outline: 'none' }} />
                                        <button onClick={() => { handleAddComment(selectedPost.id, commentInputs[`modal_${selectedPost.id}`], commentAuthors[`modal_${selectedPost.id}`]); setCommentInputs({ ...commentInputs, [`modal_${selectedPost.id}`]: '' }); }} style={{ background: 'none', border: 'none', color: 'var(--nacre)', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}>게시</button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Upload Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }} />
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative', zIndex: 201, maxHeight: '90vh', overflowY: 'auto' }}>
                                <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}><X size={24} /></button>
                                <h3 className="serif" style={{ color: 'var(--nacre)', textAlign: 'center', marginBottom: '1.5rem' }}>사진 피드 업로드</h3>

                                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input type="text" placeholder="닉네임 *" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} style={inputStyle} />
                                    <textarea placeholder="사진/동영상 설명 캡션 (선택)" value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })} style={{ ...inputStyle, resize: 'none', height: '80px' }} />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input type="date" value={form.date || new Date().toISOString().split('T')[0]} onChange={e => setForm({ ...form, date: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                                        <input type="password" placeholder="삭제 비밀번호 (선택)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                                    </div>

                                    {/* Multi-file Upload */}
                                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', borderRadius: '8px', border: '2px dashed var(--glass-border)', cursor: 'pointer', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {previews.length > 0 ? (
                                            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', width: '100%' }}>
                                                {previews.map((p, i) => (
                                                    fileInputs[i]?.type?.startsWith('video')
                                                        ? <video key={i} src={p} style={{ height: '80px', borderRadius: '6px', flexShrink: 0 }} />
                                                        : <img key={i} src={p} style={{ height: '80px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} alt="preview" />
                                                ))}
                                            </div>
                                        ) : (
                                            <><span style={{ fontSize: '2rem' }}>📁</span><span>이미지 / 동영상 선택 (여러 장 가능)</span></>
                                        )}
                                        <input type="file" accept="image/*,video/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                                    </label>

                                    <button type="submit" disabled={isUploading} style={{ padding: '14px', borderRadius: '8px', background: isUploading ? 'rgba(200,230,224,0.4)' : 'var(--nacre)', color: '#000', border: 'none', fontWeight: 'bold', marginTop: '0.5rem', cursor: isUploading ? 'not-allowed' : 'pointer', fontSize: '16px' }}>
                                        {isUploading ? `업로드 중... ⏳` : '공유하기'}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Edit Modal */}
                <AnimatePresence>
                    {editingPost && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 400, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingPost(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }} />
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative', zIndex: 401 }}>
                                <button onClick={() => setEditingPost(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}><X size={24} /></button>
                                <h3 className="serif" style={{ color: 'var(--nacre)', textAlign: 'center', marginBottom: '1.5rem' }}>게시글 수정</h3>
                                <form onSubmit={submitEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <textarea placeholder="수정할 캡션 내용" value={editingPost.caption || ''} onChange={e => setEditingPost({ ...editingPost, caption: e.target.value })} style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }} />
                                    <button type="submit" style={{ padding: '14px', borderRadius: '8px', background: 'var(--nacre)', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>수정 완료</button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </PageTransition>
    );
};

export default BehindTheScenes;
