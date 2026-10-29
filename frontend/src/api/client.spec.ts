import { describe, expect, it } from 'vitest';
import { buildUrl } from './client';

describe('buildUrl', () => {
  it('concatène base et chemin', () => {
    expect(buildUrl('/health', 'https://api.example.com')).toBe('https://api.example.com/health');
  });
  it('gère les slashs en trop et le chemin sans slash', () => {
    expect(buildUrl('api/projects', 'https://api.example.com/')).toBe('https://api.example.com/api/projects');
  });
  it('retourne un chemin relatif quand la base est vide', () => {
    expect(buildUrl('/health', '')).toBe('/health');
  });
});