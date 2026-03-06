import React from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

const creatorsList = [
    {
        role: "연출",
        name: "한우진",
        comment: '"1939년을 살아가는 사람들의 다양한 시선을 느끼며 관람해주시면 감사하겠습니다."'
    },
    {
        role: "조연출",
        name: "장혜림",
        comment: '"넘버가 만들어가는 역사 속에 이름을 남길 수 있어 영광입니다. 함께해주셔서 감사합니다."'
    },
    {
        role: "극작 / 작가팀장",
        name: "전지민",
        comment: '"시대에 무관하게 사람들은 모두 행복해지기 위해서 사는 것 같습니다. 우리 할머니 할아버지뻘인 인물들을 조금만 응원해주시면 감사하겠습니다."'
    },
    {
        role: "음악팀장",
        name: "윤가온",
        comment: '"국악을 뮤지컬에 접목시키는 새로운 도전을 해 보았습니다! 예쁘게 봐주세요!"'
    },
    {
        role: "배우팀장",
        name: "양현서",
        comment: '"서릿빛 겨울바람이 휘몰아치는 겨울날 굴복하지 않고 맞서 싸워주신 배우분들 감사합니다. 공연 재밌게 봐주시면 감사하겠습니다."'
    },
    {
        role: "무대팀장",
        name: "신채하",
        comment: '"무대의 꽃은 뭐다? 조명이다."'
    },
    {
        role: "홍보팀장",
        name: "국승호",
        comment: '"바이올린 운동 많이 됩니다. 오늘 자기 전에 생각나시길 바랍니다. 재밌게 봐주세요."'
    },
    {
        role: "사무팀장",
        name: "오소연",
        comment: '"사무팀장 화이팅! 언제든 사무팀원은 환영입니다. 이번 공연 재밌게 봐주세요."'
    }
];

const teamList = [
    { team: "연출", members: "한우진" },
    { team: "조연출", members: "장혜림" },
    { team: "조명오퍼", members: "신채하" },
    { team: "음향오퍼", members: "국승호" },
    { team: "배우팀", members: "양현서 김태이 문선우 박동연 이신형" },
    { team: "음악팀", members: "윤가온 국승호 김동재 신민석 유지현 이상현 이하진 전지민 지영채" },
    { team: "무대팀", members: "신채하 김동현 류다민 박동연 오소연 이유민 전지민" },
    { team: "홍보팀", members: "국승호 문선우 유지현 이신형 이유민 전지민 정희원" },
    { team: "작가팀", members: "전지민 국승호 김태이 라태형 류다민 신채하 양현서 윤가온 이유민" },
    { team: "사무팀", members: "오소연" },
    { team: "앙상블", members: "류다민 신민석 이하진 전지민" },
    { team: "도움 주신 분들", members: "강은혁 구인영 김대원 김민서 김세연 김소은 김정연 박정현 배건희 서창환 안규찬 우혜인 원준일 이동섭 이승민 이창섭 이학성 정승현 정원경 조영훈 황혜원 홍성혁 홍승표 그외" }
];

const Creators = () => {
    return (
        <PageTransition>
            <div style={{ paddingTop: '2rem' }}>
                <h2 className="serif" style={{ color: 'var(--nacre)', textAlign: 'center', marginBottom: '2rem' }}>
                    CREATORS' NOTES
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
                    {creatorsList.map((creator, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.15, duration: 0.6 }}
                            className="glass-panel"
                            style={{ padding: '2rem', position: 'relative' }}
                        >
                            <div style={{ position: 'absolute', top: -10, left: 20, fontSize: '3rem', color: 'rgba(200, 230, 224, 0.15)', fontFamily: 'serif' }}>
                                "
                            </div>

                            <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '1.5rem', fontStyle: 'italic', zIndex: 1, position: 'relative' }}>
                                {creator.comment}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
                                <div style={{ height: '1px', width: '30px', background: 'var(--nacre)' }}></div>
                                <div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '8px' }}>{creator.role}</span>
                                    <span className="serif" style={{ color: 'var(--nacre)', fontSize: '1.1rem' }}>{creator.name}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <div style={{ marginTop: '2rem' }}>
                        <h3 className="serif" style={{ color: 'var(--nacre)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.3rem' }}>STAFF & CAST</h3>
                        <div className="glass-panel" style={{ padding: '1.5rem 1rem' }}>
                            {teamList.map((team, idx) => (
                                <div key={idx} style={{ padding: '0.8rem 0', borderBottom: idx !== teamList.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ color: 'var(--nacre-dim)', fontSize: '0.8rem', fontWeight: 'bold' }}>{team.team}</div>
                                    <div style={{ color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: '1.5' }}>{team.members}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            KAIST 창작 뮤지컬 동아리 NUMBER
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Creators;
