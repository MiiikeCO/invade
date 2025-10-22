
import React from 'react';
import { AlienIcon, UfoIcon } from './icons';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-6xl font-bold text-green-500 mb-4 animate-pulse">SPACE INVADERS</h1>
      <h2 className="text-2xl text-white mb-8">ARCADE CLASSIC</h2>
      <button
        onClick={onStart}
        className="px-8 py-4 bg-green-500 text-black font-bold text-xl hover:bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
      >
        START GAME
      </button>
       <div className="mt-12 text-white text-lg">
            <h3 className="text-xl mb-4">-- SCORE TABLE --</h3>
            <div className="flex items-center justify-center space-x-4 w-64 mx-auto">
                <UfoIcon className="w-12 h-6" />
                <span className="text-red-500">= ??? MYSTERY</span>
            </div>
            <div className="flex items-center justify-center space-x-4 w-64 mx-auto mt-2">
                <AlienIcon frame={0} className="w-8 h-6" />
                <span>= 10-30 POINTS</span>
            </div>
       </div>
    </div>
  );
};

export default StartScreen;