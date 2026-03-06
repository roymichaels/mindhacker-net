import React, { forwardRef, useState, useEffect } from 'react';
import { WebGLOrb, supportsWebGL } from './WebGLOrb';
import { CSSOrb } from './CSSOrb';
import type { OrbRef, OrbProps } from './types';

export const Orb = forwardRef<OrbRef, OrbProps>(function Orb(props, ref) {
  const { renderer = 'auto', ...rest } = props;
  // Force CSS for small orbs (≤100px) — WebGL renders dark/colorless at tiny sizes
  const forceCSS = renderer === 'auto' && (rest.size || 300) <= 100;
  const [useWebGL, setUseWebGL] = useState<boolean | null>(() => {
    if (renderer === 'css' || forceCSS) return false;
    if (renderer === 'webgl') return true;
    return null;
  });

  useEffect(() => {
    if (renderer !== 'auto') return;
    // Check WebGL support on mount
    setUseWebGL(supportsWebGL());
  }, [renderer]);

  // Show placeholder only while checking WebGL support (auto mode)
  if (useWebGL === null) {
    return (
      <div
        className={rest.className}
        style={{ width: rest.size || 300, height: rest.size || 300 }}
      />
    );
  }

  if (useWebGL) {
    return <WebGLOrb ref={ref} {...rest} />;
  }

  return <CSSOrb ref={ref} {...rest} />;
});
