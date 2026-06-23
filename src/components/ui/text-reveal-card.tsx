import React, { useEffect, useRef, useState, memo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextRevealCardProps {
  text: string;
  revealText: string;
  children?: ReactNode;
  className?: string;
}

export const TextRevealCard = ({ text, revealText, children, className }: TextRevealCardProps) => {
  const [widthPercentage, setWidthPercentage] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState(0);
  const [localWidth, setLocalWidth] = useState(0);
  const [isMouseOver, setIsMouseOver] = useState(false);

  useEffect(() => {
    if (cardRef.current) {
      const { left, width } = cardRef.current.getBoundingClientRect();
      setLeft(left);
      setLocalWidth(width);
    }
  }, []);

  const mouseMoveHandler = (event: React.MouseEvent) => {
    event.preventDefault();
    const { clientX } = event;
    if (cardRef.current) {
      const relativeX = clientX - left;
      setWidthPercentage((relativeX / localWidth) * 100);
    }
  };

  const mouseLeaveHandler = () => { setIsMouseOver(false); setWidthPercentage(0); };
  const mouseEnterHandler = () => setIsMouseOver(true);
  const touchMoveHandler = (event: React.TouchEvent) => {
    event.preventDefault();
    const clientX = event.touches[0].clientX;
    if (cardRef.current) {
      const relativeX = clientX - left;
      setWidthPercentage((relativeX / localWidth) * 100);
    }
  };

  const rotateDeg = (widthPercentage - 50) * 0.1;
  return (
    <div
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
      onMouseMove={mouseMoveHandler}
      onTouchStart={mouseEnterHandler}
      onTouchEnd={mouseLeaveHandler}
      onTouchMove={touchMoveHandler}
      ref={cardRef}
      className={cn('bg-cosmos-deep border border-amber-dawn/10 w-full rounded-lg p-8 relative overflow-hidden', className)}
    >
      {children}
      <div className="h-40 relative flex items-center overflow-hidden">
        <motion.div
          style={{ width: '100%' }}
          animate={
            isMouseOver
              ? { opacity: widthPercentage > 0 ? 1 : 0, clipPath: `inset(0 ${100 - widthPercentage}% 0 0)` }
              : { clipPath: `inset(0 ${100 - widthPercentage}% 0 0)` }
          }
          transition={isMouseOver ? { duration: 0 } : { duration: 0.4 }}
          className="absolute bg-cosmos-deep z-20 will-change-transform"
        >
          <p
            style={{ textShadow: '4px 4px 15px rgba(0,0,0,0.5)' }}
            className="font-display text-2xl sm:text-5xl py-10 font-extralight gradient-text-amber"
          >
            {revealText}
          </p>
        </motion.div>
        <motion.div
          animate={{ left: `${widthPercentage}%`, rotate: `${rotateDeg}deg`, opacity: widthPercentage > 0 ? 1 : 0 }}
          transition={isMouseOver ? { duration: 0 } : { duration: 0.4 }}
          className="h-40 w-[2px] bg-gradient-to-b from-transparent via-amber-dawn to-transparent absolute z-50 will-change-transform"
        />
        <div className="overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,white,transparent)]">
          <p className="font-display text-2xl sm:text-5xl py-10 font-extralight text-star-faint/40">
            {text}
          </p>
          <MemoizedStars />
        </div>
      </div>
    </div>
  );
};

const Stars = () => {
  const randomMove = () => Math.random() * 4 - 2;
  const randomOpacity = () => Math.random();
  const random = () => Math.random();
  return (
    <div className="absolute inset-0">
      {Array.from({ length: 60 }).map((_, i) => (
        <motion.span
          key={`star-${i}`}
          animate={{
            top: `calc(${random() * 100}% + ${randomMove()}px)`,
            left: `calc(${random() * 100}% + ${randomMove()}px)`,
            opacity: randomOpacity(),
            scale: [1, 1.2, 0],
          }}
          transition={{ duration: random() * 10 + 20, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: `${random() * 100}%`,
            left: `${random() * 100}%`,
            width: '2px',
            height: '2px',
            backgroundColor: '#ffd4b0',
            borderRadius: '50%',
            zIndex: 1,
          }}
        />
      ))}
    </div>
  );
};

const MemoizedStars = memo(Stars);

export default TextRevealCard;

