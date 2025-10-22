
import React from 'react';
import { Laser as LaserType } from '../types';

interface LaserProps {
  laser: LaserType;
  isPlayer: boolean;
}

const Laser: React.FC<LaserProps> = ({ laser, isPlayer }) => {
  const color = isPlayer ? 'bg-green-500' : 'bg-white';
  
  return (
    <div
      className={`absolute ${color}`}
      style={{ left: laser.x, top: laser.y, width: laser.width, height: laser.height }}
    />
  );
};

export default Laser;
