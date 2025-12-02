"use client";

import { useAnimateOnScroll } from '@/hooks/useAnimateOnScroll';
import { ReactNode, CSSProperties, useState, useEffect, ElementType } from 'react';

type AnimationType = 
  | 'fadeIn' 
  | 'fadeInUp' 
  | 'fadeInDown' 
  | 'fadeInLeft' 
  | 'fadeInRight' 
  | 'scaleIn'
  | 'slideUp';

interface AnimatedSectionProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
}

export default function AnimatedSection({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 800,
  threshold = 0.1,
  className = '',
  style = {},
  as: Component = 'div',
}: AnimatedSectionProps) {
  const { ref, isVisible } = useAnimateOnScroll<HTMLDivElement>({ threshold });

  const animationStyles: CSSProperties = {
    opacity: 0,
    transform: getInitialTransform(animation),
    transition: `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms,
                 transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
    ...(isVisible && {
      opacity: 1,
      transform: 'translateY(0) translateX(0) scale(1)',
    }),
    ...style,
  };

  return (
    <Component
      ref={ref}
      className={className}
      style={animationStyles}
    >
      {children}
    </Component>
  );
}

function getInitialTransform(animation: AnimationType): string {
  switch (animation) {
    case 'fadeInUp':
      return 'translateY(40px)';
    case 'fadeInDown':
      return 'translateY(-40px)';
    case 'fadeInLeft':
      return 'translateX(-40px)';
    case 'fadeInRight':
      return 'translateX(40px)';
    case 'scaleIn':
      return 'scale(0.9)';
    case 'slideUp':
      return 'translateY(30px)';
    case 'fadeIn':
    default:
      return 'translateY(0)';
  }
}

// Componente para animar texto letra por letra
interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function AnimatedText({ text, className = '', delay = 0 }: AnimatedTextProps) {
  const { ref, isVisible } = useAnimateOnScroll<HTMLSpanElement>({ threshold: 0.5 });

  return (
    <span ref={ref} className={className} style={{ display: 'inline-block' }}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          style={{
            display: 'inline-block',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity 0.4s ease ${delay + index * 30}ms,
                        transform 0.4s ease ${delay + index * 30}ms`,
            whiteSpace: char === ' ' ? 'pre' : 'normal',
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

// Componente para números animados (contador)
interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({ 
  target, 
  duration = 2000, 
  suffix = '', 
  prefix = '',
  className = '' 
}: AnimatedCounterProps) {
  const { ref, isVisible } = useAnimateOnScroll<HTMLSpanElement>({ threshold: 0.5 });
  
  return (
    <span ref={ref} className={className}>
      {isVisible ? (
        <CountUp target={target} duration={duration} prefix={prefix} suffix={suffix} />
      ) : (
        `${prefix}0${suffix}`
      )}
    </span>
  );
}

function CountUp({ target, duration, prefix, suffix }: { 
  target: number; 
  duration: number; 
  prefix: string; 
  suffix: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return <>{prefix}{count.toLocaleString()}{suffix}</>;
}

