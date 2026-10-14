import React, { useRef, useState, useEffect } from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  strength?: number; // 0 to 1
  splitInks?: boolean;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  strength = 0.25,
  splitInks = true,
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = btnRef.current;
    if (!el || disabled) return;

    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - btnCenterX) * strength;
      const deltaY = (e.clientY - btnCenterY) * strength;

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setOffset({ x: deltaX, y: deltaY });
      });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
      setIsHovered(false);
      setOffset({ x: 0, y: 0 });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [disabled, strength]);

  return (
    <div className="relative inline-block">
      {/* Silkscreen Ink-Split Chromatic Layers on Hover */}
      {splitInks && isHovered && !disabled && (
        <>
          <div
            className="absolute inset-0 bg-[#ff5c9a] opacity-60 risograph-blend pointer-events-none transition-transform duration-100 ease-out"
            style={{
              transform: `translate3d(${offset.x - 2.5}px, ${offset.y - 1.5}px, 0)`,
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[#3fd6c6] opacity-60 risograph-blend pointer-events-none transition-transform duration-100 ease-out"
            style={{
              transform: `translate3d(${offset.x + 2.5}px, ${offset.y + 1.5}px, 0)`,
            }}
            aria-hidden="true"
          />
        </>
      )}

      {/* Main Magnetic Button Element */}
      <button
        ref={btnRef}
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`relative z-10 transition-transform duration-150 ease-out ${className}`}
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        }}
      >
        {children}
      </button>
    </div>
  );
};
