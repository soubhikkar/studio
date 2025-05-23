import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="150"
      height="37.5"
      aria-label="QuizWhiz Logo"
      {...props}
    >
      <defs>
        <linearGradient id="quizwhiz-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="30"
        fontFamily="var(--font-geist-sans), sans-serif"
        fontWeight="bold"
        fill="url(#quizwhiz-grad)"
      >
        QuizWhiz
      </text>
    </svg>
  );
}
