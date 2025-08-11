import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagneticCursorProps {
  children?: React.ReactNode;
  className?: string;
}

const MagneticCursor: React.FC<MagneticCursorProps> = ({ children, className }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - 12);
      cursorY.set(e.clientY - 12);
    };

    const handleMouseEnter = () => {
      cursor.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      cursor.style.opacity = '0';
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || !cursor) return;

      // Handle magnetic elements
      if (target.classList && target.classList.contains('magnetic')) {
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        target.style.setProperty('--magnetic-x', `${x * 0.3}px`);
        target.style.setProperty('--magnetic-y', `${y * 0.3}px`);
        
        cursor.style.transform = 'scale(1.5)';
        cursor.style.mixBlendMode = 'difference';
        return;
      }

      // Handle clickable elements (only if not magnetic)
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || (target.classList && target.classList.contains('cursor-pointer'))) {
        cursor.style.transform = 'scale(1.2)';
        cursor.style.backgroundColor = 'rgba(99, 102, 241, 0.8)';
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || !cursor) return;

      // Handle magnetic elements
      if (target.classList && target.classList.contains('magnetic')) {
        target.style.setProperty('--magnetic-x', '0px');
        target.style.setProperty('--magnetic-y', '0px');
        
        cursor.style.transform = 'scale(1)';
        cursor.style.mixBlendMode = 'normal';
        return;
      }

      // Handle clickable elements (only if not magnetic)
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || (target.classList && target.classList.contains('cursor-pointer'))) {
        cursor.style.transform = 'scale(1)';
        cursor.style.backgroundColor = 'rgba(99, 102, 241, 0.5)';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      <motion.div
        ref={cursorRef}
        className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[9999] transition-all duration-300 ease-out hidden md:block"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          opacity: 0,
        }}
      />
      {children}
    </>
  );
};

export default MagneticCursor;