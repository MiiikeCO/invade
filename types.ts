export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// Fix: Added missing Player interface. It represents the player's position and resolves an import error.
export interface Player extends Position {}

export enum AlienType {
  TOP = 'TOP',
  MIDDLE = 'MIDDLE',
  BOTTOM = 'BOTTOM',
}

export interface Alien extends Position, Size {
  id: number;
  type: AlienType;
  score: number;
}

export interface Laser extends Position, Size {
  id: number;
}

export interface BunkerPart extends Position {
  id: number;
  health: number;
}

export interface Bunker {
  id: number;
  parts: BunkerPart[][];
}

export interface Ufo extends Position, Size {
  id: number;
  score: number;
}

export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}
