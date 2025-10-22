
import React from 'react';
import { Alien as AlienTypeInterface, AlienType } from '../types';
import { AlienIcon } from './icons';

interface AlienProps {
  alien: AlienTypeInterface;
  animationFrame: number;
}

const MemoizedAlienIcon: React.FC<{type: AlienType, frame: number}> = React.memo(({ type, frame }) => {
    return <AlienIcon className="w-full h-full" frame={frame} />;
});

const Alien: React.FC<AlienProps> = ({ alien, animationFrame }) => {
  return (
    <div
      className="absolute"
      style={{ left: alien.x, top: alien.y, width: alien.width, height: alien.height }}
    >
      <div className={`absolute inset-0 transition-opacity duration-150 ${animationFrame === 0 ? 'opacity-100' : 'opacity-0'}`}>
        <MemoizedAlienIcon type={alien.type} frame={0} />
      </div>
      <div className={`absolute inset-0 transition-opacity duration-150 ${animationFrame === 1 ? 'opacity-100' : 'opacity-0'}`}>
        <MemoizedAlienIcon type={alien.type} frame={1} />
      </div>
    </div>
  );
};

export default Alien;