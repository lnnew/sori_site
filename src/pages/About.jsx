import React from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

import imgJeonga from '../assets/images/문선우.png';
import imgTakeshi from '../assets/images/박동연콧수염.png';
import imgIchiro from '../assets/images/양현서.png';
import imgJina from '../assets/images/이신형psd.png';
import imgJintae from '../assets/images/진태.png';

const characters = [
    {
        id: 'jintae',
        name: '김진태',
        actor: '배우 김태이',
        role: '진아의 오빠 / 동아일보 수습기자 / 의적 까마귀',
        quote: '"그래도 난 일본인을 믿을 수 없어"',
        desc: '낮에는 신문사 기자, 밤에는 세상에 맞서 싸우는 독립운동가이다. 가족을 지키기 위해 시작한 일이지만 점점 일본인에 대한 증오로 가득찬다.',
        image: imgJintae
    },
    {
        id: 'jeonga',
        name: '박정아',
        actor: '배우 문선우',
        role: '소리의 집 보호자',
        quote: '"네가 변해가는 걸 더 이상 보고 싶지 않아."',
        desc: '\'소리의 집\'을 지키는 주인이자 가족을 감싸 안는 따뜻한 보호자. 사랑하는 진태의 일본인에 대한 증오로 인해 지금의 행복이 깨지지 않기를 간절히 기도한다.',
        image: imgJeonga
    },
    {
        id: 'jina',
        name: '김진아',
        actor: '배우 이신형',
        role: '바이올리니스트 지망생',
        quote: '"눈을 감고 들어봐요. 어둠 속에서도 우리 소리는 빛나니까."',
        desc: '\'소리의 집\'의 사랑스러운 막내이자 바이올리니스트 지망생. 가난하고 험한 시대지만, 오빠 진태와 정아 언니의 사랑 속에서 밝게 자랐다.',
        image: imgJina
    },
    {
        id: 'ichiro',
        name: '와타나베 이치로',
        actor: '배우 양현서',
        role: '소리의 집에 온 신임 경부',
        quote: '"저 너머에 내가 몰랐던 세상이 있어."',
        desc: '타케시의 아들이자 엘리트 코스를 밟은 신임 경부. 아버지의 뜻에 따라 훌륭한 경찰이 되기를 꿈꿨으나, 우연히 마주친 \'소리의 집\' 사람들과 음악을 나누며 흔들린다.',
        image: imgIchiro
    },
    {
        id: 'takeshi',
        name: '와타나베 타케시',
        actor: '배우 박동연',
        role: '경성 종로경찰서 치안정보부 부장',
        quote: '"힘없는 정의는 그저 발악일 뿐이다."',
        desc: '경성 종로경찰서 치안정보부 부장. 제국주의 신념을 맹신하며, 조선인을 철저한 통제와 계도의 대상으로만 바라보는 냉철한 인물이다.',
        image: imgTakeshi
    }
];

const About = () => {
    return (
        <PageTransition>
            <div style={{ paddingBottom: '6rem' }}>
                {/* Full-screen Intro Title */}
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{ textAlign: 'center' }}
                    >
                        <h2 className="serif title-glow" style={{ color: 'var(--nacre)', fontSize: '3rem', letterSpacing: '4px', marginBottom: '1rem' }}>
                            CAST
                        </h2>
                        <h2 className="serif" style={{ color: 'var(--text-main)', fontSize: '1.5rem', letterSpacing: '8px', opacity: 0.8 }}>
                            & CHARACTERS
                        </h2>
                    </motion.div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, y: [0, 10, 0] }}
                        transition={{ delay: 1.5, duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        style={{ position: 'absolute', bottom: '120px', color: 'var(--nacre-dim)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                    >
                        <span style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>SCROLL</span>
                        <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, var(--nacre-dim), transparent)' }} />
                    </motion.div>
                </div>

                {/* Character List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8rem', padding: '0 10px', marginTop: '2rem' }}>
                    {characters.map((char, index) => {
                        const isEven = index % 2 === 0;

                        return (
                            <motion.div
                                key={char.id}
                                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: false, amount: 0.1, margin: "0px 0px -100px 0px" }}
                                transition={{ duration: 0.8, type: 'spring', bounce: 0.2 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            >
                                {/* Character Image Canvas */}
                                <div style={{
                                    width: '100%',
                                    height: '60vh',
                                    maxHeight: '550px',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                                    position: 'relative'
                                }}>
                                    <img src={char.image} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.02)' }} />
                                    {/* Subtle Vignette / Gradient Overlay */}
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(10,12,16,1), transparent)' }} />
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '20%', background: 'linear-gradient(to bottom, rgba(10,12,16,0.6), transparent)' }} />
                                </div>

                                {/* Floating Glass Content Card */}
                                <motion.div
                                    className="glass-panel"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.2 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    style={{
                                        width: '90%',
                                        maxWidth: '400px',
                                        marginTop: '-5rem', // Overlaps the bottom of the image
                                        padding: '1.8rem',
                                        position: 'relative',
                                        zIndex: 10,
                                        backdropFilter: 'blur(15px)',
                                        background: 'rgba(255,255,255,0.03)'
                                    }}
                                >
                                    <div style={{ borderBottom: '1px solid rgba(200, 230, 224, 0.3)', paddingBottom: '0.8rem', marginBottom: '1.2rem' }}>
                                        <h3 className="serif" style={{ fontSize: '1.8rem', color: 'var(--nacre)', margin: 0, display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                                            {char.name}
                                            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'sans-serif', fontWeight: 'normal', paddingBottom: '3px' }}>{char.actor}</span>
                                        </h3>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.5rem', opacity: 0.9 }}>
                                            {char.role}
                                        </div>
                                    </div>

                                    <p style={{ fontStyle: 'italic', color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '1rem', fontWeight: 'bold', lineHeight: '1.5' }}>
                                        {char.quote}
                                    </p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                                        {char.desc}
                                    </p>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </PageTransition>
    );
};

export default About;
