
import React from 'react';
import { Bunker as BunkerType } from '../types';
import * as C from '../constants';

interface BunkerProps {
  bunker: BunkerType;
}

const Bunker: React.FC<BunkerProps> = ({ bunker }) => {
  return (
    <>
      {bunker.parts.flat().map((part) => {
        if (part.health <= 0) return null;
        
        let opacity = 'opacity-100';
        if (part.health < C.BUNKER_PART_HEALTH * 0.33) {
            opacity = 'opacity-25'
        } else if (part.health < C.BUNKER_PART_HEALTH * 0.66) {
            opacity = 'opacity-50'
        }

        return (
            <div
                key={part.id}
                className={`absolute bg-green-500 ${opacity}`}
                style={{
                    left: part.x,
                    top: part.y,
                    width: C.BUNKER_PART_SIZE,
                    height: C.BUNKER_PART_SIZE,
                }}
            />
        );
      })}
    </>
  );
};

export default Bunker;
