
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Player as PlayerType, Alien as AlienType, Laser, Ufo, Bunker, BunkerPart, AlienType as AlienEnum, Position } from '../types';
import Player from './Player';
import Alien from './Alien';
import UfoComponent from './Ufo';
import LaserComponent from './Laser';
import BunkerComponent from './Bunker';
import { PlayerIcon, ExplosionIcon, SpeakerOnIcon, SpeakerOffIcon } from './icons';
import * as C from '../constants';

interface GameScreenProps {
  onGameOver: (score: number) => void;
  highScore: number;
}

const GameScreen: React.FC<GameScreenProps> = ({ onGameOver, highScore }) => {
  const [player, setPlayer] = useState<PlayerType>({ x: C.GAME_WIDTH / 2 - C.PLAYER_WIDTH / 2, y: C.PLAYER_Y_POSITION });
  const [aliens, setAliens] = useState<AlienType[]>([]);
  const [playerLaser, setPlayerLaser] = useState<Laser | null>(null);
  const [alienLasers, setAlienLasers] = useState<Laser[]>([]);
  const [ufo, setUfo] = useState<Ufo | null>(null);
  const [bunkers, setBunkers] = useState<Bunker[]>([]);
  
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayerHit, setIsPlayerHit] = useState(false);
  const [ufoScoreDisplay, setUfoScoreDisplay] = useState<{ score: number, position: Position } | null>(null);
  const [isAudioReady, setIsAudioReady] = useState(false);


  const keysPressed = useRef<Record<string, boolean>>({});
  const gameLoopRef = useRef<number>();
  const lastAlienMoveTime = useRef(0);
  const alienDirection = useRef(1); // 1 for right, -1 for left
  const alienAnimationFrame = useRef(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const ufoSoundSourceRef = useRef<{ main: OscillatorNode, lfo: OscillatorNode } | null>(null);
  const alienMoveSoundIndexRef = useRef(0);
  
  useEffect(() => {
    try {
        // Fix: Provide an empty options object to the AudioContext constructor to prevent "Expected 1 arguments, but got 0" error.
        const context = new (window.AudioContext || (window as any).webkitAudioContext)({});
        audioContextRef.current = context;
    } catch(e) {
        console.error("Web Audio API is not supported in this browser");
    }
    return () => {
        audioContextRef.current?.close();
    }
  }, []);

  const initAudio = useCallback(() => {
    if (isAudioReady || !audioContextRef.current) return;
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
            setIsAudioReady(true);
        });
    } else {
        setIsAudioReady(true);
    }
  }, [isAudioReady]);

  const playSound = (type: 'shoot' | 'explosion' | 'alien' | 'ufoStart' | 'ufoStop') => {
    const audioContext = audioContextRef.current;
    
    if (type === 'ufoStop') {
        if (ufoSoundSourceRef.current) {
            ufoSoundSourceRef.current.main.stop();
            ufoSoundSourceRef.current.lfo.stop();
            ufoSoundSourceRef.current = null;
        }
        return;
    }
    
    if (isMuted || !isAudioReady || !audioContext) return;

    if (type === 'shoot') {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.1);
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'explosion') {
        const bufferSize = audioContext.sampleRate * 0.5;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = buffer;
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);
        noiseSource.connect(gainNode);
        gainNode.connect(audioContext.destination);
        noiseSource.start();
    } else if (type === 'alien') {
        const frequencies = [50, 40, 30, 20];
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(frequencies[alienMoveSoundIndexRef.current], audioContext.currentTime);
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);
        alienMoveSoundIndexRef.current = (alienMoveSoundIndexRef.current + 1) % frequencies.length;
    } else if (type === 'ufoStart') {
        if (ufoSoundSourceRef.current) return;
        const mainOscillator = audioContext.createOscillator();
        mainOscillator.type = 'sawtooth';
        mainOscillator.frequency.setValueAtTime(800, audioContext.currentTime);

        const lfo = audioContext.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(10, audioContext.currentTime); 

        const lfoGain = audioContext.createGain();
        lfoGain.gain.setValueAtTime(200, audioContext.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(mainOscillator.frequency);

        const mainGain = audioContext.createGain();
        mainGain.gain.setValueAtTime(0.1, audioContext.currentTime);
        mainOscillator.connect(mainGain);
        mainGain.connect(audioContext.destination);
        
        lfo.start();
        mainOscillator.start();
        
        ufoSoundSourceRef.current = { main: mainOscillator, lfo };
    }
  };

  const initLevel = useCallback((currentLevel: number) => {
    // Reset aliens
    const newAliens: AlienType[] = [];
    let alienId = 0;
    for (let row = 0; row < C.ALIEN_ROWS; row++) {
      for (let col = 0; col < C.ALIEN_COLS; col++) {
        let type: AlienEnum;
        let scoreVal: number;
        if (row === 0) {
          type = AlienEnum.TOP;
          scoreVal = 30;
        } else if (row < 3) {
          type = AlienEnum.MIDDLE;
          scoreVal = 20;
        } else {
          type = AlienEnum.BOTTOM;
          scoreVal = 10;
        }
        const alienX = col * (C.ALIEN_WIDTH + C.ALIEN_SPACING_X) + (C.GAME_WIDTH - (C.ALIEN_COLS * (C.ALIEN_WIDTH + C.ALIEN_SPACING_X) - C.ALIEN_SPACING_X)) / 2;
        const alienY = C.ALIEN_GRID_START_Y + row * (C.ALIEN_HEIGHT + C.ALIEN_SPACING_Y);
        newAliens.push({
          id: alienId++,
          x: alienX,
          y: alienY,
          width: C.ALIEN_WIDTH,
          height: C.ALIEN_HEIGHT,
          type,
          score: scoreVal,
        });
      }
    }
    setAliens(newAliens);

    // Reset bunkers
    const newBunkers: Bunker[] = [];
    const bunkerSpacing = (C.GAME_WIDTH - C.BUNKER_COUNT * C.BUNKER_WIDTH) / (C.BUNKER_COUNT + 1);
    for (let i = 0; i < C.BUNKER_COUNT; i++) {
        const bunkerX = bunkerSpacing * (i + 1) + C.BUNKER_WIDTH * i;
        const parts: BunkerPart[][] = [];
        let partId = 0;
        const rows = Math.floor(C.BUNKER_HEIGHT / C.BUNKER_PART_SIZE);
        const cols = Math.floor(C.BUNKER_WIDTH / C.BUNKER_PART_SIZE);
        for (let r = 0; r < rows; r++) {
            const rowParts: BunkerPart[] = [];
            for (let c = 0; c < cols; c++) {
                rowParts.push({
                    id: partId++,
                    x: bunkerX + c * C.BUNKER_PART_SIZE,
                    y: C.BUNKER_Y_POSITION + r * C.BUNKER_PART_SIZE,
                    health: C.BUNKER_PART_HEALTH,
                });
            }
            parts.push(rowParts);
        }
        newBunkers.push({ id: i, parts });
    }
    setBunkers(newBunkers);

    setPlayer({ x: C.GAME_WIDTH / 2 - C.PLAYER_WIDTH / 2, y: C.PLAYER_Y_POSITION });
    setPlayerLaser(null);
    setAlienLasers([]);
    setUfo(null);
    playSound('ufoStop');
    alienDirection.current = 1;

  }, []);

  useEffect(() => {
    initLevel(level);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const checkCollision = (a: {x:number, y:number, width:number, height:number}, b: {x:number, y:number, width:number, height:number}) => {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  };
  
  const gameLoop = useCallback((timestamp: number) => {
    if (isPaused || isPlayerHit) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
    }

    // Player Movement
    setPlayer(p => {
        let newX = p.x;
        if (keysPressed.current['ArrowLeft']) newX -= C.PLAYER_SPEED;
        if (keysPressed.current['ArrowRight']) newX += C.PLAYER_SPEED;
        newX = Math.max(0, Math.min(C.GAME_WIDTH - C.PLAYER_WIDTH, newX));
        return { ...p, x: newX };
    });

    // Player Shooting
    if (keysPressed.current[' '] && !playerLaser) {
        playSound('shoot');
        setPlayerLaser({
            id: Date.now(),
            x: player.x + C.PLAYER_WIDTH / 2 - C.LASER_WIDTH / 2,
            y: player.y,
            width: C.LASER_WIDTH,
            height: C.LASER_HEIGHT
        });
    }

    // Update Player Laser
    if (playerLaser) {
        setPlayerLaser(l => {
            if(!l) return null;
            const newY = l.y - C.PLAYER_LASER_SPEED;
            return newY > 0 ? { ...l, y: newY } : null;
        });
    }

    // Alien Movement
    const alienMoveInterval = 500 + 300 * (1 - aliens.length / (C.ALIEN_ROWS * C.ALIEN_COLS)) - level * 50;
    if (timestamp - lastAlienMoveTime.current > Math.max(100, alienMoveInterval)) {
        lastAlienMoveTime.current = timestamp;
        alienAnimationFrame.current = 1 - alienAnimationFrame.current;
        playSound('alien');

        let edgeReached = false;
        let lowestAlienY = 0;
        aliens.forEach(a => {
            if ((a.x + C.ALIEN_WIDTH >= C.GAME_WIDTH && alienDirection.current === 1) || (a.x <= 0 && alienDirection.current === -1)) {
                edgeReached = true;
            }
            if (a.y > lowestAlienY) {
                lowestAlienY = a.y;
            }
        });

        if (lowestAlienY + C.ALIEN_HEIGHT >= C.PLAYER_Y_POSITION) {
            onGameOver(score);
            return;
        }

        if (edgeReached) {
            alienDirection.current *= -1;
            setAliens(prev => prev.map(a => ({ ...a, y: a.y + C.ALIEN_MOVE_STEP_Y })));
        } else {
            setAliens(prev => prev.map(a => ({ ...a, x: a.x + C.ALIEN_MOVE_STEP_X * alienDirection.current })));
        }
    }

    // Alien Firing
    setAliens(currentAliens => {
        if (Math.random() < C.ALIEN_FIRE_CHANCE * (1 + currentAliens.length / 10)) {
            const shooters = currentAliens.filter(a => {
                return !currentAliens.some(other => other.x === a.x && other.y > a.y);
            });
            if (shooters.length > 0) {
                const shooter = shooters[Math.floor(Math.random() * shooters.length)];
                setAlienLasers(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    x: shooter.x + shooter.width / 2 - C.LASER_WIDTH / 2,
                    y: shooter.y + shooter.height,
                    width: C.LASER_WIDTH,
                    height: C.LASER_HEIGHT,
                }]);
            }
        }
        return currentAliens;
    });

    // Update Alien Lasers
    setAlienLasers(prev => prev.map(l => ({ ...l, y: l.y + C.ALIEN_LASER_SPEED })).filter(l => l.y < C.GAME_HEIGHT));

    // UFO Logic
    if (!ufo && Math.random() < C.UFO_SPAWN_CHANCE) {
        playSound('ufoStart');
        setUfo({ 
            id: Date.now(), 
            x: -C.UFO_WIDTH, 
            y: C.UFO_Y_POSITION, 
            width: C.UFO_WIDTH, 
            height: C.UFO_HEIGHT,
            score: [50, 100, 150, 300][Math.floor(Math.random() * 4)]
        });
    }

    if (ufo) {
        setUfo(u => {
            if(!u) return null;
            const newX = u.x + C.UFO_SPEED;
            if (newX > C.GAME_WIDTH) {
                playSound('ufoStop');
                return null;
            }
            return { ...u, x: newX };
        });
    }

    // Collision Detection
    if (playerLaser) {
        const hitAlien = aliens.find(a => checkCollision(playerLaser, a));
        if (hitAlien) {
            setScore(s => s + hitAlien.score);
            setAliens(prev => prev.filter(a => a.id !== hitAlien.id));
            setPlayerLaser(null);
        }
    }

    if (playerLaser && ufo) {
        if (checkCollision(playerLaser, ufo)) {
            setScore(s => s + ufo.score);
            setUfoScoreDisplay({ score: ufo.score, position: { x: ufo.x, y: ufo.y } });
            setTimeout(() => setUfoScoreDisplay(null), 1000);
            playSound('ufoStop');
            setUfo(null);
            setPlayerLaser(null);
        }
    }

    const hitByAlien = alienLasers.find(l => checkCollision(l, { ...player, width: C.PLAYER_WIDTH, height: C.PLAYER_HEIGHT }));
    if (hitByAlien && !isPlayerHit) {
        setAlienLasers(prev => prev.filter(l => l.id !== hitByAlien.id));
        setIsPlayerHit(true);
        playSound('explosion');
        setTimeout(() => {
            setLives(l => {
                const newLives = l - 1;
                if (newLives <= 0) {
                    onGameOver(score);
                } else {
                    setIsPlayerHit(false);
                    setPlayer({ x: C.GAME_WIDTH / 2 - C.PLAYER_WIDTH / 2, y: C.PLAYER_Y_POSITION });
                }
                return newLives;
            });
        }, 1000);
    }
    
    const allLasers = [...alienLasers, playerLaser].filter(Boolean) as Laser[];
    allLasers.forEach(laser => {
        let laserHit = false;
        bunkers.forEach(bunker => {
            bunker.parts.forEach(row => {
                row.forEach(part => {
                    if (part.health > 0 && checkCollision(laser, {...part, width: C.BUNKER_PART_SIZE, height: C.BUNKER_PART_SIZE})) {
                        part.health -= 1;
                        laserHit = true;
                    }
                });
            });
        });
        if (laserHit) {
            if (laser.id === playerLaser?.id) setPlayerLaser(null);
            else setAlienLasers(prev => prev.filter(l => l.id !== laser.id));
        }
    });
    setBunkers([...bunkers]);

    if (aliens.length === 0) {
        setLevel(l => l + 1);
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [aliens, alienLasers, isPaused, lives, onGameOver, player, playerLaser, score, ufo, bunkers, level, isPlayerHit]);

  useEffect(() => {
    // This effect handles the first user interaction to enable audio
    const handleFirstInteraction = () => {
        initAudio();
    };
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    window.addEventListener('click', handleFirstInteraction, { once: true });

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'p') {
            setIsPaused(p => !p);
        } else if (e.key.toLowerCase() === 'q') {
            onGameOver(score);
        } else if (e.key.toLowerCase() === 'm') {
            setIsMuted(m => !m);
        } else {
            keysPressed.current[e.key] = true;
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      playSound('ufoStop');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameLoop, initAudio]);

  useEffect(() => {
    const audioContext = audioContextRef.current;
    if (audioContext) {
        if (isPaused) {
            audioContext.suspend();
        } else {
            audioContext.resume();
        }
    }
    // Manage UFO sound with pause state
    if (isPaused) {
        playSound('ufoStop');
    } else if (ufo) {
        playSound('ufoStart');
    }
  }, [isPaused, ufo]);

  useEffect(() => {
    // Manage UFO sound with mute state
    if (isMuted) {
      playSound('ufoStop');
    } else if (!isPaused && ufo) {
      playSound('ufoStart');
    }
  }, [isMuted, isPaused, ufo]);


  return (
    <div className="w-full h-full relative bg-black">
        <div className="grid grid-cols-3 items-center text-lg px-2 text-green-500">
            <div className="flex-1">SCORE: {score}</div>
            <div className="flex-1 text-center">HIGH SCORE: {highScore}</div>
            <div className="flex-1 flex items-center justify-end">
                <span>LIVES: {lives}</span>
                <div className="flex mx-2">
                    {Array.from({ length: lives > 0 ? lives - 1 : 0 }).map((_, i) => (
                        <PlayerIcon key={i} className="w-6 h-4" />
                    ))}
                </div>
                <button onClick={() => setIsMuted(m => !m)} className="focus:outline-none w-6 h-6">
                    {isMuted ? <SpeakerOffIcon className="w-full h-full" /> : <SpeakerOnIcon className="w-full h-full" />}
                </button>
            </div>
        </div>

        {isPlayerHit ? (
            <div className="absolute" style={{ left: player.x, top: player.y, width: C.PLAYER_WIDTH, height: C.PLAYER_WIDTH }}>
              <ExplosionIcon className="w-full h-full" />
            </div>
        ) : (
            <Player position={player} width={C.PLAYER_WIDTH} height={C.PLAYER_HEIGHT} />
        )}
        {aliens.map(alien => <Alien key={alien.id} alien={alien} animationFrame={alienAnimationFrame.current} />)}
        {playerLaser && <LaserComponent laser={playerLaser} isPlayer={true} />}
        {alienLasers.map(laser => <LaserComponent key={laser.id} laser={laser} isPlayer={false} />)}
        {ufo && <UfoComponent ufo={ufo} />}
        {bunkers.map(bunker => <BunkerComponent key={bunker.id} bunker={bunker} />)}

        {ufoScoreDisplay && (
            <div className="absolute text-red-500 font-bold text-lg" style={{ left: ufoScoreDisplay.position.x, top: ufoScoreDisplay.position.y }}>
                {ufoScoreDisplay.score}
            </div>
        )}

        {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <p className="text-5xl text-yellow-400 animate-pulse font-bold">PAUSED</p>
            </div>
        )}

        <div className="absolute bottom-10 left-0 right-0 h-px bg-green-500"></div>
    </div>
  );
};

export default GameScreen;