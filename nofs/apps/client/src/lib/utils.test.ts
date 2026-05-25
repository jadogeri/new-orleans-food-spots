import { cn } from './utils';

describe('cn (className utility)', () => {
  it('returns a single class unchanged', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('merges multiple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values', () => {
    expect(cn('foo', false && 'bar', undefined, null)).toBe('foo');
  });

  it('applies conditional classes when truthy', () => {
    const isActive = true;
    expect(cn('base', isActive && 'active')).toBe('base active');
  });

  it('skips conditional classes when falsy', () => {
    const isActive = false;
    expect(cn('base', isActive && 'active')).toBe('base');
  });

  it('resolves tailwind conflicts — last class wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('m-1', 'm-2', 'm-3')).toBe('m-3');
  });

  it('handles an object notation from clsx', () => {
    expect(cn({ foo: true, bar: false })).toBe('foo');
    expect(cn({ foo: true, bar: true })).toBe('foo bar');
  });

  it('handles array notation from clsx', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
    expect(cn(['foo', false && 'bar'])).toBe('foo');
  });

  it('returns an empty string when all inputs are falsy', () => {
    expect(cn(false, undefined, null)).toBe('');
    expect(cn()).toBe('');
  });
});
