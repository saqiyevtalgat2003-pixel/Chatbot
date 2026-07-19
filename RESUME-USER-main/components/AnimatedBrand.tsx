'use client';

import { useEffect, useState } from 'react';

const WORDS = ['KZ Resume', 'RU Resume', 'UZ Resume'];

const TYPE_SPEED = 90;
const DELETE_SPEED = 55;
const HOLD_AFTER_TYPE = 1400;
const HOLD_AFTER_DELETE = 300;

export default function AnimatedBrand() {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'holding' | 'deleting'>(
    'typing',
  );

  useEffect(() => {
    const currentWord = WORDS[wordIndex];

    if (phase === 'typing') {
      if (text.length < currentWord.length) {
        const timeout = setTimeout(() => {
          setText(currentWord.slice(0, text.length + 1));
        }, TYPE_SPEED);
        return () => clearTimeout(timeout);
      }
      const timeout = setTimeout(() => setPhase('holding'), HOLD_AFTER_TYPE);
      return () => clearTimeout(timeout);
    }

    if (phase === 'holding') {
      const timeout = setTimeout(() => setPhase('deleting'), 0);
      return () => clearTimeout(timeout);
    }

    // phase === 'deleting'
    if (text.length > 0) {
      const timeout = setTimeout(() => {
        setText(currentWord.slice(0, text.length - 1));
      }, DELETE_SPEED);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
      setPhase('typing');
    }, HOLD_AFTER_DELETE);
    return () => clearTimeout(timeout);
  }, [text, phase, wordIndex]);

  return (
    <span className="font-display font-bold text-xl text-ink inline-flex items-center">
      {text}
      <span
        className="ml-0.5 w-[2px] h-5 bg-ink animate-[blinkCaret_0.9s_step-end_infinite]"
        aria-hidden="true"
      />
    </span>
  );
}
