import React, { forwardRef, useState, useEffect } from 'react';
import { WebGLOrb, supportsWebGL } from './WebGLOrb';
import { CSSOrb } from './CSSOrb';
import type { OrbRef, OrbProps } from './types';

export const Orb = forwardRef<OrbRef, OrbProps>(function Orb(props, ref) {
  const [useWebGL, setUseWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    // Check WebGL support on mount
    setUseWebGL(supportsWebGL());
  }, []);

  // Show nothing while checking WebGL support
  if (useWebGL === null) {
    return (
      <div
        className={props.className}
        style={{ width: props.size || 300, height: props.size || 300 }}
      />
    );
  }

  // Render appropriate orb component
  if (useWebGL) {
    return <WebGLOrb ref={ref} {...props} />;
  }

  return <CSSOrb ref={ref} {...props} />;
});
