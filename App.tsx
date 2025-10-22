
import React, { useState, useEffect, useCallback } from 'react';
import GameScreen from './components/GameScreen';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import { GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const storedHighScore = localStorage.getItem('spaceInvadersHighScore');
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
  }, []);

  const updateHighScore = useCallback((currentScore: number) => {
    if (currentScore > highScore) {
      setHighScore(currentScore);
      localStorage.setItem('spaceInvadersHighScore', currentScore.toString());
    }
  }, [highScore]);

  const handleStartGame = () => {
    setScore(0);
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    updateHighScore(finalScore);
    setGameState(GameState.GAME_OVER);
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.PLAYING:
        return <GameScreen onGameOver={handleGameOver} highScore={highScore} />;
      case GameState.GAME_OVER:
        return <GameOverScreen score={score} highScore={highScore} onRestart={handleStartGame} />;
      case GameState.START:
      default:
        return <StartScreen onStart={handleStartGame} />;
    }
  };

  return (
    <div className="font-mono text-white flex flex-col items-center justify-center min-h-screen bg-black select-none">
      <div className="w-[800px] h-[600px] border-2 border-green-500 bg-black p-4 relative overflow-hidden">
        <span className="absolute top-1 left-1 text-xs text-green-500">v4</span>
        {renderContent()}
      </div>
       <p className="mt-4 text-sm text-gray-400">Controls: Left/Right Arrow Keys to Move, Spacebar to Shoot, P to Pause, Q to Quit, M to Mute</p>
    </div>
  );
};

export default App;