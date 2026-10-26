// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { newGame } from '../src/engine';
import { changesText, marksText } from '../src/ui/app';
import { esc, extLink, safeUrl } from '../src/ui/html';
import { loadMeta, saveMeta } from '../src/ui/storage';

describe('html helpers', () => {
  it('escapes everything that reaches innerHTML', () => {
    expect(esc('<img src=x onerror="a()">&\'')).toBe('&lt;img src=x onerror=&quot;a()&quot;&gt;&amp;&#39;');
  });
  it('links only http(s) URLs, in a new tab with rel=noopener', () => {
    expect(safeUrl('javascript:alert(1)')).toBeNull();
    expect(safeUrl('data:text/html,x')).toBeNull();
    expect(extLink('x', 'javascript:alert(1)')).toBe('x');
    const a = extLink('Source', 'https://example.org/a?b=1&c=2');
    expect(a).toContain('target="_blank"');
    expect(a).toContain('rel="noopener noreferrer"');
    expect(a).toContain('&amp;c=2');
  });
});

describe('words for changes', () => {
  it('previews say which gauges move and how much, in words', () => {
    expect(marksText([{ gauge: 'labs', size: 'large' }, { gauge: 'allies', size: 'small' }])).toBe('Will change: Labs a lot, Allies a little.');
    expect(marksText([])).toBe('Changes nothing you can see.');
  });
  it('announcements give direction in words and with + / −, visible gauges only', () => {
    const a = newGame({ seed: 1 });
    const b = { ...a, gauges: { ...a.gauges, labs: 62, oversight: 45 }, hidden: { ...a.hidden, safety: 10 } };
    expect(changesText(a, b)).toBe('Labs up a lot, +12. Oversight down a little, −5.');
    expect(changesText(a, a)).toBe('Nothing you can see moved.');
  });
});

describe('storage', () => {
  it('survives a blocked localStorage', () => {
    const real = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', { configurable: true, get: () => { throw new Error('blocked'); } });
    expect(loadMeta().runs).toBe(0);
    expect(() => saveMeta({ runs: 1, finished: 0, endings: [], goals: [], tutorialDone: false })).not.toThrow();
    if (real) Object.defineProperty(window, 'localStorage', real);
  });
  it('ignores corrupt data', () => {
    window.localStorage.setItem('takeoff-reign-version:v1', '{"runs":"x","endings":[1,"exodus"]}');
    const m = loadMeta();
    expect(m.runs).toBe(0);
    expect(m.endings).toEqual(['exodus']);
  });
});
