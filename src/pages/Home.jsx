import React from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

const Home = () => {
    return (
        <PageTransition>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ marginBottom: '3rem', width: '100%' }}>
                    <motion.h2
                        initial={{ opacity: 0, y: -50, letterSpacing: '0px' }}
                        animate={{ opacity: 1, y: 0, letterSpacing: '8px' }}
                        transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                        className="serif"
                        style={{ color: 'var(--nacre)', fontSize: '1.2rem', marginBottom: '1rem', marginLeft: '8px' }}
                    >
                        창작 뮤지컬
                    </motion.h2>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.5, filter: 'blur(20px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                        className="title-glow"
                        style={{ fontFamily: "'Yeongwol', serif", color: '#ffffff', fontSize: '4.5rem', fontWeight: '500', marginBottom: '1rem', letterSpacing: '2px' }}
                    >
                        소리의 집
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
                        style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.8', letterSpacing: '1px' }}
                    >
                        "잠시 이곳에 몸을 누이고 숨을 쉬고<br />살아가는 이곳, 그거면 돼"
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 1.5, delay: 1.5, ease: "easeInOut" }}
                    style={{
                        padding: '2rem 1rem',
                        width: '100%',
                        maxWidth: '340px',
                        marginTop: '1rem',
                        borderTop: '1px solid rgba(200, 230, 224, 0.3)',
                        borderBottom: '1px solid rgba(200, 230, 224, 0.3)',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ marginBottom: '2rem' }}>
                        <motion.h3
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 1.8, ease: "easeOut" }}
                            className="serif"
                            style={{ color: 'var(--text-main)', marginBottom: '1rem', letterSpacing: '2px' }}
                        >
                            SYNOPSIS
                        </motion.h3>

                        <motion.p
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.2, delay: 2.1, ease: "easeOut" }}
                            style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'justify', lineHeight: '1.9' }}
                        >
                            1939년 경성, 가혹한 시대의 억압 속에서도 노상 공연을 하며 서로를 의지해 살아가는 진태, 정아, 진아 삼 남매. 이들의 유일한 안식처인 좁고 초라한 '소리의 집'에 우연히 일본인 경찰 와타나베 이치로가 방문하게 된다.
                            <br /><br />
                            한편, 조선의 울분을 대변하는 의적 '까마귀'를 쫓던 잔혹한 일본 경찰 타케시 경시는 점차 소리의 집을 의심하기 시작하는데...
                        </motion.p>
                    </div>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, delay: 2.6, type: "spring", stiffness: 100 }}
                        onClick={() => {
                            const el = document.getElementById('about');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--nacre)',
                            color: 'var(--nacre)',
                            padding: '12px 28px',
                            borderRadius: '30px',
                            fontFamily: 'Gowun Dodum',
                            fontSize: '0.9rem',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            transition: 'all 0.4s ease',
                            outline: 'none'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.background = 'var(--nacre)';
                            e.target.style.color = '#000';
                            e.target.style.transform = 'scale(1.05)';
                            e.target.style.boxShadow = '0 0 15px rgba(200, 230, 224, 0.5)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = 'var(--nacre)';
                            e.target.style.transform = 'scale(1)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        인물 만나보기
                    </motion.button>
                </motion.div>
            </div>
        </PageTransition>
    );
};

export default Home;
