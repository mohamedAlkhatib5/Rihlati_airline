import { Headset, ShieldCheck, Ticket } from 'lucide-react';

/** The three value propositions in the "Why Rihlati" section. */
export const HOME_HIGHLIGHTS = [
  {
    id: 'confident',
    Icon: ShieldCheck,
    titleKey: 'features.confident.title',
    textKey: 'features.confident.text',
  },
  {
    id: 'flexible',
    Icon: Ticket,
    titleKey: 'features.flexible.title',
    textKey: 'features.flexible.text',
  },
  {
    id: 'support',
    Icon: Headset,
    titleKey: 'features.support.title',
    textKey: 'features.support.text',
  },
];

/** Bullet list shown beside the experience photograph. */
export const EXPERIENCE_CHECKS = [
  'experience.checks.budgets',
  'experience.checks.details',
  'experience.checks.devices',
];
