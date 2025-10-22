
import React from 'react';
import { Position } from '../types';
import { PlayerIcon } from './icons';

interface PlayerProps {
  position: Position;
  width: number;
  height: number;
}

const Player: React.FC<PlayerProps> = ({ position, width, height }) => {
  return (
    <div
      className="absolute"
      style={{ left: position.x, top: position.y, width, height }}
    >
        <PlayerIcon className="w-full h-full" />
    </div>
  );
};

export default Player;
