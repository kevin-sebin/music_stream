import React, { useState, useEffect } from 'react';
import { resolvePlaylistImg } from '../services/api';

/**
 * VinylDisc Component
 * Renders the authentic vinyl groove art or displays the thumbnail/image if provided.
 * @param {string} size - 'sm' (list items), 'md' (card), 'lg' (detail hero), 'hero' (now playing)
 * @param {string} bgColor - background color for container
 * @param {string} thumbnail - image URL (e.g. YouTube thumbnail or S3 object key)
 * @param {string} img - alias for thumbnail
 * @param {boolean} isSpinning - whether to spin if currently playing
 * @param {string} alt - image alt text
 */
export default function VinylDisc({ 
  size = 'md', 
  bgColor = '#356e3f', 
  thumbnail = null,
  img = null,
  isSpinning = false, 
  className = '',
  alt = ''
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [thumbnail, img]);

  const rawSource = thumbnail || img;
  const imageSource = !hasError && rawSource ? resolvePlaylistImg(rawSource) : null;

  // Dimension configurations
  const config = {
    sm: {
      container: 'w-11 h-11 rounded-lg',
      disc: 'w-9 h-9',
      ring1: 'w-7 h-7',
      ring2: 'w-5 h-5',
      center: 'w-2 h-2',
    },
    md: {
      container: 'w-full aspect-[4/3] rounded-2xl',
      disc: 'w-24 h-24 sm:w-28 sm:h-28',
      ring1: 'w-20 h-20 sm:w-22 sm:h-22',
      ring2: 'w-14 h-14 sm:w-16 sm:h-16',
      center: 'w-4 h-4 sm:w-5 sm:h-5',
    },
    lg: {
      container: 'w-24 h-24 rounded-2xl flex-shrink-0',
      disc: 'w-20 h-20',
      ring1: 'w-16 h-16',
      ring2: 'w-11 h-11',
      center: 'w-3.5 h-3.5',
    },
    hero: {
      container: 'w-full aspect-square max-w-[340px] rounded-3xl mx-auto',
      disc: 'w-64 h-64 sm:w-72 sm:h-72',
      ring1: 'w-52 h-52 sm:w-56 sm:h-56',
      ring2: 'w-36 h-36 sm:w-40 sm:h-40',
      center: 'w-10 h-10 sm:w-12 sm:h-12',
    }
  }[size] || config.md;

  return (
    <div 
      className={`relative flex items-center justify-center overflow-hidden shadow-inner bg-neutral-900 ${config.container} ${className}`}
      style={{ backgroundColor: imageSource ? '#1c1d22' : bgColor }}
    >
      {imageSource ? (
        <img
          src={imageSource}
          alt={alt || "Track artwork"}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover select-none"
          loading="lazy"
        />
      ) : (
        /* Stylized Vinyl record disc fallback */
        <div 
          className={`relative rounded-full flex items-center justify-center shadow-lg transition-transform duration-700 ease-linear ${config.disc} ${isSpinning ? 'animate-spin-slow' : ''}`}
          style={{
            background: 'radial-gradient(circle, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.3) 100%)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}
        >
          {/* Outer groove ring */}
          <div 
            className={`absolute rounded-full border border-white/20 pointer-events-none ${config.ring1}`}
            style={{ opacity: 0.8 }}
          />

          {/* Inner groove ring */}
          <div 
            className={`absolute rounded-full border border-white/15 pointer-events-none ${config.ring2}`}
            style={{ opacity: 0.6 }}
          />

          {/* Center label & spindle core */}
          <div 
            className={`rounded-full bg-[#82858b] shadow-inner flex items-center justify-center ${config.center}`}
            style={{
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
            }}
          >
            {/* Subtle micro hole in the middle */}
            <div className="w-[30%] h-[30%] rounded-full bg-[#333]" />
          </div>
        </div>
      )}
    </div>
  );
}
