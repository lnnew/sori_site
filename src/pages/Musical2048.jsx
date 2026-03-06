import React, { useState, useEffect, useCallback, useRef } from 'react';
import Leaderboard from '../components/Leaderboard';
import { motion, AnimatePresence } from 'framer-motion';

const SYLLABLES = ["카", "이", "스", "트", "창", "작", "뮤", "지", "컬", "동", "아", "리", "넘", "버"];

// Power of 2 to Syllable index (2=0, 4=1, 8=2, 16=3...)
const getSyllable = (val) => {
    if (val === 0) return "";
    const index = Math.log2(val) - 1;
    return SYLLABLES[index] || "?";
};

// Aesthetic pastel palette for 2048 tiles
const PALETTES = [
    { bg: '#fff1eb', color: '#7a6a6a' }, // 2
    { bg: '#fdfbfb', color: '#7a6a6a' }, // 4
    { bg: '#f3e7e9', color: '#ab8181' }, // 8
    { bg: '#e2d1c3', color: '#fff' }, // 16
    { bg: '#df89b5', color: '#fff' }, // 32
    { bg: '#bfd9fe', color: '#667eea' }, // 64
    { bg: '#96e6a1', color: '#fff' }, // 128
    { bg: '#d4fc79', color: '#4a7c59' }, // 256
    { bg: '#fbc2eb', color: '#fff' }, // 512
    { bg: '#a18cd1', color: '#fff' }, // 1024
    { bg: '#ff9a9e', color: '#fff' }, // 2048 ("아")
    { bg: '#fecfef', color: '#884d80' }, // 4096
    { bg: '#a8edea', color: '#458580' }, // 8192
    { bg: '#ffecd2', color: '#fcb69f' }, // 16384 ("버")
];

const getTileStyle = (val) => {
    if (val === 0) return { background: 'rgba(255,255,255,0.05)', color: 'transparent', border: 'none' };
    const power = Math.log2(val);
    const colorStyle = PALETTES[Math.min(power - 1, PALETTES.length - 1)];
    return {
        background: colorStyle.bg,
        color: colorStyle.color,
        boxShadow: power >= 11 ? '0 0 15px rgba(255,154,158,0.8)' : '1px 1px 3px rgba(0,0,0,0.1)',
        textShadow: 'none'
    };
};

