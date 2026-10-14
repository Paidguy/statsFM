import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    // Only enable on pointer: fine (mouse) and not reduced motion
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || prefersReducedMotion) return;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
        if (!isVisible) setIsVisible(true);

        const target = e.target as HTMLElement | null;
        if (target) {
          const interactive = target.closest(
            'button, a, input, select, textarea, [role="button"], [role="tab"], [tabindex="0"]'
          );
          setIsPointer(!!interactive);
        }
      });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      {/* Central needle dot */}
      <div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[#f1ebdc] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${isClicking ? 0.7 : 1})`,
        }}
      />

      {/* Screen-blended dual ink stylus ring */}
      <div
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ease-out"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${
            isPointer ? 1.6 : isClicking ? 0.85 : 1
          })`,
          width: '28px',
          height: '28px',
        }}
      >
        <div
          className={`absolute inset-0 rounded-full border border-[#ff5c9a] opacity-80 risograph-blend transition-all duration-150 ${
            isPointer ? 'border-[#3fd6c6] bg-[#ff5c9a]/10' : ''
          }`}
        />
        <div
          className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-[#3fd6c6] opacity-70 risograph-blend"
        />
      </div>
    </div>
  );
};
