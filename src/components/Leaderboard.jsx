import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Leaderboard = ({ gameKey, currentScore, onRestart, scoreDesc = "점수", hideTitle = false }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [nickname, setNickname] = useState('');
    const [photo, setPhoto] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Load leaderboard from Backend & Local Storage on mount
    useEffect(() => {
        fetch(`https://kvdb.io/RrstMNy45q8KjYXtvzMkPQ/leaderboard_${gameKey}`)
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if (data && Array.isArray(data)) setLeaderboard(data);
            })
            .catch(() => {
                const saved = localStorage.getItem(`leaderboard_${gameKey}`);
                if (saved) setLeaderboard(JSON.parse(saved));
            });
    }, [gameKey]);


    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result); // Base64 string for local storage
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nickname.trim()) return;

        const newEntry = {
            id: Date.now(),
            nickname: nickname.trim(),
            score: currentScore,
            photo: photo,
            date: new Date().toLocaleDateString()
        };

        const updatedLeaderboard = [...leaderboard, newEntry]
            // Sort logic: depends on game. Kkomantle (fewer tries = better), Clover/2048 (higher score = better)
            // Let's pass a prop for sorting, but for now default to higher is better unless it's Kkomantle.
            // Game keys: 'kkomantle', 'clover', '2048'
            .sort((a, b) => {
                if (gameKey.includes('kkomantle')) {
                    return a.score - b.score; // Fewer tries is better
                }
                return b.score - a.score; // Higher score is better
            });

        setLeaderboard(updatedLeaderboard);
        fetch(`https://kvdb.io/RrstMNy45q8KjYXtvzMkPQ/leaderboard_${gameKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedLeaderboard)
        }).catch(console.error);
        localStorage.setItem(`leaderboard_${gameKey}`, JSON.stringify(updatedLeaderboard));
        setIsSubmitted(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="leaderboard-container"
            style={{
                marginTop: '1rem',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(200, 230, 224, 0.3)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            }}
        >
            {!hideTitle && (
                <h3 style={{ color: 'var(--nacre)', textAlign: 'center', marginBottom: '1.5rem', fontFamily: "'Gowun Dodum', sans-serif" }}>
                    🏆 명예의 전당 🏆
                </h3>
            )}

            {!isSubmitted && currentScore !== null && (
                <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ textAlign: 'center', color: '#fff', marginBottom: '10px' }}>
                        내 기록: <strong style={{ color: 'var(--nacre)', fontSize: '1.2rem' }}>{currentScore}</strong> {scoreDesc}
                    </div>

                    <div>
                        <input
                            type="text"
                            placeholder="닉네임 입력 (최대 8자)"
                            maxLength={8}
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            style={{
                                width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)',
                                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff',
                                fontFamily: "'Gowun Dodum', sans-serif", outline: 'none'
                            }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>기념 사진 첨부 (선택)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            style={{ color: '#fff', fontSize: '0.85rem', width: '100%' }}
                        />
                        {photo && (
                            <img src={photo} alt="Preview" style={{ marginTop: '10px', width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--nacre)' }} />
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!nickname.trim()}
                        style={{
                            padding: '12px', background: 'var(--nacre)', color: '#000', fontWeight: 'bold',
                            border: 'none', borderRadius: '8px', cursor: nickname.trim() ? 'pointer' : 'not-allowed',
                            fontFamily: "'Gowun Dodum', sans-serif"
                        }}
                    >
                        랭킹에 내 기록 등록하기
                    </button>
                </form>
            )}

            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                <AnimatePresence>
                    {leaderboard.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>아직 등록된 기록이 없습니다. 첫 번째로 이름을 남겨보세요!</p>
                    ) : (
                        leaderboard.map((entry, index) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '15px', padding: '12px',
                                    background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '10px',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}
                            >
                                <div style={{
                                    width: '30px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold',
                                    color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#cd7f32' : 'var(--text-muted)'
                                }}>
                                    {index + 1}
                                </div>

                                <div style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {entry.photo ? (
                                        <img src={entry.photo} alt={entry.nickname} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '1.2rem' }}>👤</span>
                                    )}
                                </div>

                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ color: '#fff', fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                        {entry.nickname}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                                        {entry.date}
                                    </div>
                                </div>

                                <div style={{ fontWeight: 'bold', color: 'var(--nacre)', fontSize: '1.1rem' }}>
                                    {entry.score}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {onRestart && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                        onClick={onRestart}
                        style={{
                            background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
                            padding: '8px 20px', borderRadius: '30px', cursor: 'pointer', fontFamily: "'Gowun Dodum', sans-serif"
                        }}
                    >
                        다시 하기
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default Leaderboard;
