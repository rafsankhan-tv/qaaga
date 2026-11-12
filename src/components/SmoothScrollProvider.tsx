'use client';

import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
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
 * Universal helper to smoothly scroll to any element, selector, or Y position using Lenis if available
 */
export const smoothScrollTo = (
  target: string | number | HTMLElement,
  options?: { offset?: number; duration?: number; immediate?: boolean }
) => {
  if (typeof window === 'undefined') return;
  const lenis = (window as any).__lenis as Lenis | undefined;
  if (lenis) {
    lenis.scrollTo(target, {
      offset: options?.offset ?? -80,
      duration: options?.duration ?? 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      immediate: options?.immediate ?? false,
    });
  } else {
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    } else if (typeof target === 'string') {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize Lenis for natural, fluid momentum scrolling throughout the entire site
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Natural cubic ease-out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.6,
      anchors: true,
      prevent: (node) => {
        // Prevent hijacking inside modals, bottom sheets, dropdowns, and scrollable panels
        return (
          node.hasAttribute('data-lenis-prevent') ||
          node.closest('[data-lenis-prevent]') !== null ||
          node.classList.contains('modal-scroll') ||
          node.closest('.modal-scroll') !== null ||
          node.hasAttribute('data-radix-scroll-area-viewport')
        );
      },
    });

    lenisRef.current = lenis;
    (window as any).__lenis = lenis;

    // Apply Lenis classes to documentElement
    document.documentElement.classList.add('lenis', 'lenis-smooth');

    // Intercept native window.scrollTo({ behavior: 'smooth' }) so all existing codebase calls glide via Lenis
    const originalScrollTo = window.scrollTo.bind(window);
    const patchedScrollTo: typeof window.scrollTo = (optionsOrX: any, y?: any) => {
      if (typeof optionsOrX === 'object' && optionsOrX !== null) {
        if (optionsOrX.behavior === 'smooth') {
          const top = optionsOrX.top ?? window.scrollY;
          lenis.scrollTo(top, {
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
          return;
        }
        originalScrollTo(optionsOrX);
      } else if (typeof optionsOrX === 'number' && typeof y === 'number') {
        originalScrollTo(optionsOrX, y);
      } else {
        originalScrollTo(optionsOrX);
      }
    };
    window.scrollTo = patchedScrollTo;

    return () => {
      window.scrollTo = originalScrollTo;
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      lenis.destroy();
      lenisRef.current = null;
      delete (window as any).__lenis;
    };
  }, []);

  const scrollTo = (target: string | number | HTMLElement, options?: Record<string, any>) => {
    smoothScrollTo(target, options);
  };

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisRef.current, scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
};
