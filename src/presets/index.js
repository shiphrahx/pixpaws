import { gameboy } from './gameboy';
import { nes } from './nes';
import { snes } from './snes';
import { cga } from './cga';
import { c64 } from './c64';
import { spectrum } from './spectrum';
import { pico8 } from './pico8';
import { modern } from './modern';
import { pastel } from './pastel';
import { monochrome } from './monochrome';

export const presets = { gameboy, nes, snes, cga, c64, spectrum, pico8, modern, pastel, monochrome };

// Ordered: retro hardware first (roughly chronological), then stylistic
export const presetList = [gameboy, nes, snes, cga, c64, spectrum, pico8, modern, pastel, monochrome];
