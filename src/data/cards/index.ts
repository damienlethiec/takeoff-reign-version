import type { CardDef, MilestoneId } from '../../engine/types';
import { FOLLOW_UPS, MILESTONE_NEWS, NEWS } from './news';
import { REQUESTS } from './requests';
import { AI_CARDS, FINALE, LEA, REVIEWS, TUTORIAL } from './story';

export { FINALE_IDS, REVIEW_IDS, TUTORIAL_IDS } from './story';

export const CARDS: CardDef[] = [...TUTORIAL, ...REQUESTS, ...MILESTONE_NEWS, ...NEWS, ...FOLLOW_UPS, ...AI_CARDS, ...LEA, ...REVIEWS, ...FINALE];
export const CARD_BY_ID: Record<string, CardDef> = Object.fromEntries(CARDS.map((c) => [c.id, c]));
export const MILESTONE_CARD = Object.fromEntries(MILESTONE_NEWS.map((c) => [c.milestone, c.id])) as Record<MilestoneId, string>;
