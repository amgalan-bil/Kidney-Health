'use client';

import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type CSSProperties, type ElementType } from 'react';

type RevealProps<T extends ElementType> = {
  as?: T;
  /** Delay in ms, for staggering siblings. */
  delay?: number;
} & Omit<ComponentPropsWithoutRef<T>, 'as'>;

/** Fades its children in the first time they scroll into view. */
export function Reveal<T extends ElementType = 'div'>({
  as,
  delay = 0,
  style,
  ...props
}: RevealProps<T>) {
  const Tag: ElementType = as ?? 'div';
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={visible ? 'visible' : 'hidden'}
      style={{ ...(style as CSSProperties), '--reveal-delay': `${delay}ms` } as CSSProperties}
      {...props}
    />
  );
}
