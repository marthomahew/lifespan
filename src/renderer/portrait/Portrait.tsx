import { memo, useId } from 'react';
import type { Gender, Look } from '../../engine/types';
import { FRAME, moodOf, portraitShapes } from './parts';

/** A drawn, layered portrait of a character at an age. */
export const Portrait = memo(function Portrait({
  look,
  age,
  gender,
  dead = false,
  size = 48,
  label,
  testId,
  className = '',
  happiness,
  ill = false,
}: {
  look: Look;
  age: number;
  gender: Gender;
  dead?: boolean;
  size?: number;
  label?: string;
  testId?: string;
  className?: string;
  /** When given, the expression follows it. */
  happiness?: number;
  ill?: boolean;
}): React.JSX.Element {
  const mood = happiness === undefined ? undefined : moodOf(happiness);
  const shapes = portraitShapes(look, age, gender, { ...(mood ? { mood } : {}), ill });
  const clip = `pc${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg
      className={`portrait${dead ? ' dead' : ''} ${className}`}
      viewBox={FRAME.viewBox}
      width={size}
      height={size}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-testid={testId}
      data-hair={look.hair}
      data-skin={look.skin}
      data-mood={mood ?? 'fine'}
      data-stage={age}
    >
      <defs>
        <clipPath id={clip}>
          <circle cx={FRAME.cx} cy={FRAME.cy} r={FRAME.r} />
        </clipPath>
      </defs>
      <circle className="portrait-bg" cx={FRAME.cx} cy={FRAME.cy} r={FRAME.r} />
      <g clipPath={`url(#${clip})`}>
        {shapes.map((s, i) => (
          <path
            key={i}
            d={s.d}
            data-layer={s.layer}
            fill={s.fill ?? 'none'}
            fillOpacity={s.fillOpacity}
            stroke={s.stroke}
            strokeWidth={s.sw}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={s.opacity}
          />
        ))}
      </g>
    </svg>
  );
});
