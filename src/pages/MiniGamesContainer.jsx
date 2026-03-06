import React, { useState } from 'react';
import Game from './Game';
import CloverGame from './CloverGame';
import Musical2048 from './Musical2048';
import { motion, AnimatePresence } from 'framer-motion';

import kkomantleImg from '../assets/images/미니게임/넘맨틀.png';
import cloverImg from '../assets/images/미니게임/클로버.png';
import num2048Img from '../assets/images/미니게임/넘048.png';
import Leaderboard from '../components/Leaderboard';
import { Trophy, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MiniGamesContainer = () => {
    const [selectedGame, setSelectedGame] = useState(null);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [boardType, setBoardType] = useState('kkomantle'); // 'kkomantle' | 'clover_bounce' | '2048'

    const games = [
        { key: 'kkomantle', name: '넘맨틀', desc: '점', img: kkomantleImg },
        { key: '2048', name: '넘048', desc: '점', img: num2048Img },
        { key: 'clover_bounce', name: '클로버 지키기', desc: '점', img: cloverImg }
    ];

    const currentBoard = games.find(g => g.key === boardType);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <AnimatePresence mode="wait">
                {!selectedGame ? (
                    <motion.div
                        key="menu"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    >
                        <h2 className="title-glow" style={{ fontFamily: "'Yeongwol', cursive", color: '#fff', fontSize: '2.4rem', marginBottom: '1rem', letterSpacing: '2px' }}>
                            놀이 한 판
                        </h2>

                        <div style={{ marginBottom: '2rem' }}>
                            <button
                                onClick={() => setShowLeaderboard(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    background: 'rgba(200, 230, 224, 0.1)', color: 'var(--nacre)',
                                    border: '1px solid var(--nacre)', borderRadius: '20px',
                                    padding: '8px 20px', cursor: 'pointer', fontWeight: 'bold'
                                }}
                            >
                                <Trophy size={18} /> 명예의 전당 보기
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', width: '100%', maxWidth: '800px', padding: '0 20px', zIndex: 10 }}>
                            <motion.button
                                whileHover={{ scale: 1.05, filter: 'drop-shadow(0 0 25px rgba(200, 230, 224, 0.8))' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedGame('kkomantle')}
                                style={{ ...imgBtnStyle, alignSelf: 'flex-start' }}
                            >
                                <img src={kkomantleImg} alt="넘맨틀" style={{ ...iconStyle, width: '150px', height: '150px' }} />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05, filter: 'drop-shadow(0 0 25px rgba(200, 230, 224, 0.8))' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedGame('2048')}
                                style={{ ...imgBtnStyle, alignSelf: 'flex-end', marginTop: '-60px' }}
                            >
                                <img src={num2048Img} alt="넘048" style={{ ...iconStyle, width: '200px', height: '200px' }} />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05, filter: 'drop-shadow(0 0 25px rgba(200, 230, 224, 0.8))' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedGame('clover')}
                                style={{ ...imgBtnStyle, alignSelf: 'flex-start', marginTop: '-60px' }}
                            >
                                <img src={cloverImg} alt="클로버 지키기" style={{ ...iconStyle, width: '255px', height: '255px' }} />
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="game"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ flex: 1, position: 'relative' }}
                    >
                        <button
                            onClick={() => setSelectedGame(null)}
                            style={{
                                position: 'absolute', top: '15px', left: '15px', zIndex: 100,
                                background: 'rgba(0,0,0,0.6)', color: 'var(--nacre)',
                                border: '1px solid var(--nacre)', borderRadius: '20px',
                                padding: '8px 16px', cursor: 'pointer', fontFamily: "'Gowun Dodum', sans-serif"
                            }}
                        >
                            ← 메뉴로 돌아가기
                        </button>

                        {selectedGame === 'kkomantle' && <Game />}
                        {selectedGame === 'clover' && <CloverGame />}
                        {selectedGame === '2048' && <Musical2048 />}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Leaderboard Overlay */}
            <AnimatePresence>
                {showLeaderboard && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLeaderboard(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="glass-panel" style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 201, padding: '1.5rem', maxHeight: '85vh', overflowY: 'auto' }}>
                            <button onClick={() => setShowLeaderboard(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}><X size={24} /></button>
                            <h3 className="serif" style={{ color: 'var(--nacre)', textAlign: 'center', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <Trophy size={20} /> 명예의 전당
                            </h3>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '5px' }}>
                                <button onClick={() => {
                                    const idx = games.findIndex(g => g.key === boardType);
                                    setBoardType(games[idx === 0 ? games.length - 1 : idx - 1].key);
                                }} style={{ background: 'none', border: 'none', color: 'var(--nacre)', cursor: 'pointer' }}><ChevronLeft /></button>
                                <span style={{ fontWeight: 'bold' }}>{currentBoard.name}</span>
                                <button onClick={() => {
                                    const idx = games.findIndex(g => g.key === boardType);
                                    setBoardType(games[(idx + 1) % games.length].key);
                                }} style={{ background: 'none', border: 'none', color: 'var(--nacre)', cursor: 'pointer' }}><ChevronRight /></button>
                            </div>

                            <Leaderboard
                                gameKey={boardType}
                                scoreDesc={currentBoard.desc}
                                hideTitle={true}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const imgBtnStyle = {
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '10px',
    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))',
    outline: 'none'
};

const iconStyle = {
    objectFit: 'contain',
    marginBottom: '0'
};

const labelStyle = {
    color: '#fff',
    fontFamily: "'Gowun Dodum', sans-serif",
    fontSize: '1.2rem',
    fontWeight: 'bold',
    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
    marginTop: '10px'
};

export default MiniGamesContainer;
