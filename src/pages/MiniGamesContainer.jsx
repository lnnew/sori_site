import React, { useState } from 'react';
import Game from './Game';
import CloverGame from './CloverGame';
import Musical2048 from './Musical2048';
import { motion, AnimatePresence } from 'framer-motion';

import kkomantleImg from '../assets/images/미니게임/넘맨틀.png';
import cloverImg from '../assets/images/미니게임/클로버.png';
import num2048Img from '../assets/images/미니게임/넘048.png';

const MiniGamesContainer = () => {
    const [selectedGame, setSelectedGame] = useState(null);

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
                        <h2 className="title-glow" style={{ fontFamily: "'Yeongwol', cursive", color: '#fff', fontSize: '2.4rem', marginBottom: '1.5rem', letterSpacing: '2px' }}>
                            놀이 한 판
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '500px', padding: '0 10px' }}>
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
                                style={{ ...imgBtnStyle, alignSelf: 'flex-end', marginTop: '-20px' }}
                            >
                                <img src={num2048Img} alt="넘048" style={{ ...iconStyle, width: '200px', height: '200px' }} />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05, filter: 'drop-shadow(0 0 25px rgba(200, 230, 224, 0.8))' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedGame('clover')}
                                style={{ ...imgBtnStyle, alignSelf: 'flex-start', marginTop: '-20px' }}
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
