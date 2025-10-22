
import React from 'react';
import { Ufo as UfoType } from '../types';
import { UfoIcon } from './icons';

interface UfoProps {
  ufo: UfoType;
}

const Ufo: React.FC<UfoProps> = ({ ufo }) => {
  return (
    <div
      className="absolute"
      style={{ left: ufo.x, top: ufo.y, width: ufo.width, height: ufo.height }}
    >
        <UfoIcon className="w-full h-full" />
    </div>
  );
};

export default Ufo;
