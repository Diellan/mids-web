import { describe, it, expect } from 'vitest';
import { getAssetFallbackPath } from '../src/components/asset-image/getAssetFallbackPath';

describe('getAssetFallbackPath', () => {
  it('should convert asset path to database-specific path', () => {
    expect(getAssetFallbackPath('./assets/Enhancements/Acc.png', 'Homecoming'))
      .toBe('./Databases/Homecoming/Images/Enhancements/Acc.png');
  });

  it('should work with Sets subdirectory', () => {
    expect(getAssetFallbackPath('./assets/Sets/Damage.png', 'Homecoming'))
      .toBe('./Databases/Homecoming/Images/Sets/Damage.png');
  });

  it('should work with Archetypes subdirectory', () => {
    expect(getAssetFallbackPath('./assets/Archetypes/Blaster.png', 'Rebirth'))
      .toBe('./Databases/Rebirth/Images/Archetypes/Blaster.png');
  });

  it('should work with Powersets subdirectory', () => {
    expect(getAssetFallbackPath('./assets/Powersets/Fire.png', 'Homecoming'))
      .toBe('./Databases/Homecoming/Images/Powersets/Fire.png');
  });

  it('should work with nested paths containing slashes', () => {
    expect(getAssetFallbackPath('./assets/Enhancements/Sub/Icon.png', 'Homecoming'))
      .toBe('./Databases/Homecoming/Images/Enhancements/Sub/Icon.png');
  });

  it('should work with top-level asset files', () => {
    expect(getAssetFallbackPath('./assets/Newslot.png', 'Homecoming'))
      .toBe('./Databases/Homecoming/Images/Newslot.png');
  });

  it('should return null for non-asset paths', () => {
    expect(getAssetFallbackPath('/other/path/image.png', 'Homecoming')).toBeNull();
    expect(getAssetFallbackPath('https://example.com/img.png', 'Homecoming')).toBeNull();
    expect(getAssetFallbackPath('relative/path.png', 'Homecoming')).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(getAssetFallbackPath('', 'Homecoming')).toBeNull();
  });

  it('should use the provided database name', () => {
    const src = './assets/Enhancements/Test.png';
    expect(getAssetFallbackPath(src, 'Homecoming'))
      .toBe('./Databases/Homecoming/Images/Enhancements/Test.png');
    expect(getAssetFallbackPath(src, 'Rebirth'))
      .toBe('./Databases/Rebirth/Images/Enhancements/Test.png');
  });
});
