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
  {
    id: 'spain',
    label: 'Spain',
    flag: '🇪🇸',
    lines: [
      'Dinner starts at ten at night. By the third evening you understand, and by the fifth you cannot imagine eating at seven.',
      'You get lost in the old quarter of a southern city and end up at a courtyard where someone is playing guitar to nobody in particular.',
    ],
  },
  {
    id: 'portugal',
    label: 'Portugal',
    flag: '🇵🇹',
    lines: [
      'You eat a custard tart warm from the oven and immediately buy six more for “later”, which is twenty minutes.',
      'A yellow tram groans up a hill so steep you are sure it will roll backwards. It does not. You applaud anyway.',
    ],
  },
  {
    id: 'egypt',
    label: 'Egypt',
    flag: '🇪🇬',
    lines: [
      'The pyramids are bigger than every photograph, and closer to the city than you expected, with a fast-food sign in view.',
      'A felucca drifts down the Nile at sunset while the captain hums. Nobody says anything for an hour.',
    ],
  },
  {
    id: 'south_africa',
    label: 'South Africa',
    flag: '🇿🇦',
    lines: [
      'You ride a cable car up a flat-topped mountain and look down on two oceans meeting.',
      'Penguins on a beach, waddling past sunbathers like commuters late for work.',
    ],
  },
  {
    id: 'new_zealand',
    label: 'New Zealand',
    flag: '🇳🇿',
    lines: [
      'You drive for an hour without seeing another car, only sheep and mountains that look painted on.',
      'Someone talks you into a bungee jump. The scream you make will haunt the people on the bridge.',
    ],
  },
  {
    id: 'argentina',
    label: 'Argentina',
    flag: '🇦🇷',
    lines: [
      'The steak is the size of a hubcap and the waiter seems mildly offended that you cannot finish it.',
      'A couple dance tango in a square at midnight, and an old man next to you explains every step, wrongly, with great passion.',
    ],
  },
  {
    id: 'turkey',
    label: 'Turkey',
    flag: '🇹🇷',
    lines: [
      'At dawn the sky over the valley fills with hot-air balloons, and you forget to take a photo.',
      'A carpet seller gives you three glasses of tea and an hour of stories. You leave with a rug you did not plan to own.',
    ],
  },
  {
    id: 'vietnam',
    label: 'Vietnam',
    flag: '🇻🇳',
    lines: [
      'You learn to cross the road by walking slowly and steadily into a river of scooters. It works. You do not know how.',
      'A bowl of noodle soup on a plastic stool at six in the morning is the best meal of the trip.',
    ],
  },
  {
    id: 'norway',
    label: 'Norway',
    flag: '🇳🇴',
    lines: [
      'The ferry slides between cliffs so tall the waterfalls on them seem to fall forever.',
      'Green light ripples across the night sky and a whole bus of strangers goes quiet together.',
    ],
  },
  {
    id: 'china',
    label: 'China',
    flag: '🇨🇳',
    lines: [
      'You walk a stretch of the Great Wall and it climbs over the hills in both directions further than you can see.',
      'The street food stall has a queue around the block. You join it on principle and it is worth every minute.',
    ],
  },
  {
    id: 'ireland',
    label: 'Ireland',
    flag: '🇮🇪',
    lines: [
      'It rains four times in one afternoon and the sun comes out between each one, like an apology.',
      'In a pub, a fiddle player starts a tune and within ten minutes the whole room is singing along.',
    ],
  },
  {
    id: 'cuba',
    label: 'Cuba',
    flag: '🇨🇺',
    lines: [
      'A pink convertible older than your parents drives you along the seafront while the driver sings.',
      'Everywhere you go, someone is playing music, and everyone seems to know how to dance except you.',
    ],
  },
];

export const DESTINATION_BY_ID: Record<string, Destination> = Object.fromEntries(
  DESTINATIONS.map((d) => [d.id, d]),
);
