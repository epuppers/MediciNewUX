import { useMemo } from 'react';

/** Rotating phrase pool — displayed beneath the salutation */
const PHRASES = [
  // Helpful
  'How can I help you today?',
  'What are we working on?',
  'Ready when you are.',
  'What would you like to tackle?',
  'Standing by for your instructions.',
  'At your service.',
  'What can I pull up for you?',
  'Where shall we begin?',
  'What do you need from me?',
  'Tell me what you need.',

  // Finance-flavored
  "Let's make the numbers work.",
  'Your portfolio awaits.',
  'Time to crunch some numbers.',
  "Let's review the books.",
  'Another day, another basis point.',
  'Spreads are tight. So is my focus.',
  "Capital calls itself — just kidding, that's your job.",
  "NAVs don't calculate themselves.",
  "Let's move some decimal points.",
  'Covenants checked. Coffee poured. Ready.',

  // Retrofuture / warm
  'All systems nominal.',
  'Diagnostics green across the board.',
  'Memory banks online. How may I assist?',
  'Circuits warmed up and ready.',
  'Signal received. Awaiting your command.',
  'Operating within normal parameters.',
  'Primary functions engaged.',
  'Telemetry looks good from here.',

  // Light humor
  "Markets don't sleep, but I don't need to.",
  "I've been thinking about spreadsheets again.",
  'I ran the numbers while you were away.',
  "No, I haven't become self-aware. Probably.",
  'I promise not to open the pod bay doors without asking.',
  "IRR of this conversation: TBD.",
  'My favorite color is Excel green.',
];

const FALLBACK_PHRASE = 'How can I help you today?';
const FALLBACK_SALUTATION = 'Hello';

/** Late-night salutation variants */
const LATE_NIGHT_SALUTATIONS = [
  'Burning the midnight oil',
  'Working late',
];

/**
 * Returns a time-aware salutation and a rotating phrase for the chat empty state.
 *
 * @param firstName — The user's first name. Omit or pass undefined to skip personalization.
 * @returns `{ salutation, phrase }` — stable for the lifetime of the component mount.
 */
export function useGreeting(firstName?: string) {
  return useMemo(() => {
    let timeGreeting: string;

    try {
      const hour = new Date().getHours();

      if (hour >= 5 && hour < 12) {
        timeGreeting = 'Good morning';
      } else if (hour >= 12 && hour < 17) {
        timeGreeting = 'Good afternoon';
      } else if (hour >= 17 && hour < 21) {
        timeGreeting = 'Good evening';
      } else {
        // 21–4: late-night variant
        const lateIdx = Math.floor(Math.random() * LATE_NIGHT_SALUTATIONS.length);
        timeGreeting = LATE_NIGHT_SALUTATIONS[lateIdx] ?? FALLBACK_SALUTATION;
      }
    } catch {
      timeGreeting = FALLBACK_SALUTATION;
    }

    const name = firstName?.trim();
    const salutation = name ? `${timeGreeting}, ${name}` : timeGreeting;

    const phraseIdx = Math.floor(Math.random() * PHRASES.length);
    const phrase = PHRASES[phraseIdx] ?? FALLBACK_PHRASE;

    return { salutation, phrase };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
