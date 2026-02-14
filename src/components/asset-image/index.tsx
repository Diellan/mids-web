import { forwardRef, useState, ImgHTMLAttributes } from 'react';
import { DatabaseAPI } from '@/core/DatabaseAPI';
import { getAssetFallbackPath } from './getAssetFallbackPath';

export { getAssetFallbackPath } from './getAssetFallbackPath';

/**
 * Drop-in replacement for <img> that falls back to database-specific images.
 * When an image at ./assets/X fails to load, retries from
 * ./Databases/{DatabaseName}/Images/X.
 */
const AssetImage = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(
  ({ src, onError, ...props }, ref) => {
    const [fallbackForSrc, setFallbackForSrc] = useState<string | null>(null);

    const useFallback = fallbackForSrc === src;
    const effectiveSrc = useFallback && src
      ? (getAssetFallbackPath(src, DatabaseAPI.DatabaseName) ?? src)
      : src;

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (fallbackForSrc !== src && src?.startsWith('./assets/')) {
        setFallbackForSrc(src);
        return;
      }
      onError?.(e);
    };

    return <img ref={ref} src={effectiveSrc} onError={handleError} {...props} />;
  }
);

AssetImage.displayName = 'AssetImage';

export default AssetImage;
