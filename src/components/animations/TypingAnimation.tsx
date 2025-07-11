import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypingAnimationProps {
  text: string | string[];
  typingSpeed?: number;
  delayBetweenLines?: number;
  cursorColor?: string;
  className?: string;
  textClassName?: string;
  cursorClassName?: string;
  onComplete?: () => void;
  startDelay?: number;
  eraseSpeed?: number;
  eraseDelay?: number;
  loop?: boolean;
  loopDelay?: number;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  typingSpeed = 50,
  delayBetweenLines = 1000,
  cursorColor = '#ffffff',
  className = '',
  textClassName = '',
  cursorClassName = '',
  onComplete,
  startDelay = 500,
  eraseSpeed = 30,
  eraseDelay = 2000,
  loop = false,
  loopDelay = 1500,
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const textArray = Array.isArray(text) ? text : [text];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear any existing timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  // Handle the typing animation
  useEffect(() => {
    // Initial delay before starting
    if (!isTyping && !isErasing && currentText === '' && !isComplete) {
      timerRef.current = setTimeout(() => {
        setIsTyping(true);
      }, startDelay);
      return;
    }
    
    // Typing in progress
    if (isTyping) {
      const targetText = textArray[currentTextIndex];
      
      if (currentText.length < targetText.length) {
        timerRef.current = setTimeout(() => {
          setCurrentText(targetText.substring(0, currentText.length + 1));
        }, typingSpeed);
      } else {
        setIsTyping(false);
        
        // If we're looping or have more lines, we'll need to erase
        if (loop || currentTextIndex < textArray.length - 1) {
          timerRef.current = setTimeout(() => {
            setIsErasing(true);
          }, eraseDelay);
        } else {
          setIsComplete(true);
          if (onComplete) {
            onComplete();
          }
        }
      }
      return;
    }
    
    // Erasing in progress
    if (isErasing) {
      if (currentText.length > 0) {
        timerRef.current = setTimeout(() => {
          setCurrentText(currentText.substring(0, currentText.length - 1));
        }, eraseSpeed);
      } else {
        setIsErasing(false);
        
        // Move to next text or loop back to the first
        timerRef.current = setTimeout(() => {
          const nextIndex = (currentTextIndex + 1) % textArray.length;
          setCurrentTextIndex(nextIndex);
          setIsTyping(true);
          
          // If we've completed one full loop and we're not supposed to continue looping
          if (nextIndex === 0 && !loop) {
            setIsComplete(true);
            if (onComplete) {
              onComplete();
            }
          }
        }, delayBetweenLines);
      }
      return;
    }
  }, [
    currentText,
    isTyping,
    isErasing,
    currentTextIndex,
    textArray,
    typingSpeed,
    delayBetweenLines,
    eraseSpeed,
    eraseDelay,
    loop,
    isComplete,
    onComplete,
    startDelay,
  ]);
  
  // Blinking cursor animation
  const cursorVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };
  
  // Content reveal animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3,
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
      }
    }
  };
  
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentText}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          className={textClassName}
        >
          {currentText}
        </motion.div>
      </AnimatePresence>
      
      {!isComplete && (
        <motion.span
          initial="hidden"
          animate="visible"
          variants={cursorVariants}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className={`inline-block ml-1 ${cursorClassName}`}
          style={{ 
            width: '2px', 
            height: '1em', 
            backgroundColor: cursorColor,
            display: 'inline-block',
          }}
        />
      )}
    </div>
  );
};

export const MultiLineTypingAnimation: React.FC<{
  lines: string[];
  className?: string;
  lineClassName?: string;
  typingSpeed?: number;
  delayBetweenLines?: number;
  startDelay?: number;
}> = ({
  lines,
  className = '',
  lineClassName = '',
  typingSpeed = 40,
  delayBetweenLines = 300,
  startDelay = 500,
}) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  
  const handleLineComplete = () => {
    if (currentLineIndex < lines.length - 1) {
      setCompletedLines([...completedLines, lines[currentLineIndex]]);
      setCurrentLineIndex(currentLineIndex + 1);
    } else {
      setIsComplete(true);
      setCompletedLines([...completedLines, lines[currentLineIndex]]);
    }
  };
  
  return (
    <div className={className}>
      {completedLines.map((line, index) => (
        <div key={`completed-${index}`} className={lineClassName}>
          {line}
        </div>
      ))}
      
      {!isComplete && (
        <TypingAnimation
          text={lines[currentLineIndex]}
          typingSpeed={typingSpeed}
          startDelay={currentLineIndex === 0 ? startDelay : delayBetweenLines}
          onComplete={handleLineComplete}
          className={lineClassName}
          loop={false}
        />
      )}
    </div>
  );
};
