import type { EventDef } from '../../engine/events/types';
import { all, inField, isJob, jobLevelAtLeast, oddsBy } from './conditions';

/** Field-specific working life: trades, hospitality, public service, transport. */
export const CAREER_HANDS_EVENTS: EventDef[] = [
  // ---------- trades ----------
  {
    id: 'car_trades_junction_box',
    kind: 'choice',
    category: 'work',
    ages: [18, 55],
    weight: 8,
    cooldownYears: 6,
    when: all(inField('trades'), isJob('electrician')),
    text: 'Behind a kitchen wall you find a junction box wired by someone who clearly hated the future. Three colours of cable, none of them the right one, and a strip of electrical tape holding up what looks like a theory.',
    choices: [
      {
        id: 'rewire',
        label: 'Rewire the whole run properly',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.6),
            text: 'It takes the full afternoon and two extra boxes, but the circuit is now something you would show your old instructor. The homeowner tips you in biscuits.',
            effects: [
              { performance: 6 },
              { stat: 'karma', delta: 3 },
              { stat: 'stress', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Halfway through you discover the mess continues into the bathroom, the loft and possibly the neighbouring house. You finish late and over budget.',
            effects: [{ performance: -2 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'patch',
        label: 'Fix the one fault you were called for',
        outcomes: [
          {
            chance: 1,
            text: 'You fix the socket, label the box with a polite warning, and leave on time. Whoever opens that wall next will think of you fondly.',
            effects: [{ performance: 2 }, { stat: 'happiness', delta: 2 }],
          },
        ],
      },
      {
        id: 'bare',
        label: 'Test it live to save time',
        outcomes: [
          {
            chance: 0.5,
            text: 'Nothing happens, which you decide was skill. You are home before the traffic.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'karma', delta: -2 },
            ],
          },
          {
            chance: 0.5,
            text: 'The box bites. You are thrown back against the cupboard with a numb arm and a new respect for isolation switches.',
            effects: [{ injury: 12 }, { performance: -4 }, { stat: 'stress', delta: 8 }],
          },
        ],
      },
    ],
  },
  {
    id: 'car_trades_flooded_basement',
    kind: 'choice',
    category: 'work',
    ages: [20, 58],
    weight: 8,
    cooldownYears: 6,
    when: all(inField('trades'), isJob('plumber')),
    text: 'At 2 a.m. your phone wakes you: a basement flooded ankle-deep, a burst pipe, and a homeowner who has been bailing with a salad bowl. It is your night on call, technically.',
    choices: [
      {
        id: 'go',
        label: 'Drive over and fix it tonight',
        outcomes: [
          {
            chance: 1,
            text: 'You find the stopcock behind a wall of paint tins, cap the pipe, and wade out at dawn. The homeowner takes your card with both hands.',
            effects: [
              { performance: 7 },
              { stat: 'stress', delta: 4 },
              { stat: 'health', delta: -2 },
            ],
            success: true,
            next: { eventId: 'car_trades_basement_callback', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'phone',
        label: 'Talk them through the stopcock by phone',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55),
            text: 'You guide them past the boiler, the bike and the box of old trophies to a tap they did not know they owned. The water stops and you go back to sleep.',
            effects: [{ performance: 3 }, { stat: 'happiness', delta: 2 }],
            success: true,
          },
          {
            chance: 0.45,
            text: 'They turn the gas off instead. You go over anyway, an hour later and in a worse mood.',
            effects: [{ performance: -1 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Let it ring',
        outcomes: [
          {
            chance: 1,
            text: 'You sleep beautifully. The firm does not, after the homeowner leaves a review that uses the word "abandoned" four times.',
            effects: [
              { performance: -8 },
              { stat: 'karma', delta: -3 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_trades_basement_callback',
    kind: 'choice',
    category: 'work',
    ages: [21, 61],
    weight: 8,
    chainOnly: true,
    when: inField('trades'),
    text: 'The salad-bowl homeowner has told everyone on the street about you. Now a builder they know wants you to do all the plumbing on a six-house development, cash in hand, starting next month.',
    choices: [
      {
        id: 'take',
        label: 'Take the contract on the side',
        outcomes: [
          {
            chance: 0.6,
            text: 'Six houses, six weekends, and a very healthy envelope. Your back files a formal complaint.',
            effects: [{ money: 9000 }, { stat: 'stress', delta: 8 }, { stat: 'health', delta: -3 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The builder pays for four houses and then stops answering the phone. You learn a lot about invoices.',
            effects: [
              { money: 3000 },
              { stat: 'stress', delta: 10 },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'firm',
        label: 'Bring the job to your firm',
        outcomes: [
          {
            chance: 1,
            text: 'Your manager is visibly moved that you did not go behind their back. The job goes through the books and your name goes on the bonus list.',
            effects: [{ performance: 8 }, { money: 1500 }, { stat: 'karma', delta: 2 }],
            success: true,
          },
        ],
      },
      {
        id: 'pass',
        label: 'Politely decline',
        outcomes: [
          {
            chance: 1,
            text: 'You keep your weekends. The builder hires a cousin, and you hear about the leaks for years.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_trades_scaffold_tie',
    kind: 'choice',
    category: 'work',
    ages: [18, 55],
    weight: 7,
    cooldownYears: 7,
    when: inField('trades'),
    bind: { col: { role: 'coworker' } },
    text: 'The site is a day behind and the wind is picking up. {col.first} wants to skip re-tying the top lift of scaffold so you can get the roof sheets on before the rain.',
    choices: [
      {
        id: 'tie',
        label: 'Insist on tying it first',
        outcomes: [
          {
            chance: 1,
            text: 'You lose the morning and the race with the rain. The scaffold, however, is still standing on Monday, which is more than the site next door can say.',
            effects: [
              { performance: 2 },
              { rel: 'col', delta: -3, memory: 'the morning you made everyone tie the scaffold' },
              { stat: 'karma', delta: 3 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'skip',
        label: 'Go up as it is',
        outcomes: [
          {
            chance: 0.65,
            text: 'The sheets go on, the rain arrives an hour later, and the foreman buys pizza. Nobody mentions the ties.',
            effects: [
              { performance: 5 },
              { rel: 'col', delta: 4, memory: 'beating the rain on the roof' },
            ],
          },
          {
            chance: 0.35,
            text: 'A gust shifts the boards under your feet. You grab a pole and hang on, then climb down with a wrenched shoulder and no appetite for heights.',
            effects: [{ injury: 15 }, { performance: -3 }, { stat: 'stress', delta: 10 }],
          },
        ],
      },
      {
        id: 'report',
        label: 'Ring the site manager',
        outcomes: [
          {
            chance: 1,
            text: 'Work stops for a safety talk delivered in the tone of a disappointed parent. {col.first} spends the week calling you "the inspector".',
            effects: [
              { rel: 'col', delta: -8, memory: 'the safety talk you caused' },
              { performance: 1 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
    ],
  },

  // ---------- hospitality ----------
  {
    id: 'car_hospitality_walkin_dead',
    kind: 'choice',
    category: 'work',
    ages: [18, 55],
    weight: 8,
    cooldownYears: 6,
    when: all(inField('hospitality'), isJob('chef')),
    bind: { col: { role: 'coworker' } },
    text: 'Forty covers booked, and the walk-in fridge has died with a sigh. The fish is warming, the cream is thinking about it, and {col.first} is staring at you like you own a spare refrigerator.',
    choices: [
      {
        id: 'rework',
        label: 'Rewrite the menu around what survives',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55),
            text: 'You turn three crates of vegetables and a panic into a "market special" chalkboard. Diners call it bold. You call it Tuesday.',
            effects: [
              { skill: 'cooking', delta: 4 },
              { performance: 8 },
              { rel: 'col', delta: 5, memory: 'the night of the dead fridge' },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'The improvised menu has one dish too many and one cook too few. Tickets pile up like snow and table nine leaves before dessert.',
            effects: [
              { skill: 'cooking', delta: 2 },
              { performance: -3 },
              { stat: 'stress', delta: 8 },
            ],
          },
        ],
      },
      {
        id: 'ice',
        label: 'Buy every bag of ice in the area',
        outcomes: [
          {
            chance: 1,
            text: 'You fill the sinks with ice and serve the full menu out of picnic coolers. It works, and nobody ever learns how close it was.',
            effects: [{ money: -300 }, { performance: 5 }, { stat: 'stress', delta: 5 }],
            success: true,
          },
        ],
      },
      {
        id: 'risk',
        label: 'Serve the fish anyway',
        outcomes: [
          {
            chance: 0.6,
            text: 'Everyone eats, everyone pays, and everyone seems fine. You do not sleep well.',
            effects: [
              { stat: 'karma', delta: -5 },
              { stat: 'stress', delta: 6 },
            ],
          },
          {
            chance: 0.4,
            text: 'By morning two tables have phoned in, both deeply unwell. The owner pulls you into the office, which is also the dry store.',
            effects: [
              { performance: -12 },
              { stat: 'karma', delta: -6 },
              { rel: 'col', delta: -4, memory: 'the fish you served' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_hospitality_one_more',
    kind: 'choice',
    category: 'work',
    ages: [18, 55],
    weight: 7,
    cooldownYears: 5,
    when: all(inField('hospitality'), isJob('bartender')),
    text: 'A regular who tips like a lottery winner has had plenty, and is now leaning on the bar asking for "one for the road" with his car keys on the counter.',
    choices: [
      {
        id: 'cut',
        label: 'Cut him off and call a taxi',
        outcomes: [
          {
            chance: 0.7,
            text: 'He grumbles, pockets the keys and gets in the taxi. The next week he tips you double and does not explain why.',
            effects: [{ stat: 'karma', delta: 5 }, { performance: 3 }, { money: 120 }],
            success: true,
          },
          {
            chance: 0.3,
            text: 'He calls you a word you have not heard since school and finds another bar. The keys stay with you, at least.',
            effects: [
              { stat: 'karma', delta: 4 },
              { stat: 'happiness', delta: -3 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'water',
        label: 'Pour him a convincing glass of water',
        outcomes: [
          {
            chance: 1,
            text: 'You add ice, lime and great confidence. He toasts your generosity and falls asleep in the booth until closing.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'serve',
        label: 'Pour it',
        outcomes: [
          {
            chance: 1,
            text: 'The tip is enormous. The feeling in your stomach when he drives off is bigger.',
            effects: [{ money: 80 }, { stat: 'karma', delta: -8 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
    ],
  },
  {
    id: 'car_hospitality_wedding_floor',
    kind: 'notice',
    category: 'work',
    ages: [18, 55],
    weight: 6,
    cooldownYears: 6,
    when: all(inField('hospitality'), isJob('hotel_staff')),
    text: 'A wedding party books out the entire fourth floor, and by midnight the corridor has become a disco, a lost-property office and a quiet negotiation about a borrowed suit.',
    outcomes: [
      {
        chance: 0.6,
        text: 'You return eleven shoes, two rings and one groom to their owners. The bride writes your name on the feedback card with a heart.',
        effects: [{ performance: 6 }, { stat: 'stress', delta: 4 }],
        success: true,
      },
      {
        chance: 0.4,
        text: 'Someone sets off the sprinkler in room 412 with a sparkler. You spend the night with a mop and a complaint form.',
        effects: [
          { performance: -2 },
          { stat: 'stress', delta: 8 },
          { stat: 'happiness', delta: -3 },
        ],
      },
    ],
  },
  {
    id: 'car_hospitality_mystery_diner',
    kind: 'choice',
    category: 'work',
    ages: [20, 59],
    weight: 7,
    cooldownYears: 7,
    when: all(inField('hospitality'), jobLevelAtLeast(1)),
    bind: { boss: { role: 'boss' } },
    text: 'A diner alone at table six is taking notes between bites and photographing the bread. {boss.first} is convinced it is a reviewer and wants the whole team performing.',
    choices: [
      {
        id: 'fuss',
        label: 'Give table six the royal treatment',
        outcomes: [
          {
            chance: 0.5,
            text: 'It is a reviewer, and the write-up calls the service "attentive to the point of devotion". {boss.first} frames it.',
            effects: [
              { performance: 8 },
              { rel: 'boss', delta: 6, memory: 'the review you landed' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'It is a man planning his own birthday dinner. Meanwhile the rest of the room waited forty minutes for water.',
            effects: [{ performance: -4 }, { stat: 'stress', delta: 5 }],
          },
        ],
      },
      {
        id: 'everyone',
        label: 'Treat every table that way tonight',
        outcomes: [
          {
            chance: 1,
            text: 'You run the floor like an orchestra. Nobody finds out who the note-taker was, but tips go up across the board.',
            effects: [{ performance: 5 }, { money: 150 }, { stat: 'stress', delta: 4 }],
            success: true,
          },
        ],
      },
      {
        id: 'ask',
        label: 'Ask the diner directly',
        outcomes: [
          {
            chance: 1,
            text: '"Food blog. Eleven readers. My mum is nine of them." {boss.first} deflates, and the evening goes back to normal.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'boss', delta: -2, memory: 'spoiling the reviewer theory' },
            ],
          },
        ],
      },
    ],
  },

  // ---------- public service ----------
  {
    id: 'car_public_service_smoke_and_cat',
    kind: 'choice',
    category: 'work',
    ages: [18, 55],
    weight: 8,
    cooldownYears: 6,
    when: all(inField('public_service'), isJob('firefighter')),
    bind: { col: { role: 'coworker' } },
    text: 'The call is a flat fire, which turns out to be mostly smoke from a forgotten pan and one cat, furious, on top of the wardrobe. {col.first} has the hose; you have the cat problem.',
    choices: [
      {
        id: 'climb',
        label: 'Climb up and get the cat',
        outcomes: [
          {
            chance: 0.6,
            text: 'You carry it out wrapped in a towel to applause from the stairwell. The owner cries; the cat does not forgive you.',
            effects: [
              { performance: 5 },
              { stat: 'happiness', delta: 5 },
              { rel: 'col', delta: 3, memory: 'the cat rescue on the fourth floor' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The cat leaves via your face. You exit with the animal, the applause and a set of scratches the medic photographs for training.',
            effects: [{ injury: 4 }, { performance: 4 }, { stat: 'stress', delta: 3 }],
            success: true,
          },
        ],
      },
      {
        id: 'vent',
        label: 'Vent the flat and let the cat come down',
        outcomes: [
          {
            chance: 1,
            text: 'You open the windows, kill the pan and wait. The cat descends at its own pace, inspects your boots and walks out like it saved you.',
            effects: [{ performance: 3 }, { stat: 'stress', delta: -2 }],
          },
        ],
      },
      {
        id: 'hand',
        label: 'Hand the cat job to {col.first}',
        outcomes: [
          {
            chance: 1,
            text: '{col.first} gets the photo in the local paper and a scar on one wrist. You get the paperwork.',
            effects: [
              { rel: 'col', delta: -3, memory: 'the cat you handed over' },
              { performance: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_public_service_hedge_dispute',
    kind: 'choice',
    category: 'work',
    ages: [18, 55],
    weight: 7,
    cooldownYears: 6,
    when: all(inField('public_service'), isJob('police_officer')),
    text: 'Your shift is a call about two neighbours, one hedge, and eleven years of grievances. Both are waiting on the pavement holding printouts.',
    choices: [
      {
        id: 'mediate',
        label: 'Sit them both down and mediate',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            text: 'Two hours and a tape measure later, they agree on a height and shake hands. Neither is happy, which is how you know it is fair.',
            effects: [
              { performance: 6 },
              { stat: 'karma', delta: 3 },
              { stat: 'stress', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The mediation becomes a new grievance. They both file complaints, about each other and about you.',
            effects: [{ performance: -3 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'civil',
        label: 'Explain it is a civil matter',
        outcomes: [
          {
            chance: 1,
            text: 'You hand over two leaflets and leave. You are back within the month for the same hedge.',
            effects: [{ performance: 1 }, { stat: 'happiness', delta: -1 }],
          },
        ],
      },
      {
        id: 'side',
        label: 'Quietly side with the one with tea',
        outcomes: [
          {
            chance: 1,
            text: 'The tea is excellent. The complaint the other neighbour lodges is also excellent, in its way.',
            effects: [
              { performance: -6 },
              { stat: 'karma', delta: -3 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_public_service_wrong_form',
    kind: 'choice',
    category: 'work',
    ages: [20, 58],
    weight: 7,
    cooldownYears: 8,
    when: all(inField('public_service'), isJob('civil_servant')),
    bind: { boss: { role: 'boss' } },
    text: 'You notice that a benefits form the department has used for eleven years asks applicants to sign in a box that does not exist. Nobody has mentioned it. Thousands have signed the margin.',
    choices: [
      {
        id: 'fix',
        label: 'Write a proper proposal to fix it',
        outcomes: [
          {
            chance: 1,
            text: 'Your memo is four pages, footnoted and quietly devastating. {boss.first} says it will "go to committee", which is where things go to be thought about.',
            effects: [
              { performance: 4 },
              { stat: 'stress', delta: 3 },
              { rel: 'boss', delta: 2, memory: 'your memo about the signature box' },
            ],
            success: true,
            next: { eventId: 'car_public_service_form_committee', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'quiet',
        label: 'Redraw the box yourself and say nothing',
        outcomes: [
          {
            chance: 0.6,
            text: 'You add the box to the template on a Friday afternoon. Nobody notices, which is the highest praise the department gives.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'karma', delta: 2 },
            ],
          },
          {
            chance: 0.4,
            text: 'An unauthorised template change triggers an audit. Three people want to know who you think you are.',
            effects: [{ performance: -6 }, { stat: 'stress', delta: 7 }],
          },
        ],
      },
      {
        id: 'leave',
        label: 'Leave it; it has worked for eleven years',
        outcomes: [
          {
            chance: 1,
            text: 'You decide the margin is doing fine. Every time you see the form you feel slightly worse about it.',
            effects: [{ stat: 'happiness', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'car_public_service_form_committee',
    kind: 'choice',
    category: 'work',
    ages: [21, 61],
    weight: 8,
    chainOnly: true,
    when: inField('public_service'),
    bind: { boss: { role: 'boss' } },
    text: 'The committee has approved your signature box. {boss.first} would like to present it at the regional conference as a team achievement, with your name in very small print.',
    choices: [
      {
        id: 'let',
        label: 'Let {boss.first} present it',
        outcomes: [
          {
            chance: 1,
            text: '{boss.first} gets a lanyard and a round of applause, then mentions you by name at the end. Your next review is suspiciously warm.',
            effects: [
              { performance: 7 },
              { rel: 'boss', delta: 8, memory: 'letting them present the form' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'copresent',
        label: 'Ask to co-present',
        outcomes: [
          {
            chance: oddsBy('looks', 0.5),
            text: 'You present the box with such conviction that a deputy director asks for your extension. Forms have never been this exciting.',
            effects: [
              { performance: 10 },
              { stat: 'happiness', delta: 5 },
              { rel: 'boss', delta: -2, memory: 'sharing the stage at the conference' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Your slides refuse to load and you describe a rectangle with your hands for six minutes. People are kind about it.',
            effects: [{ performance: -2 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'credit',
        label: 'Demand sole credit in writing',
        outcomes: [
          {
            chance: 1,
            text: 'You get the credit and a chill in the office that lasts until spring. The box is still the best thing you have done.',
            effects: [
              { performance: 2 },
              { rel: 'boss', delta: -10, memory: 'the credit email about the form' },
              { stat: 'karma', delta: -1 },
            ],
          },
        ],
      },
    ],
  },

  // ---------- transport ----------
  {
    id: 'car_transport_lost_child',
    kind: 'choice',
    category: 'work',
    ages: [18, 57],
    weight: 8,
    cooldownYears: 7,
    when: all(inField('transport'), isJob('bus_driver')),
    text: 'At the end of the line a small boy is still on the back seat, swinging his legs, with no adult and a very firm belief that this is the stop for his nan.',
    choices: [
      {
        id: 'radio',
        label: 'Radio control and wait with him',
        outcomes: [
          {
            chance: 1,
            text: 'You share half a sandwich and learn everything about dinosaurs. His frantic mother arrives in a taxi and hugs you before she hugs him.',
            effects: [
              { performance: 4 },
              { stat: 'karma', delta: 6 },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'drive',
        label: 'Drive the route back looking for his family',
        outcomes: [
          {
            chance: 0.6,
            text: 'Four stops back you spot a woman running down the pavement waving both arms. The whole bus cheers.',
            effects: [
              { stat: 'karma', delta: 5 },
              { stat: 'happiness', delta: 5 },
              { performance: 1 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You find nobody, run forty minutes late and get a written warning for the detour. The boy is collected from the depot, thrilled by the whole adventure.',
            effects: [
              { performance: -5 },
              { stat: 'karma', delta: 3 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'hand',
        label: 'Hand him to the depot supervisor',
        outcomes: [
          {
            chance: 1,
            text: 'Procedure is followed and the boy is fine. You drive the next route wondering whether he liked you.',
            effects: [{ performance: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'car_transport_crosswind',
    kind: 'choice',
    category: 'work',
    ages: [23, 62],
    weight: 7,
    cooldownYears: 6,
    when: all(inField('transport'), isJob('airline_pilot')),
    bind: { col: { role: 'coworker' } },
    text: 'The wind at the airport is gusting across the runway, right at the limit for your aircraft. {col.first}, in the right seat, has gone very quiet. A hundred and sixty passengers want their luggage.',
    choices: [
      {
        id: 'land',
        label: 'Fly the approach and land it',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.65),
            text: 'You crab in, kick it straight at the last second and touch down on the centreline. Someone in row twelve claps; {col.first} exhales for the first time in four minutes.',
            effects: [
              { performance: 8 },
              { rel: 'col', delta: 5, memory: 'your crosswind landing' },
              { stat: 'stress', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'A gust lifts a wing on the flare and you go around, heart thumping. The second attempt is ugly but safe. The report takes longer than the flight.',
            effects: [{ performance: -2 }, { stat: 'stress', delta: 9 }],
          },
        ],
      },
      {
        id: 'divert',
        label: 'Divert to the alternate',
        outcomes: [
          {
            chance: 1,
            text: 'You land smoothly two hundred miles from where anyone wanted to be. The airline grumbles about buses; the safety office sends a note of approval.',
            effects: [
              { performance: 2 },
              { stat: 'stress', delta: 3 },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'give',
        label: 'Give the landing to {col.first}',
        outcomes: [
          {
            chance: 0.5,
            text: '{col.first} flies a textbook approach and will tell this story at every barbecue for a decade.',
            effects: [
              { rel: 'col', delta: 10, memory: 'trusting them with the crosswind landing' },
              { performance: 3 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The landing is firm enough to open three overhead lockers. Nobody is hurt; several people are photographed holding their own coats.',
            effects: [
              { rel: 'col', delta: 2, memory: 'the landing that opened the lockers' },
              { performance: -5 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_transport_logbook',
    kind: 'choice',
    category: 'work',
    ages: [20, 59],
    weight: 7,
    cooldownYears: 6,
    when: all(inField('transport'), isJob('truck_driver')),
    bind: { boss: { role: 'boss' } },
    text: 'You are an hour short of your legal driving limit and three hours from the depot. {boss.first} rings to say the client is "flexible about paperwork" and so, ideally, are you.',
    choices: [
      {
        id: 'rest',
        label: 'Pull into a lay-by and take your break',
        outcomes: [
          {
            chance: 1,
            text: 'You sleep in the cab to the sound of other trucks. The delivery is late; your logbook is spotless.',
            effects: [
              { performance: -2 },
              { stat: 'health', delta: 2 },
              { rel: 'boss', delta: -4, memory: 'the late delivery you would not rush' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'push',
        label: 'Push on and fudge the log',
        outcomes: [
          {
            chance: 0.6,
            text: 'You arrive on time, gritty-eyed, with a log full of creative arithmetic. {boss.first} says you are the only one who gets it.',
            effects: [
              { performance: 6 },
              { rel: 'boss', delta: 5, memory: 'getting the load in on time' },
              { stat: 'karma', delta: -4 },
            ],
          },
          {
            chance: 0.4,
            text: 'You drift onto the rumble strip at two in the morning and jolt awake with your heart in your mouth. You pull over, shaking, and make the delivery late anyway.',
            effects: [
              { stat: 'stress', delta: 12 },
              { stat: 'health', delta: -3 },
              { performance: -3 },
            ],
          },
        ],
      },
      {
        id: 'swap',
        label: 'Arrange a relay with another driver',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            text: 'A driver heading your way meets you at a services and takes the trailer the last stretch. It costs you a coffee and a favour.',
            effects: [{ performance: 4 }, { money: -20 }, { stat: 'stress', delta: -2 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Everyone you ring is either asleep or over their own hours. You end up in the lay-by after all, having woken half the country.',
            effects: [{ performance: -2 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'car_transport_depot_radio',
    kind: 'notice',
    category: 'work',
    ages: [18, 57],
    weight: 6,
    cooldownYears: 5,
    // Snow needs a country that gets it.
    when: (s) =>
      inField('transport')(s) &&
      [
        'us',
        'uk',
        'ca',
        'se',
        'de',
        'fr',
        'jp',
        'kr',
        'nl',
        'pl',
        'tr',
        'cn',
        'ie',
        'it',
        'si',
      ].includes(s.player.country),
    text: 'A snowstorm shuts half the routes out of {city}, and dispatch spends the day on the radio reading out closed roads like a sad poem.',
    outcomes: [
      {
        chance: 0.5,
        text: 'You find a back way nobody else remembers and finish your run, the only one who does. The depot board shows your name in marker pen.',
        effects: [{ performance: 6 }, { stat: 'happiness', delta: 3 }],
        success: true,
      },
      {
        chance: 0.5,
        text: 'You spend six hours parked behind a gritter with a flask and the radio. It is unpaid, cold, and strangely restful.',
        effects: [
          { stat: 'stress', delta: -2 },
          { stat: 'happiness', delta: -1 },
        ],
      },
    ],
  },
];
