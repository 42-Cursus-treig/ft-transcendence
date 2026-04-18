import type { Theme } from './settings';

export type ThemeColors = {
  bg: string;
  fg: string;
  accent: string;
  glow: string;
  overlayText: string;
};

export const THEMES: Record<Theme, ThemeColors> = {
  CLASSIC: {
    bg: '#0a0a0f',
    fg: '#39ff14',
    accent: '#39ff14',
    glow: 'rgba(57, 255, 20, 0.6)',
    overlayText: '#39ff14',
  },
  SYNTHWAVE: {
    bg: '#1a0033',
    fg: '#ff2e97',
    accent: '#00f0ff',
    glow: 'rgba(255, 46, 151, 0.6)',
    overlayText: '#ffffff',
  },
  MONO: {
    bg: '#000000',
    fg: '#ffffff',
    accent: '#cccccc',
    glow: 'rgba(255, 255, 255, 0.4)',
    overlayText: '#ffffff',
  },
};