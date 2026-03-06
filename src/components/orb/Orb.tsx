import React, { forwardRef, useState, useEffect } from 'react';
import { WebGLOrb, supportsWebGL } from './WebGLOrb';
import { CSSOrb } from './CSSOrb';
import type { OrbRef, OrbProps } from './types';

export const Orb = forwardRef<OrbRef, OrbProps>(function Orb(props, ref) {
  const { renderer = 'auto', ...rest } = props;
  // Force CSS renderer for all sizes — WebGL has persistent dark-rendering issues
  // across various GPUs/drivers. CSS orb is vibrant and reliable at all sizes.
  const forceCSS = renderer !== 'webgl';
  const [useWebGL, setUseWebGL] = useState<boolean | null>(() => {
    if (forceCSS) return false;
    if (renderer === 'webgl') return true;
    return null;
  });

  useEffect(() => {
    if (renderer !== 'auto' || forceCSS) return;
    // Check WebGL support on mount
    setUseWebGL(supportsWebGL());
  }, [renderer, forceCSS]);

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
