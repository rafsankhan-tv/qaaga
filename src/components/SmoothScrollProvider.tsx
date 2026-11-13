'use client';

import React, { createContext, useContext, useEffect, useRef, ReactNode, useCallback } from 'react';
import { MotionConfig } from 'motion/react';
import Lenis from 'lenis';

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: Record<string, any>) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

/**
 * Universal helper to smoothly scroll to any element, selector, or Y position.
 * Uses Lenis on fine-pointer desktop when motion is allowed, and native smooth scroll otherwise.
 */
export const smoothScrollTo = (
  target: string | number | HTMLElement,
  options?: { offset?: number; duration?: number; immediate?: boolean }
) => {
  if (typeof window === 'undefined') return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior: ScrollBehavior = prefersReducedMotion || options?.immediate ? 'auto' : 'smooth';

  const lenis = (window as any).__lenis as Lenis | undefined;
  if (lenis && !prefersReducedMotion) {
    lenis.scrollTo(target, {
      offset: options?.offset ?? -80,
      duration: options?.duration ?? 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      immediate: options?.immediate ?? false,
    });
    return;
  }

  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior });
  } else if (typeof target === 'string') {
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior, block: 'start' });
  } else if (target instanceof HTMLElement) {
    target.scrollIntoView({ behavior, block: 'start' });
  }
};

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointerQuery = window.matchMedia('(pointer: coarse)');

    // Let native OS inertia handle touch devices and honor prefers-reduced-motion without JS scroll hijacking
    if (reducedMotionQuery.matches || coarsePointerQuery.matches) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,
      duration: 0.85,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      anchors: true,
      prevent: (node) =>
        node.hasAttribute('data-lenis-prevent') ||
        node.closest('[data-lenis-prevent]') !== null ||
        node.classList.contains('modal-scroll') ||
        node.closest('.modal-scroll') !== null ||
        node.hasAttribute('data-radix-scroll-area-viewport'),
    });

    lenisRef.current = lenis;
    (window as any).__lenis = lenis;
    document.documentElement.classList.add('lenis', 'lenis-smooth');

    return () => {
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      lenis.destroy();
      lenisRef.current = null;
      delete (window as any).__lenis;
    };
  }, []);

  const scrollTo = useCallback((target: string | number | HTMLElement, options?: Record<string, any>) => {
    smoothScrollTo(target, options);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScrollContext.Provider value={{ lenis: lenisRef.current, scrollTo }}>
        {children}
      </SmoothScrollContext.Provider>
    </MotionConfig>
  );
};
