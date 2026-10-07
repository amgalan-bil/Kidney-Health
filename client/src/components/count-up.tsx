'use client';

import { useEffect, useRef, useState } from 'react';

const NUMBER = /\d[\d,]*/g;

function render(template: string, progress: number) {
  return template.replace(NUMBER, (token) => {
    const target = Number(token.replace(/,/g, ''));
    const current = Math.round(target * progress);
    return token.includes(',') ? current.toLocaleString('en-US') : String(current);
  });
}

/** Counts every number in `value` up from zero once it scrolls into view ("1,200–1,500"). */
export function CountUp({ value, duration = 1600 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    setText(render(value, 0));
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          setText(render(value, 1 - Math.pow(1 - t, 4)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      <span className="sr-only">{value}</span>
      <span aria-hidden>{text}</span>
    </span>
  );
}
