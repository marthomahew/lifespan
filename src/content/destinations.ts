/** Holiday destinations: a flag, a name, and a few things that happen there. */
export type Destination = { id: string; label: string; flag: string; lines: string[] };

export const DESTINATIONS: Destination[] = [
  {
    id: 'iceland',
    label: 'Iceland',
    flag: '🇮🇸',
    lines: [
      'You swim in a hot spring while snow falls on your head. It is the strangest comfort you have ever felt.',
      'A waterfall so loud you cannot hear yourself think, which turns out to be the point.',
    ],
  },
  {
    id: 'italy',
    label: 'Italy',
    flag: '🇮🇹',
    lines: [
      'You eat the same plate of pasta on four separate evenings because you could not bear not to.',
      'A grandmother at the next table corrects how you hold your fork, kindly, and gives you a lemon.',
    ],
  },
  {
    id: 'japan',
    label: 'Japan',
    flag: '🇯🇵',
    lines: [
      'A train arrives exactly on time, every time, and something in you unclenches.',
      'You buy a drink from a vending machine on a mountain path and it is somehow hot.',
    ],
  },
  {
    id: 'mexico',
    label: 'Mexico',
    flag: '🇲🇽',
    lines: [
      'A street taco at midnight ruins every taco you will ever eat again, in the best way.',
      'You climb a pyramid in the heat and sit at the top saying nothing at all for ten minutes.',
    ],
  },
  {
    id: 'thailand',
    label: 'Thailand',
    flag: '🇹🇭',
    lines: [
      'A boat, an island, water the colour of mouthwash. You do absolutely nothing, expertly.',
      'You take a cooking class and learn you have been underusing lime your entire life.',
    ],
  },
  {
    id: 'morocco',
    label: 'Morocco',
    flag: '🇲🇦',
    lines: [
      'You get lost in a market for an hour and come out with mint tea, a lamp and no regrets.',
      'A night in the desert under more stars than you knew the sky could hold.',
    ],
  },
  {
    id: 'peru',
    label: 'Peru',
    flag: '🇵🇪',
    lines: [
      'You reach the ruins at dawn, out of breath, as the cloud lifts off the mountains like a curtain.',
      'A llama looks at you with complete contempt. You take forty photographs of it anyway.',
    ],
  },
  {
    id: 'greece',
    label: 'Greece',
    flag: '🇬🇷',
    lines: [
      'White walls, blue doors, and a ferry that leaves when it feels like it. You stop checking the time.',
      'You swim in the sea before breakfast every morning and come home a few shades braver.',
    ],
  },
  {
    id: 'canada',
    label: 'Canada',
    flag: '🇨🇦',
    lines: [
      'A lake so still the mountains appear twice. A moose wanders past as if it owns the place, which it does.',
      'Maple syrup on everything, including, at one point, bacon. You approve.',
    ],
  },
  {
    id: 'australia',
    label: 'Australia',
    flag: '🇦🇺',
    lines: [
      'A kangaroo blocks the car park and nobody seems surprised. You are extremely surprised.',
      'You learn to surf for exactly one wave, which is enough to tell everyone you surf.',
    ],
  },
  {
    id: 'france',
    label: 'France',
    flag: '🇫🇷',
    lines: [
      'A bakery at the end of the street becomes your whole personality for a week.',
      'You sit in a square with a coffee for three hours and nobody hurries you. Civilisation.',
    ],
  },
  {
    id: 'kenya',
    label: 'Kenya',
    flag: '🇰🇪',
    lines: [
      'At dawn the jeep stops and an elephant family crosses in front of you, unbothered and enormous.',
      'A guide points out a lion asleep in a tree. You did not know lions did that. You will tell everyone.',
    ],
  },
];

export const DESTINATION_BY_ID: Record<string, Destination> = Object.fromEntries(
  DESTINATIONS.map((d) => [d.id, d]),
);
