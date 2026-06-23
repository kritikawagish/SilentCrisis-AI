import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { motion, useTransform, useScroll, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TracingBeamProps {
  children: ReactNode;
  className?: string;
}

export const TracingBeam = ({ children, className }: TracingBeamProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const contentRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) setSvgHeight(contentRef.current.offsetHeight);
  }, []);

  const y1 = useSpring(useTransform(scrollYProgress, [0, 0.8], [50, svgHeight]), { stiffness: 500, damping: 90 });
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [50, svgHeight - 200]), { stiffness: 500, damping: 90 });

  return (
    <motion.div ref={ref} className={cn('relative mx-auto w-full', className)}>
      <div className="absolute top-3 -left-4 md:-left-10">
        <motion.div className="ml-[27px] flex h-4 w-4 items-center justify-center rounded-full border border-amber-dawn/30 shadow-sm">
          <motion.div
            animate={{ backgroundColor: '#ff9b6a', borderColor: '#ffd4b0' }}
            className="h-2 w-2 rounded-full bg-amber-dawn"
          />
        </motion.div>
        <svg viewBox={`0 0 20 ${svgHeight}`} width="20" height={svgHeight} className="ml-4 block" aria-hidden="true">
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="#a89cc4"
            strokeOpacity="0.16"
          />
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="url(#scbeam)"
            strokeWidth="1.5"
          />
          <defs>
            <motion.linearGradient id="scbeam" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={y1} y2={y2}>
              <stop stopColor="#ff9b6a" stopOpacity="0" />
              <stop stopColor="#ff9b6a" />
              <stop offset="0.325" stopColor="#a380ff" />
              <stop offset="1" stopColor="#7fd9b8" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div ref={contentRef}>{children}</div>
    </motion.div>
  );
};

export default TracingBeam;
