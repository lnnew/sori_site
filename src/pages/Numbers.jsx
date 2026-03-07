import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';

import numbersData from './Numbers.json';

const Numbers = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showSelector, setShowSelector] = useState(false);

    // Because we removed 00. Overture and it's 1-indexed now in titles maybe.
    // The id's are 1 through 17.

    const handleDragEnd = (event, info) => {
        // swipe threshold
        if (info.offset.x < -40 && currentIndex < numbersData.length - 1) {
            setCurrentIndex(prev => prev + 1);
            document.getElementById('numbers').scrollIntoView({ behavior: 'smooth' });
        } else if (info.offset.x > 40 && currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            document.getElementById('numbers').scrollIntoView({ behavior: 'smooth' });
        }
    };

    const currentNumber = numbersData[currentIndex];

    // Format Title Name without boxes
    const getDisplayTitle = (num) => {
        if (num.id === 17) return num.title;
        return num.title.replace(/^[0-9.]+\s/, '');
    };

    return (
        <PageTransition>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '4rem', paddingBottom: '90px' }}>

                {/* Minimal Header / Selector */}
                <div style={{ padding: '0 20px', zIndex: 10, position: 'relative', textAlign: 'center' }}>

                    <p style={{ color: 'var(--nacre-dim)', fontFamily: "'Noto Serif KR', serif", fontSize: '0.85rem', marginBottom: '0.5rem', letterSpacing: '2px' }}>
                        NUMBERS {currentIndex + 1} / {numbersData.length - 1}
                    </p>

                    <div
                        onClick={() => setShowSelector(!showSelector)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: '0.5rem 1rem',
                            borderBottom: '1px solid var(--nacre)',
                            marginBottom: '2rem'
                        }}
                    >
                        <span
                            style={{ color: currentIndex > 0 ? 'var(--text-muted)' : 'transparent', fontSize: '1rem', padding: '0 15px', fontWeight: '100' }}
                            onClick={(e) => { e.stopPropagation(); if (currentIndex > 0) { setCurrentIndex(prev => prev - 1); document.getElementById('numbers').scrollIntoView(); } }}
                        >
                            &lt;
                        </span>

                        <h2 className="serif" style={{ color: '#fff', margin: 0, fontSize: '1.5rem', fontWeight: '400', letterSpacing: '2px' }}>
                            {getDisplayTitle(currentNumber)}
                        </h2>

                        <span
                            style={{ color: currentIndex < numbersData.length - 1 ? 'var(--text-muted)' : 'transparent', fontSize: '1rem', padding: '0 15px', fontWeight: '100' }}
                            onClick={(e) => { e.stopPropagation(); if (currentIndex < numbersData.length - 1) { setCurrentIndex(prev => prev + 1); document.getElementById('numbers').scrollIntoView(); } }}
                        >
                            &gt;
                        </span>
                    </div>

                    <AnimatePresence>
                        {showSelector && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '90%',
                                    background: 'rgba(5, 5, 5, 0.95)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    maxHeight: '50vh',
                                    overflowY: 'auto',
                                    zIndex: 50,
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
                                }}
                            >
                                {numbersData.map((num, i) => (
                                    <div
                                        key={num.id}
                                        onClick={() => { setCurrentIndex(i); setShowSelector(false); document.getElementById('numbers').scrollIntoView(); }}
                                        style={{
                                            padding: '16px 20px',
                                            borderBottom: '1px solid rgba(255,255,255,0.02)',
                                            color: i === currentIndex ? 'var(--nacre)' : 'var(--text-main)',
                                            fontWeight: i === currentIndex ? '300' : '100',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontFamily: "'Noto Serif KR', serif",
                                            textAlign: 'center'
                                        }}
                                    >
                                        {num.title}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Vertical native scrolling lyrics area */}
                <div style={{ flex: 1, position: 'relative', width: '100%' }}>
                    <AnimatePresence mode="popLayout" custom={currentIndex}>
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.4 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={handleDragEnd}
                            style={{
                                width: '100%',
                                padding: '0 20px',
                                touchAction: 'pan-y'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ paddingBottom: '1rem', marginBottom: '2.5rem', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '100', margin: 0, letterSpacing: '1px' }}>
                                        {currentNumber.credits.split('/').map((c, i) => (
                                            <span key={i}>{c} <br /></span>
                                        ))}
                                    </p>
                                </div>

                                {currentNumber.youtubeId && (
                                    <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto 2rem' }}>
                                        <a
                                            href={`https://www.youtube.com/watch?v=${currentNumber.youtubeId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ display: 'block', position: 'relative', textDecoration: 'none', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}
                                        >
                                            <img
                                                src={`https://img.youtube.com/vi/${currentNumber.youtubeId}/hqdefault.jpg`}
                                                alt="뮤직비디오 썸네일"
                                                style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }}
                                            />
                                            <div style={{
                                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                                background: 'rgba(0,0,0,0.3)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <div style={{
                                                    width: '64px', height: '64px', borderRadius: '50%',
                                                    background: 'rgba(255,0,0,0.85)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                                                }}>
                                                    <div style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '12px 0 12px 22px', borderColor: 'transparent transparent transparent white', marginLeft: '4px' }} />
                                                </div>
                                            </div>
                                        </a>
                                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.8rem', letterSpacing: '1px' }}>
                                            ▶ 클릭하면 YouTube에서 재생됩니다
                                        </p>
                                    </div>
                                )}

                                {currentNumber.hasLyrics ? (
                                    <div className="serif" style={{
                                        color: '#eee',
                                        fontSize: '0.77rem',
                                        lineHeight: '2.4',
                                        whiteSpace: 'pre-line',
                                        textAlign: 'center',
                                        letterSpacing: '0.5px',
                                        fontWeight: '300',
                                        paddingBottom: '2rem',
                                    }}>
                                        {currentNumber.lyrics}
                                    </div>
                                ) : !currentNumber.youtubeId ? (
                                    <div style={{ padding: '4rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                        <p className="serif" style={{ fontSize: '1rem', fontWeight: '100', letterSpacing: '2px' }}>연주곡입니다.</p>
                                    </div>
                                ) : null}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {showSelector && (
                <div onClick={() => setShowSelector(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }} />
            )}
        </PageTransition>
    );
};

export default Numbers;
