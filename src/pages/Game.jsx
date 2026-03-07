import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Leaderboard from '../components/Leaderboard';

const TARGET_WORDS = [
    { label: "독립", file: "independence", alias: "정아픽 단어" },
    { label: "안무", file: "choreography", alias: "이치로픽 단어" },
    { label: "광복", file: "liberation", alias: "진아픽 단어" },
    { label: "연출", file: "directing", alias: "연출픽 단어" },
    { label: "뜨개질", file: "knitting", alias: "타케시픽 단어" },
    { label: "만두", file: "dumpling", alias: "진태픽 단어" }
];

const Game = () => {
    // Game States
    const [targetWord, setTargetWord] = useState('');
    const [targetDict, setTargetDict] = useState(null);
    const [guesses, setGuesses] = useState([]); // [{ id, word, score }]
    const [currentGuess, setCurrentGuess] = useState('');
    const [gameOver, setGameOver] = useState(false);

    // UI States
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [message, setMessage] = useState('');
    const [sortByScore, setSortByScore] = useState(false);

    // Navigation ref for Auto-scroll
    const listEndRef = useRef(null);

    const guessIdCounter = useRef(0);

    const initTarget = async (targetObj) => {
        setSelectedTarget(targetObj);
        setIsModelLoading(true);
        setMessage('로컬 데이터를 불러오는 중...');
        setTargetWord(targetObj.label);

        try {
            // Fetch the static dictionary from the public folder
            const response = await fetch(`/data/${targetObj.file}.json`);
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            const data = await response.json();
            setTargetDict(data);
            setIsModelLoading(false);
            setMessage('');
        } catch (error) {
            console.error("Dictionary load error:", error);
            setMessage('게임 데이터를 불러오는 데 실패했습니다.');
            setIsModelLoading(false);
        }
    };

    // Initialization (no longer picking randomly on mount)
    useEffect(() => {
        // We wait for user selection
    }, []);

    const handleAddResult = useCallback((id, word, score) => {
        setGuesses(prev => {
            // Check if already guessed
            if (prev.some(g => g.word === word)) return prev;
            return [{ id, word, score }, ...prev];
        });

        if (score >= 99.5) { // Floating point precision safety
            setGameOver(true);
            setMessage("🎉 정답입니다! 축하합니다! 🎉");
        } else if (score > 80) {
            setMessage("오! 아주 가깝습니다.");
        } else if (score > 50) {
            setMessage("나쁘지 않아요.");
        } else {
            setMessage("조금 거리가 멀어요.");
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (gameOver || isModelLoading || isCalculating || !currentGuess.trim()) return;
        if (currentGuess.trim().length < 2) {
            setMessage("두 글자 이상 입력해주세요.");
            return;
        }
        if (!targetDict) {
            setMessage("사전 데이터가 로드되지 않았습니다.");
            return;
        }

        const wordToGuess = currentGuess.trim();
        setCurrentGuess("");
        setIsCalculating(true);
        setMessage("");

        // Simulated tiny delay for "thinking" feel
        setTimeout(() => {
            let score;
            if (wordToGuess === targetWord) {
                score = 100;
            } else if (targetDict[wordToGuess] !== undefined) {
                score = targetDict[wordToGuess];
            } else {
                setMessage(`"${wordToGuess}" 단어를 사전에 찾을 수 없습니다. (유사도 낮음 처리)`);
                // Very unrelated words get assigned low baseline
                score = parseFloat((Math.random() * 8 + 2).toFixed(2));
            }

            const guessId = guessIdCounter.current++;
            handleAddResult(guessId, wordToGuess, score);
            setIsCalculating(false);
        }, 150);
    };

    const getBarWidth = (score) => {
        // score goes from roughly -100 to +100. Let's map 0~100 to 0%~100% width
        const clampedScore = Math.max(0, Math.min(100, score));
        return `${clampedScore}%`;
    };

    const getBarColor = (score) => {
        if (score >= 99) return "var(--nacre)";
        if (score >= 60) return "#4caf50"; // Green
        if (score >= 40) return "#ff9800"; // Orange
        return "rgba(255,255,255,0.2)"; // Low
    };

    const sortedGuesses = sortByScore
        ? [...guesses].sort((a, b) => b.score - a.score)
        : guesses; // already ordered by newest first due to unshifting in handleAddResult

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '4rem 20px 90px', boxSizing: 'border-box', overflowX: 'hidden', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h2 className="title-glow" style={{ fontFamily: "'Yeongwol', serif", color: '#fff', fontSize: '2.4rem', marginBottom: '0.2rem', letterSpacing: '2px' }}>
                    넘맨틀
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '1px' }}>
                    "소리의 집"과 관련된 단어를 맞춰보세요.
                </p>
            </div>

            {selectedTarget === null ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                    <h3 style={{ color: '#fff', marginBottom: '1rem', fontFamily: "'Gowun Dodum', sans-serif" }}>맞출 단어를 선택하세요</h3>
                    {TARGET_WORDS.map((w) => (
                        <button
                            key={w.alias}
                            onClick={() => initTarget(w)}
                            style={{
                                width: '200px', padding: '15px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--nacre)', borderRadius: '12px', color: 'var(--nacre)',
                                fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: "'Gowun Dodum', sans-serif",
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = 'rgba(200, 230, 224,0.2)'}
                            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                        >
                            {w.alias}
                        </button>
                    ))}
                </div>
            ) : isModelLoading ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(200, 230, 224,0.3)', borderTop: '3px solid var(--nacre)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                    <p style={{ fontSize: '0.85rem', color: 'var(--nacre)', textAlign: 'center' }}>{message}</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>시도 횟수: {guesses.length}회</p>
                        <button
                            onClick={() => setSortByScore(!sortByScore)}
                            style={{
                                background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-muted)',
                                padding: '4px 10px', fontSize: '0.75rem', borderRadius: '15px', cursor: 'pointer'
                            }}
                        >
                            {sortByScore ? "순서대로 보기" : "유사도순 보기"}
                        </button>
                    </div>

                    {/* List Area */}
                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '5px' }}>
                        <AnimatePresence>
                            {sortedGuesses.map((guess) => (
                                <motion.div
                                    key={guess.word}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    layout
                                    style={{
                                        display: 'flex', flexDirection: 'column', marginBottom: '12px', background: 'rgba(255,255,255,0.03)',
                                        padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 'bold', color: '#fff' }}>{guess.word}</span>
                                        <span style={{ color: getBarColor(guess.score), fontWeight: 'bold' }}>{guess.score.toFixed(2)}</span>
                                    </div>
                                    {/* Score Bar */}
                                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: getBarWidth(guess.score) }}
                                            transition={{ duration: 0.8, type: "spring" }}
                                            style={{ height: '100%', background: getBarColor(guess.score) }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div ref={listEndRef} />
                    </div>

                    {/* Feedback & Input Area */}
                    <div style={{ height: '20px', textAlign: 'center', color: 'var(--nacre)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        <AnimatePresence mode="wait">
                            <motion.span key={message} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {message}
                            </motion.span>
                        </AnimatePresence>
                    </div>

                    {!gameOver ? (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                value={currentGuess}
                                onChange={(e) => setCurrentGuess(e.target.value)}
                                placeholder="단어를 추측해보세요..."
                                disabled={isCalculating}
                                style={{
                                    flex: 1, padding: '12px 16px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--nacre)',
                                    borderRadius: '30px', color: '#fff', outline: 'none', fontFamily: "'Gowun Dodum', sans-serif",
                                    fontSize: '16px'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={isCalculating}
                                style={{
                                    padding: '0 20px', background: isCalculating ? 'transparent' : 'var(--nacre)',
                                    color: isCalculating ? 'var(--nacre)' : '#000', border: '1px solid var(--nacre)',
                                    borderRadius: '30px', fontWeight: 'bold', cursor: isCalculating ? 'not-allowed' : 'pointer',
                                    fontFamily: "'Gowun Dodum', sans-serif"
                                }}
                            >
                                입력
                            </button>
                        </form>
                    ) : (
                        <div style={{ marginTop: '1rem' }}>
                            <Leaderboard
                                gameKey={`kkomantle_${selectedTarget.file}`}
                                currentScore={guesses.length}
                                onRestart={() => window.location.reload()}
                                scoreDesc="번 시도"
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Game;
