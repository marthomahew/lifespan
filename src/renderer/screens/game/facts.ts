import type { GameState } from '../../../engine';
import { occupationLabel } from '../../../engine/occupation';

export function quickFacts(s: GameState): { occupation: string; relationship: string } {
  const partner = s.npcs.find(
    (n) => n.alive && (n.roles.includes('spouse') || n.roles.includes('partner')),
  );
  let relationship = 'Single';
  if (partner) {
    const stage = partner.romance?.stage ?? 'dating';
    relationship =
      stage === 'married'
        ? `Married to ${partner.first}`
        : stage === 'engaged'
          ? `Engaged to ${partner.first}`
          : `Seeing ${partner.first}`;
  } else if (s.player.age < 18) relationship = '—';
  return { occupation: occupationLabel(s), relationship };
}