const Musical2048 = () => {
    const [tiles, setTiles] = useState([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    // Swipe handling
    const touchStartXY = useRef({ x: 0, y: 0 });
    const nextId = useRef(1);

    // Initializer
    const initializeGame = useCallback(() => {
        let freshTiles = [];
        freshTiles = addRandomTileInternal(freshTiles);
        freshTiles = addRandomTileInternal(freshTiles);
        setTiles(freshTiles);
        setScore(0);
        setGameOver(false);
    }, []);

    // Internal helper that returns a new tile array
    const addRandomTileInternal = (currentTiles) => {
        const board = Array(4).fill(null).map(() => Array(4).fill(0));
        currentTiles.forEach(t => {
            if (t) board[t.r][t.c] = t.val;
        });

        const emptySpots = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (board[r][c] === 0) emptySpots.push({ r, c });
            }
        }
        if (emptySpots.length === 0) return currentTiles;

        const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
        const newTile = {
            id: nextId.current++,
            r: spot.r,
            c: spot.c,
            val: Math.random() < 0.9 ? 2 : 4,
            isNew: true
        };
        return [...currentTiles, newTile];
    };

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    useEffect(() => {
        // Keyboard controls
        const handleKeyDown = (e) => {
            if (gameOver || ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) === false) return;
            e.preventDefault();
            switch (e.key) {
                case 'ArrowUp': handleMove('UP'); break;
                case 'ArrowDown': handleMove('DOWN'); break;
                case 'ArrowLeft': handleMove('LEFT'); break;
                case 'ArrowRight': handleMove('RIGHT'); break;
                default: break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameOver]); // Rerun effect if game ends so we dont process moves

    const isGameLost = (currentTiles) => {
        const board = Array(4).fill(null).map(() => Array(4).fill(0));
        currentTiles.forEach(t => {
            if (t) board[t.r][t.c] = t.val;
        });

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (board[r][c] === 0) return false;
            }
        }
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (r < 3 && board[r][c] === board[r + 1][c]) return false;
                if (c < 3 && board[r][c] === board[r][c + 1]) return false;
            }
        }
        return true;
    };

    const handleMove = (direction) => {
        setTiles(prevTiles => {
            let moved = false;
            let pointsGained = 0;

            // 1. Build a 2D mapping of active tiles (ignoring old merged ones that should be unmounted)
            const activeTiles = prevTiles.filter(t => !t.isMergedFlag);
            const board = Array(4).fill(null).map(() => Array(4).fill(null));
            activeTiles.forEach(t => {
                board[t.r][t.c] = { ...t, isNew: false, isMerged: false };
            });

            const newTiles = []; // We will accumulate mutated old tiles here

            const processLine = (line) => {
                let nonNull = line.filter(t => t !== null);
                let result = [];
                for (let i = 0; i < nonNull.length; i++) {
                    if (i < nonNull.length - 1 && nonNull[i].val === nonNull[i + 1].val && !nonNull[i].isMerged) {
                        // Merge!
                        const mergedVal = nonNull[i].val * 2;
                        pointsGained += mergedVal;
                        result.push({ ...nonNull[i], val: mergedVal, isMerged: true });
                        i++; // Skip the next tile because it merged
                        moved = true;
                    } else {
                        result.push(nonNull[i]);
                    }
                }
                while (result.length < 4) result.push(null);
                return result;
            };

            if (direction === 'LEFT') {
                for (let r = 0; r < 4; r++) {
                    const newLine = processLine(board[r]);
                    for (let c = 0; c < 4; c++) {
                        if (newLine[c]) {
                            if (newLine[c].c !== c) moved = true;
                            newLine[c].c = c;
                            newTiles.push(newLine[c]);
                        }
                    }
                }
            } else if (direction === 'RIGHT') {
                for (let r = 0; r < 4; r++) {
                    const newLine = processLine([...board[r]].reverse()).reverse();
                    for (let c = 0; c < 4; c++) {
                        if (newLine[c]) {
                            if (newLine[c].c !== c) moved = true;
                            newLine[c].c = c;
                            newTiles.push(newLine[c]);
                        }
                    }
                }
            } else if (direction === 'UP') {
                for (let c = 0; c < 4; c++) {
                    const line = [board[0][c], board[1][c], board[2][c], board[3][c]];
                    const newLine = processLine(line);
                    for (let r = 0; r < 4; r++) {
                        if (newLine[r]) {
                            if (newLine[r].r !== r) moved = true;
                            newLine[r].r = r;
                            newTiles.push(newLine[r]);
                        }
                    }
                }
            } else if (direction === 'DOWN') {
                for (let c = 0; c < 4; c++) {
                    const line = [board[3][c], board[2][c], board[1][c], board[0][c]];
                    const newLine = processLine(line).reverse();
                    for (let r = 0; r < 4; r++) {
                        if (newLine[r]) {
                            if (newLine[r].r !== r) moved = true;
                            newLine[r].r = r;
                            newTiles.push(newLine[r]);
                        }
                    }
                }
            }

            if (moved) {
                if (pointsGained > 0) {
                    setScore(prev => prev + pointsGained);
                }

                let finalizedTiles = addRandomTileInternal(newTiles);

                if (isGameLost(finalizedTiles)) {
                    setGameOver(true);
                }
                return finalizedTiles;
            }
            return prevTiles; // No move happened
        });
    };

    // Touch handlers for mobile swipe
    const onTouchStart = (e) => {
        touchStartXY.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    };

    const onTouchEnd = (e) => {
        if (gameOver) return;
        const xDist = e.changedTouches[0].clientX - touchStartXY.current.x;
        const yDist = e.changedTouches[0].clientY - touchStartXY.current.y;

        if (Math.abs(xDist) < 30 && Math.abs(yDist) < 30) return; // Ignore taps

        if (Math.abs(xDist) > Math.abs(yDist)) {
            if (xDist > 0) handleMove('RIGHT');
            else handleMove('LEFT');
        } else {
            if (yDist > 0) handleMove('DOWN');
            else handleMove('UP');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '4rem 20px 90px', boxSizing: 'border-box' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h2 className="title-glow" style={{ fontFamily: "'Yeongwol', serif", color: '#fff', fontSize: '2.4rem', marginBottom: '0.2rem', letterSpacing: '2px' }}>
                    넘048
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '1px' }}>
                    상하좌우 스와이프하여 타일을 합쳐보세요!<br />
                    (카-이-스-트-창-작-뮤-지-컬-동-아-리-넘-버)
                </p>
                <div style={{ fontSize: '1.5rem', color: 'var(--nacre)', fontWeight: 'bold', marginTop: '10px' }}>
                    점수: {score}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <div
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                    style={{
                        position: 'relative',
                        background: 'rgba(50, 50, 50, 0.4)', // Slightly lighter dark background
                        padding: '10px',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '400px',
                        aspectRatio: '1/1',
                        border: '1px solid rgba(200, 230, 224,0.2)',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                        touchAction: 'none' // Prevent scrolling while swiping
                    }}
                >
                    {/* Background empty cells */}
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div key={`bg-${i}`} style={{
                            position: 'absolute',
                            width: '23%',
                            height: '23%',
                            top: `calc(${Math.floor(i / 4) * 25}% + 1%)`,
                            left: `calc(${(i % 4) * 25}% + 1%)`,
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px'
                        }} />
                    ))}

                    {/* Active moving tiles */}
                    <AnimatePresence>
                        {tiles.map((tile) => (
                            <motion.div
                                key={tile.id}
                                initial={tile.isNew ? { scale: 0, opacity: 0 } : false}
                                animate={{
                                    scale: tile.isMerged ? [1, 1.15, 1] : 1, // Pop effect when merged
                                    opacity: 1,
                                    top: `calc(${tile.r * 25}% + 1%)`,
                                    left: `calc(${tile.c * 25}% + 1%)`
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 250,
                                    damping: 25,
                                    mass: 1
                                }}
                                style={{
                                    ...getTileStyle(tile.val),
                                    position: 'absolute',
                                    width: '23%',
                                    height: '23%',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2.8rem',
                                    fontWeight: 'normal',
                                    fontFamily: "'Nanum Pen Script', cursive",
                                    zIndex: tile.val > 0 ? 10 : 1
                                }}
                            >
                                {getSyllable(tile.val)}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {gameOver && (
                <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                    <Leaderboard
                        gameKey="2048"
                        currentScore={score}
                        onRestart={initializeGame}
                        scoreDesc="점"
                    />
                </div>
            )}
        </div>
    );
};

export default Musical2048;
