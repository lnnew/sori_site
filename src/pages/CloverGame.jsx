import React, { useRef, useEffect, useState } from 'react';
import Leaderboard from '../components/Leaderboard';
import { motion } from 'framer-motion';
import cloverImg from '../assets/images/클로버.png';

const CloverGame = () => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    // Physics & Game state refs to avoid React re-renders on every frame
    const gameState = useRef({
        x: 250,
        y: 100,
        vx: (Math.random() - 0.5) * 5 * 1.3, // Slightly faster initial x speed
        vy: 3.5 * 1.3, // Faster constant fall speed
        gravity: 0, // No gravity
        paddleX: 250,
        paddleWidth: 120,
        paddleHeight: 18,
        size: 40, // Clover size reduced
        bounceDecay: 1.05, // Speed increases slightly on bounce
        rotation: 0,
        rSpeed: (Math.random() - 0.5) * 5,

        // Effects & Rush
        currentScore: 0,
        comboTimer: 0,
        isRush: false,
        rushCountdown: 0,
        rushDuration: 0,
        trail: []
    });

    const reqRef = useRef(null);
    const imgRef = useRef(null);

    useEffect(() => {
        const img = new Image();
        img.src = cloverImg;
        img.onload = () => {
            imgRef.current = img;
            drawInitialState();
        };
        return () => cancelAnimationFrame(reqRef.current);
    }, []);

    const drawInitialState = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(200, 230, 224, 0.8)';
        ctx.fillRect(gameState.current.paddleX - gameState.current.paddleWidth / 2, canvas.height - 30, gameState.current.paddleWidth, gameState.current.paddleHeight);

        if (imgRef.current) {
            ctx.save();
            ctx.translate(gameState.current.x, gameState.current.y);
            // Draw without circle clipping so PNG transparency works naturally
            ctx.drawImage(imgRef.current, -gameState.current.size / 2, -gameState.current.size / 2, gameState.current.size, gameState.current.size);
            ctx.restore();
        }
    };

    const startGame = () => {
        setGameStarted(true);
        setGameOver(false);
        setScore(0);

        const canvas = canvasRef.current;
        gameState.current = {
            ...gameState.current,
            x: canvas.width / 2,
            y: 100,
            vx: (Math.random() - 0.5) * 5 * 1.3,
            vy: 3.5 * 1.3, // Start moving down at faster baseline
            gravity: 0,
            rotation: 0,
            rSpeed: (Math.random() - 0.5) * 5,
            currentScore: 0,
            comboTimer: 0,
            isRush: false,
            rushCountdown: Math.random() * 240 + 60, // 1~5s in frames
            rushDuration: 0,
            trail: []
        };

        if (reqRef.current) cancelAnimationFrame(reqRef.current);
        reqRef.current = requestAnimationFrame(updateGame);
    };

    const updateGame = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const state = gameState.current;

        // Physics
        state.vy += state.gravity;
        state.x += state.vx;
        state.y += state.vy;
        state.rotation += state.rSpeed;

        // Rush Logic
        if (state.currentScore >= 20) {
            if (state.isRush) {
                state.rushDuration--;
                if (state.rushDuration <= 0) {
                    state.isRush = false;
                    state.rushCountdown = Math.random() * 240 + 60; // Next rush in 1~5s
                    // Revert speed boost
                    state.vx /= 1.5;
                    state.vy /= 1.5;
                }
            } else {
                state.rushCountdown--;
                if (state.rushCountdown <= 0) {
                    state.isRush = true;
                    state.rushDuration = 60; // Rush lasts 1 second (60 frames)
                    // Apply speed boost
                    state.vx *= 1.5;
                    state.vy *= 1.5;
                }
            }
        }

        // Trail recording for Rush effect
        if (state.isRush) {
            state.trail.push({ x: state.x, y: state.y, size: state.size });
            if (state.trail.length > 20) state.trail.shift();
        } else {
            if (state.trail.length > 0) state.trail.shift();
        }

        // Wall collisions
        if (state.x - state.size / 2 < 0) {
            state.x = state.size / 2;
            state.vx *= -1;
            state.rSpeed = -state.rSpeed;
        } else if (state.x + state.size / 2 > canvas.width) {
            state.x = canvas.width - state.size / 2;
            state.vx *= -1;
            state.rSpeed = -state.rSpeed;
        }

        // Top wall collision (since there is no gravity, it might fly out the top)
        if (state.y - state.size / 2 < 0 && state.vy < 0) {
            state.y = state.size / 2;
            state.vy *= -1;
        }

        // Paddle collision
        const paddleY = canvas.height - 30;
        if (
            state.y + state.size / 2 >= paddleY &&
            state.y - state.size / 2 <= paddleY + state.paddleHeight &&
            state.x >= state.paddleX - state.paddleWidth / 2 - state.size / 2 &&
            state.x <= state.paddleX + state.paddleWidth / 2 + state.size / 2 &&
            state.vy > 0
        ) {
            state.y = paddleY - state.size / 2;
            state.vy = -state.vy * state.bounceDecay;

            // Add some English (spin) to the velocity based on where it hit the paddle + 10% randomness
            const hitPoint = (state.x - state.paddleX) / (state.paddleWidth / 2);
            state.vx += hitPoint * 2 + (Math.random() - 0.5) * 0.4; // 10% randomness compared to before
            state.rSpeed = hitPoint * 10 + (Math.random() - 0.5) * 1.5;

            // Prevent going totally horizontal or vertical speed limits
            if (state.vx > 20) state.vx = 20;
            if (state.vx < -20) state.vx = -20;

            // Limit vy scaling so it doesn't become impossibly fast instantly
            if (state.vy < -20) state.vy = -20;

            state.currentScore++;
            setScore(state.currentScore);

            if (state.currentScore > 0 && state.currentScore % 10 === 0) {
                state.comboTimer = 60; // Show combo text for 60 frames
            }
        }

        // Game Over
        if (state.y - state.size / 2 > canvas.height) {
            setGameOver(true);
            setGameStarted(false);
            return;
        }

        // Render
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render trail
        if (state.trail.length > 0 && imgRef.current) {
            state.trail.forEach((p, i) => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.globalAlpha = (i / state.trail.length) * 0.5;
                // Add a rainbow filter effect to the trail
                ctx.filter = `hue-rotate(${i * 20}deg) saturate(200%)`;
                ctx.drawImage(imgRef.current, -p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            });
        }

        // Draw Paddle
        ctx.fillStyle = 'rgba(200, 230, 224, 0.9)'; // Gold paddle
        ctx.shadowColor = 'rgba(200, 230, 224, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fillRect(state.paddleX - state.paddleWidth / 2, paddleY, state.paddleWidth, state.paddleHeight);
        ctx.shadowBlur = 0;

        // Draw Clover
        if (imgRef.current) {
            ctx.save();
            ctx.translate(state.x, state.y);
            ctx.rotate((state.rotation * Math.PI) / 180);

            // Draw without circle clipping to show PNG transparency natively
            ctx.drawImage(imgRef.current, -state.size / 2, -state.size / 2, state.size, state.size);
            ctx.restore();
        }

        // Render 10-combo text
        if (state.comboTimer > 0) {
            state.comboTimer--;
            const alpha = state.comboTimer / 60;
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            ctx.font = 'bold 50px "Gowun Dodum", sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(200, 230, 224, 0.8)';
            ctx.shadowBlur = 15;
            // Pop up text effect
            const textY = canvas.height / 2 - (60 - state.comboTimer) * 1.5;
            ctx.fillText(`${state.currentScore} COMBO!`, canvas.width / 2, textY);
            ctx.shadowBlur = 0;
        }

        // Render RUSH mode indicator text
        if (state.isRush) {
            ctx.fillStyle = `rgba(255, 100, 100, 0.7)`;
            ctx.font = 'bold 30px "Gowun Dodum", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`RUSH TIME!`, canvas.width / 2, 40);
        }

        reqRef.current = requestAnimationFrame(updateGame);
    };

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        // Mouse X relative to canvas
        const mouseX = e.clientX - rect.left;
        // Map to internal canvas resolution (if scaled)
        const scaleX = canvas.width / rect.width;
        gameState.current.paddleX = mouseX * scaleX;
    };

    const handleTouchMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const scaleX = canvas.width / rect.width;
        gameState.current.paddleX = touchX * scaleX;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '4rem 20px 90px', boxSizing: 'border-box' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h2 className="title-glow" style={{ fontFamily: "'Yeongwol', serif", color: '#fff', fontSize: '2.4rem', marginBottom: '0.2rem', letterSpacing: '2px' }}>
                    클로버 지키기
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '1px' }}>
                    네잎클로버가 바닥에 떨어지지 않게 패들을 움직여주세요!
                </p>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                <div style={{
                    position: 'relative', width: '100%', maxWidth: '500px', height: '500px',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden',
                    background: 'rgba(0,0,0,0.3)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                }}>
                    <canvas
                        ref={canvasRef}
                        width={500}
                        height={500}
                        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
                        onMouseMove={handleMouseMove}
                        onTouchMove={handleTouchMove}
                    />

                    {!gameStarted && !gameOver && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.5)' }}>
                            <button
                                onClick={startGame}
                                style={{ padding: '15px 30px', background: 'var(--nacre)', border: 'none', borderRadius: '30px', fontSize: '1.2rem', fontWeight: 'bold', fontFamily: "'Gowun Dodum', sans-serif", cursor: 'pointer' }}
                            >
                                게임 시작
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '1rem', fontSize: '1.5rem', color: 'var(--nacre)', fontWeight: 'bold' }}>
                    점수: {score}
                </div>

                {gameOver && (
                    <div style={{ width: '100%', maxWidth: '400px' }}>
                        <Leaderboard
                            gameKey="clover_bounce"
                            currentScore={score}
                            onRestart={startGame}
                            scoreDesc="점"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CloverGame;
