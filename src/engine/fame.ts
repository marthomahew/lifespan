import { JOB_BY_ID } from '../content/jobs';
import { SPORT_BY_ID } from '../content/sports';
import { FIELD_LABEL } from '../content/science';
import { TITLE_NAMES } from './systems/chess';
import type { GameState } from './types';

/**
 * What you're famous for, read from your life: titles, records, books, roles and honours.
 * Most notable first.
 */
export function knownFor(s: GameState): string[] {
  const out: string[] = [];
  const f = s.player.flags;
  const job = s.career.jobId ? JOB_BY_ID[s.career.jobId] : undefined;
  const title = s.career.history.at(-1)?.title?.toLowerCase();
  if (f.includes('nobel_laureate')) out.push('your Nobel prize');
  if (f.includes('walked_on_moon')) out.push('walking on the Moon');
  else if (f.includes('been_to_space')) out.push('going to space');
  if (f.includes('olympic_gold')) out.push('Olympic gold');
  else if (f.includes('olympic_medal')) out.push('an Olympic medal');
  if (job?.special && title) out.push(`being a ${title}`);
  if (job?.id === 'professional_athlete' && title)
    out.push(
      `playing professional ${s.sport ? (SPORT_BY_ID[s.sport.sport]?.label.toLowerCase() ?? 'sport') : 'sport'}`,
    );
  if (s.sport && s.sport.best >= 4)
    out.push(`${SPORT_BY_ID[s.sport.sport]?.label.toLowerCase() ?? 'sport'} for your country`);
  if (s.chess?.crowns?.length) out.push('being world chess champion');
  else if (s.chess?.title) out.push(`chess (${TITLE_NAMES[s.chess.title]})`);
  if (s.music.releases.length && (s.music.stage >= 3 || s.player.stats.fame >= 30))
    out.push(s.music.act === 'band' ? 'your band' : 'your music');
  if ((s.projects?.books ?? 0) > 0)
    out.push((s.projects?.books ?? 0) > 1 ? 'your novels' : 'your novel');
  if (f.includes('young_composer')) out.push('composing');
  if ((s.science?.rep ?? 0) >= 60)
    out.push(`your research in ${FIELD_LABEL[s.science?.field ?? 'life']}`);
  if (f.includes('michelin_star')) out.push('your restaurant');
  if (s.business && s.business.level >= 3) out.push(s.business.name);
  if (f.includes('philanthropist')) out.push('your foundation');
  if (s.player.background === 'famous_parent' && out.length === 0) out.push('your famous parent');
  return [...new Set(out)];
}

/** "Known for chess (Grandmaster) and your novels." */
export function knownForLine(s: GameState): string {
  const k = knownFor(s);
  if (!k.length)
    return s.player.stats.fame > 0 ? 'Known locally, for no one thing in particular.' : '';
  const list = k.length === 1 ? k[0] : `${k.slice(0, -1).join(', ')} and ${k.at(-1)}`;
  return `Known for ${list}.`;
}
