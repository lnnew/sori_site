import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List, Plus, X } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const BehindTheScenes = () => {
    const [viewMode, setViewMode] = useState('gallery'); // 'feed' | 'gallery'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [randomPost, setRandomPost] = useState(null);
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
                        { id: 1, author: '진아동생', caption: '오늘도 새벽연습 ㅠㅠ 그래도 바이올린 씬 너무 재밌다!', image: 'https://images.unsplash.com/photo-1596720230230-67c0cdbc0228?w=500&h=500&fit=crop', date: '2026-03-01' },
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
                        { id: 1, author: '진아동생', caption: '오늘도 새벽연습 ㅠㅠ 그래도 바이올린 씬 너무 재밌다!', image: 'https://images.unsplash.com/photo-1596720230230-67c0cdbc0228?w=500&h=500&fit=crop', date: '2026-03-01' },
                    ];
                    setPosts(initData);
                    localStorage.setItem('soriApp_bts_posts', JSON.stringify(initData));
                }
            });
    }, []);

    const [form, setForm] = useState({ image: '', author: '', caption: '', password: '' });

    const handleUpload = (e) => {
        e.preventDefault();
        if (!form.author || !form.caption || !form.password) return alert('모든 항목을 입력해주세요.');

        // In a real app we would upload the image to Firebase Storage here
        // For local UI demo, we'll just use a placeholder if no URL is given.
        const newImageUrl = form.image || 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500&h=500&fit=crop';

        const newPost = {
            id: Date.now(),
            author: form.author,
            caption: form.caption,
            image: newImageUrl,
            password: form.password, // plain text for demo frontend
            date: new Date().toISOString().split('T')[0]
        };

        const updated = [newPost, ...posts];
        setPosts(updated);

        fetch('https://kvdb.io/RrstMNy45q8KjYXtvzMkPQ/soriApp_bts_posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        }).catch(console.error);

        localStorage.setItem('soriApp_bts_posts', JSON.stringify(updated));
        setForm({ image: '', author: '', caption: '', password: '' });
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
                            {posts.map((post) => (
                                <div key={post.id} className="glass-panel" style={{ overflow: 'hidden' }}>
                                    <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.9rem' }}>{post.author}</span>
                                        <button onClick={() => handleDelete(post.id, post.password)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem' }}>삭제/수정</button>
                                    </div>
                                    <img src={post.image} alt="bts" style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '1/1', objectFit: 'cover' }} />
                                    <div style={{ padding: '1rem' }}>
                                        <p style={{ color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                            <span style={{ fontWeight: 'bold', marginRight: '8px' }}>{post.author}</span>
                                            {post.caption}
                                        </p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.5rem' }}>{post.date}</p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                            {posts.map((post) => (
                                <div key={post.id} style={{ aspectRatio: '1/1', width: '100%', overflow: 'hidden', background: '#222' }}>
                                    <img src={post.image} alt="bts" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Add Button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ position: 'fixed', bottom: '90px', right: '20px', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--nacre)', color: '#000', border: 'none', boxShadow: '0 4px 12px rgba(200, 230, 224,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 110 }}
                >
                    <Plus size={28} />
                </button>

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
                                    <textarea placeholder="사진 설명 캡션" value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white', fontFamily: 'inherit', resize: 'none', height: '80px' }} />
                                    <input type="password" placeholder="수정/삭제용 팹스워드 (예: 1234)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white', fontFamily: 'inherit' }} />
                                    <input type="text" placeholder="이미지 URL (선택사항, 없을시 데모용)" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white', fontFamily: 'inherit', fontSize: '0.8rem' }} />
                                    <button type="submit" style={{ padding: '14px', borderRadius: '8px', background: 'var(--nacre)', color: '#000', border: 'none', fontWeight: 'bold', marginTop: '0.5rem', cursor: 'pointer' }}>공유하기</button>
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
