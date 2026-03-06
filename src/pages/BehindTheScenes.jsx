import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List, Plus, X, Heart, MessageCircle } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const BehindTheScenes = () => {
    const [viewMode, setViewMode] = useState('gallery'); // 'feed' | 'gallery'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [randomPost, setRandomPost] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [posts, setPosts] = useState([]);

    // Load from backend or local storage on mount
    useEffect(() => {
        fetch('https://kvdb.io/RrstMNy45q8KjYXtvzMkPQ/soriApp_bts_posts')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && Array.isArray(data) && data.length > 0) {
                    setPosts(data);
                } else {
                    const initData = [
                        { id: 1, author: '진아동생', caption: '오늘도 새벽연습 ㅠㅠ 그래도 바이올린 씬 너무 재밌다!', image: 'https://images.unsplash.com/photo-1596720230230-67c0cdbc0228?w=500&h=500&fit=crop', date: '2026-03-01', likes: 24, comments: [] },
                    ];
                    setPosts(initData);
                }
            })
            .catch(() => {
                const saved = localStorage.getItem('soriApp_bts_posts');
                if (saved) {
                    setPosts(JSON.parse(saved));
                } else {
                    const initData = [
                        { id: 1, author: '진아동생', caption: '오늘도 새벽연습 ㅠㅠ 그래도 바이올린 씬 너무 재밌다!', image: 'https://images.unsplash.com/photo-1596720230230-67c0cdbc0228?w=500&h=500&fit=crop', date: '2026-03-01', likes: 24, comments: [] },
                    ];
                    setPosts(initData);
                    localStorage.setItem('soriApp_bts_posts', JSON.stringify(initData));
                }
            });
    }, []);

    const [form, setForm] = useState({ author: '', caption: '', password: '' });
    const [fileInput, setFileInput] = useState(null); // the selected File object
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState(null); // local preview URL

    const CLOUD_NAME = 'dsdedmlvx';
    const UPLOAD_PRESET = 'sori_num';

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileInput(file);
        setPreview(URL.createObjectURL(file));
    };

    const isVideo = (url) => url && (url.includes('/video/') || /\.(mp4|mov|webm|avi)$/i.test(url));

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!form.author || !form.caption || !form.password) return alert('모든 항목을 입력해주세요.');

        let mediaUrl = 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500&h=500&fit=crop';

        if (fileInput) {
            setIsUploading(true);
            try {
                const data = new FormData();
                data.append('file', fileInput);
                data.append('upload_preset', UPLOAD_PRESET);

                const resourceType = fileInput.type.startsWith('video') ? 'video' : 'image';
                const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
                    method: 'POST',
                    body: data
                });
                const json = await res.json();
                if (!json.secure_url) throw new Error('Upload failed');
                mediaUrl = json.secure_url;
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
            image: mediaUrl,
            password: form.password,
            date: form.date || new Date().toISOString().split('T')[0],
            likes: 0,
            comments: []
        };

        const updated = [newPost, ...posts];
        setPosts(updated);

        fetch('https://kvdb.io/RrstMNy45q8KjYXtvzMkPQ/soriApp_bts_posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        }).catch(console.error);

        localStorage.setItem('soriApp_bts_posts', JSON.stringify(updated));
        setForm({ author: '', caption: '', password: '' });
        setFileInput(null);
        setPreview(null);
        setIsModalOpen(false);
    };

    const handleDelete = (id, storedPw) => {
        const inputPw = prompt('게시글 비밀번호를 입력해주세요:');
        if (inputPw === storedPw) {
            const updated = posts.filter(p => p.id !== id);
            setPosts(updated);

            fetch('https://kvdb.io/RrstMNy45q8KjYXtvzMkPQ/soriApp_bts_posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            }).catch(console.error);

            localStorage.setItem('soriApp_bts_posts', JSON.stringify(updated));
        } else if (inputPw !== null) {
            alert('비밀번호가 일치하지 않습니다.');
        }
    };

    const handleRandomPick = () => {
        if (posts.length === 0) return;
        const idx = Math.floor(Math.random() * posts.length);
        setRandomPost(posts[idx]);
    };

    const handleLike = (postId) => {
        const updated = posts.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p);
        setPosts(updated);
        savePosts(updated);
    };

    const handleAddComment = (postId, text) => {
        if (!text.trim()) return;
        const comment = { id: Date.now(), text, date: new Date().toLocaleDateString() };
        const updated = posts.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p);
        setPosts(updated);
        savePosts(updated);

        // Update selectedPost if it's the one we're commenting on
        if (selectedPost && selectedPost.id === postId) {
            setSelectedPost({ ...selectedPost, comments: [...(selectedPost.comments || []), comment] });
        }
    };

    const savePosts = (updated) => {
        fetch('https://kvdb.io/RrstMNy45q8KjYXtvzMkPQ/soriApp_bts_posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        }).catch(console.error);
        localStorage.setItem('soriApp_bts_posts', JSON.stringify(updated));
    };

    const [commentInputs, setCommentInputs] = useState({});

    return (
        <PageTransition>
            <div style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="serif" style={{ color: 'var(--nacre)', margin: 0 }}>BEHIND THE SCENES</h2>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button onClick={handleRandomPick} title="랜덤 사진 돌버" style={{ background: 'transparent', border: 'none', color: 'var(--nacre)', fontSize: '1.2rem', cursor: 'pointer', padding: '4px 6px' }}>🎲</button>
                        <button onClick={() => setViewMode('feed')} style={{ background: 'transparent', border: 'none', color: viewMode === 'feed' ? 'var(--nacre)' : 'var(--text-muted)' }}>
                            <List size={22} />
                        </button>
                        <button onClick={() => setViewMode('gallery')} style={{ background: 'transparent', border: 'none', color: viewMode === 'gallery' ? 'var(--nacre)' : 'var(--text-muted)' }}>
                            <Grid size={22} />
                        </button>
                    </div>
                </div>

                {/* Random Photo Modal */}
                {randomPost && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} onClick={() => setRandomPost(null)}>
                        <div style={{ maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
                            <img src={randomPost.image} alt="random" style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', aspectRatio: '1/1' }} />
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
                            {/* Inline Add Button in Feed */}
                            <div
                                onClick={() => setIsModalOpen(true)}
                                style={{
                                    padding: '1.2rem', borderRadius: '16px', background: 'rgba(200, 230, 224, 0.05)',
                                    border: '1px dashed var(--nacre)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '10px', color: 'var(--nacre)', cursor: 'pointer', marginBottom: '1rem'
                                }}
                            >
                                <Plus size={20} /> <span style={{ fontWeight: 'bold' }}>연습실 사진 공유하기</span>
                            </div>

                            {posts.map((post) => (
                                <div key={post.id} className="glass-panel" style={{ overflow: 'hidden' }}>
                                    <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(200,230,224,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--nacre)' }}>{post.author[0]}</div>
                                            <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.9rem' }}>{post.author}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(post.id, post.password)}
                                            style={{ background: 'rgba(255,100,100,0.1)', border: 'none', color: '#ff6b6b', fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px' }}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                    {isVideo(post.image)
                                        ? <video src={post.image} controls style={{ width: '100%', display: 'block', aspectRatio: '1/1', objectFit: 'cover' }} />
                                        : <img src={post.image} alt="bts" style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '1/1', objectFit: 'cover' }} />}

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

                                        {/* Comments List */}
                                        {post.comments && post.comments.length > 0 && (
                                            <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.8rem' }}>
                                                {post.comments.slice(-3).map(c => (
                                                    <p key={c.id} style={{ fontSize: '0.8rem', margin: '4px 0', color: 'var(--text-main)' }}>
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginRight: '5px' }}>익명:</span> {c.text}
                                                    </p>
                                                ))}
                                                {post.comments.length > 3 && <p onClick={() => setSelectedPost(post)} style={{ fontSize: '0.75rem', color: 'var(--nacre-dim)', cursor: 'pointer', marginTop: '4px' }}>댓글 {post.comments.length}개 모두 보기...</p>}
                                            </div>
                                        )}

                                        {/* Comment Input */}
                                        <div style={{ marginTop: '0.8rem', display: 'flex', gap: '10px' }}>
                                            <input
                                                type="text"
                                                placeholder="댓글 달기..."
                                                value={commentInputs[post.id] || ''}
                                                onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                                onKeyDown={(e) => e.key === 'Enter' && (handleAddComment(post.id, commentInputs[post.id]), setCommentInputs({ ...commentInputs, [post.id]: '' }))}
                                                style={{ flex: 1, background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.8rem', padding: '5px 0', outline: 'none' }}
                                            />
                                            <button
                                                onClick={() => { handleAddComment(post.id, commentInputs[post.id]); setCommentInputs({ ...commentInputs, [post.id]: '' }); }}
                                                style={{ background: 'none', border: 'none', color: 'var(--nacre)', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
                                            >
                                                게시
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                            {/* Inline Add Button in Gallery */}
                            <div
                                onClick={() => setIsModalOpen(true)}
                                style={{ aspectRatio: '1/1', width: '100%', background: 'rgba(200, 230, 224, 0.05)', border: '1px dashed var(--nacre)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--nacre)' }}
                            >
                                <Plus size={32} />
                            </div>

                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    onClick={() => setSelectedPost(post)}
                                    style={{ aspectRatio: '1/1', width: '100%', overflow: 'hidden', background: '#222', cursor: 'pointer', position: 'relative' }}
                                >
                                    {isVideo(post.image)
                                        ? <>
                                            <video src={post.image} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '1rem' }}>▶</div>
                                        </>
                                        : <img src={post.image} alt="bts" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    }
                                    {/* Like indicator on hover? Let's just keep it clean */}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Post Detail Modal (Instagram-like) */}
                <AnimatePresence>
                    {selectedPost && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPost(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} />

                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="glass-panel" style={{ width: '100%', maxWidth: '450px', overflow: 'hidden', position: 'relative', zIndex: 301, padding: 0 }}>
                                <div style={{ padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                                    <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.9rem' }}>{selectedPost.author}</span>
                                    <button
                                        onClick={() => { handleDelete(selectedPost.id, selectedPost.password); setSelectedPost(null); }}
                                        style={{ background: 'rgba(255,100,100,0.1)', border: 'none', color: '#ff6b6b', fontSize: '0.8rem', padding: '4px 12px', borderRadius: '12px' }}
                                    >
                                        삭제
                                    </button>
                                </div>

                                <button
                                    onClick={() => setSelectedPost(null)}
                                    style={{ position: 'absolute', top: '-45px', right: '0', background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '1rem' }}
                                >
                                    <X size={24} /> 닫기
                                </button>

                                {isVideo(selectedPost.image)
                                    ? <video src={selectedPost.image} controls style={{ width: '100%', display: 'block', aspectRatio: '1/1', objectFit: 'cover' }} />
                                    : <img src={selectedPost.image} alt="bts" style={{ width: '100%', display: 'block', aspectRatio: '1/1', objectFit: 'cover' }} />}

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

                                    {/* Comments Detail */}
                                    <div style={{ marginTop: '1.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                                        {selectedPost.comments && selectedPost.comments.map(c => (
                                            <div key={c.id} style={{ marginBottom: '8px' }}>
                                                <p style={{ fontSize: '0.85rem', margin: '0', color: 'var(--text-main)' }}>
                                                    <span style={{ color: 'var(--nacre-dim)', fontWeight: 'bold', marginRight: '5px' }}>익명</span> {c.text}
                                                </p>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.date}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            placeholder="댓글 달기..."
                                            value={commentInputs[`modal_${selectedPost.id}`] || ''}
                                            onChange={(e) => setCommentInputs({ ...commentInputs, [`modal_${selectedPost.id}`]: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && (handleAddComment(selectedPost.id, commentInputs[`modal_${selectedPost.id}`]), setCommentInputs({ ...commentInputs, [`modal_${selectedPost.id}`]: '' }))}
                                            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '20px', color: 'white', fontSize: '0.85rem', padding: '8px 15px', outline: 'none' }}
                                        />
                                        <button
                                            onClick={() => { handleAddComment(selectedPost.id, commentInputs[`modal_${selectedPost.id}`]); setCommentInputs({ ...commentInputs, [`modal_${selectedPost.id}`]: '' }); }}
                                            style={{ background: 'none', border: 'none', color: 'var(--nacre)', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}
                                        >
                                            게시
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Floating Add Button Removed - now inline */}

                {/* Upload Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }} />

                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative', zIndex: 201 }}>
                                <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-main)' }}><X size={24} /></button>
                                <h3 className="serif" style={{ color: 'var(--nacre)', textAlign: 'center', marginBottom: '1.5rem' }}>사진 피드 업로드</h3>

                                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input type="text" placeholder="닉네임" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white', fontFamily: 'inherit' }} />
                                    <textarea placeholder="사진/동영상 설명 캡션" value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white', fontFamily: 'inherit', resize: 'none', height: '80px' }} />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input type="date" value={form.date || new Date().toISOString().split('T')[0]} onChange={e => setForm({ ...form, date: e.target.value })} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white', fontFamily: 'inherit' }} />
                                        <input type="password" placeholder="삭제 비밀번호" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white', fontFamily: 'inherit' }} />
                                    </div>

                                    {/* File Upload Area */}
                                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', borderRadius: '8px', border: '2px dashed var(--glass-border)', cursor: 'pointer', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {preview
                                            ? (fileInput?.type?.startsWith('video')
                                                ? <video src={preview} style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '6px' }} />
                                                : <img src={preview} style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '6px' }} alt="preview" />)
                                            : <><span style={{ fontSize: '2rem' }}>📁</span><span>이미지 / 동영상 선택 (선택 안하면 기본 이미지)</span></>}
                                        <input type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                    </label>

                                    <button type="submit" disabled={isUploading} style={{ padding: '14px', borderRadius: '8px', background: isUploading ? 'rgba(200,230,224,0.4)' : 'var(--nacre)', color: '#000', border: 'none', fontWeight: 'bold', marginTop: '0.5rem', cursor: isUploading ? 'not-allowed' : 'pointer' }}>
                                        {isUploading ? '업로드 중... ⏳' : '공유하기'}
                                    </button>
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
