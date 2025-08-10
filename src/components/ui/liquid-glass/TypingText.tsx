import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { TypingTextProps } from '../../../types/portfolio';

const TypingText: React.FC<TypingTextProps> = ({
  texts,
  speed = 100,
  deleteSpeed = 50,
  delayBetweenTexts = 2000,
  className,
  cursor = true,
  loop = true
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (texts.length === 0) return;

    const fullText = texts[currentTextIndex];
    
    const timer = setTimeout(() => {
      if (isPaused) {
        setIsPaused(false);
        setIsDeleting(true);
        return;
      }

      if (isDeleting) {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          if (loop || currentTextIndex < texts.length - 1) {
            setCurrentTextIndex((prev) => (prev + 1) % texts.length);
          }
        }
      } else {
        if (currentText.length < fullText.length) {
          setCurrentText(fullText.slice(0, currentText.length + 1));
        } else {
          if (loop || currentTextIndex < texts.length - 1) {
            setIsPaused(true);
          }
        }
      }
    }, isPaused ? delayBetweenTexts : isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timer);
  }, [currentText, currentTextIndex, isDeleting, isPaused, texts, speed, deleteSpeed, delayBetweenTexts, loop]);

  return (
    <span className={cn('inline-block', className)}>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {currentText}
      </motion.span>
      {cursor && (
        <motion.span
          className="inline-block w-0.5 h-[1em] bg-current ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </span>
  );
};

export default TypingText;