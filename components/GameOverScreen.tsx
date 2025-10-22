
import React from 'react';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScore, onRestart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-6xl font-bold text-red-500 mb-4 animate-pulse">GAME OVER</h1>
      <p className="text-2xl text-white mb-2">FINAL SCORE: {score}</p>
      <p className="text-2xl text-green-500 mb-8">HIGH SCORE: {highScore}</p>
      <button
        onClick={onRestart}
        className="px-8 py-4 bg-green-500 text-black font-bold text-xl hover:bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
      >
        PLAY AGAIN
      </button>
    </div>
  );
};

export default GameOverScreen;
