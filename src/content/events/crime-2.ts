import type { EventDef } from '../../engine/events/types';
import {
  all,
  any,
  canAfford,
  hasJob,
  hasRecord,
  notInPrison,
  oddsBy,
  statAtLeast,
} from './conditions';

/** Players with a past: records, reputations and the people who remember them. */
const onTheWrongSide = all(notInPrison, any(hasRecord, statAtLeast('notoriety', 25)));

export const CRIME_EVENTS_2: EventDef[] = [
  {
    id: 'crime2_one_last_job',
    kind: 'choice',
    category: 'crime',
    ages: [20, 58],
    weight: 6,
    cooldownYears: 8,
    adultsOnly: true,
    when: onTheWrongSide,
    text: 'A man you once knew only as Kestrel slides into the seat opposite you at the bus stop. He has one last job, a guaranteed payday, and he swears this time nobody gets hurt.',
    choices: [
      {
        id: 'in',
        label: 'Say you’re in',
        outcomes: [
          {
            chance: 0.55,
            success: true,
            text: 'It goes exactly as he said, which unsettles you more than if it hadn’t. Your share arrives in a shoebox.',
            effects: [{ money: 9000 }, { crime: 'burglary' }, { stat: 'stress', delta: 8 }],
            next: { eventId: 'crime2_one_last_job_echo', inYears: [1, 3] },
          },
          {
            chance: 0.45,
            text: 'It is over in ninety seconds and none of it goes to plan. You hear the sirens before you reach the corner.',
            effects: [
              { crime: 'burglary', arrest: true },
              { stat: 'stress', delta: 12 },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Tell him you’re retired',
        outcomes: [
          {
            chance: 1,
            text: 'Kestrel laughs like you told a joke, then sees your face and stops. He leaves the bus fare on the bench.',
            effects: [
              { stat: 'karma', delta: 4 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'warn',
        label: 'Tell him to drop it too',
        outcomes: [
          {
            chance: 0.4,
            text: 'He goes quiet for a long time. Then he says his kid starts school next month, and gets on the bus without you.',
            effects: [{ stat: 'karma', delta: 7 }],
          },
          {
            chance: 0.6,
            text: 'He calls you soft and means it as the worst word he knows. You are fine with soft.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'notoriety', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'crime2_one_last_job_echo',
    kind: 'choice',
    category: 'crime',
    ages: [21, 61],
    weight: 6,
    chainOnly: true,
    adultsOnly: true,
    when: notInPrison,
    text: 'Kestrel has been picked up on something unrelated. A friend of a friend says he is talking, and that he has a long memory for names.',
    choices: [
      {
        id: 'lawyer',
        label: 'Quietly retain a lawyer',
        requires: canAfford(5000),
        outcomes: [
          {
            chance: 1,
            success: true,
            text: 'Your lawyer makes two phone calls and tells you to stop checking the window. Your name never appears in anything.',
            effects: [{ money: -5000 }, { stat: 'stress', delta: -4 }],
          },
        ],
      },
      {
        id: 'wait',
        label: 'Keep your head down',
        outcomes: [
          {
            chance: 0.6,
            text: 'Whatever Kestrel said, it wasn’t about you. Months later you still flinch at knocks.',
            effects: [{ stat: 'stress', delta: 10 }],
          },
          {
            chance: 0.4,
            text: 'Two detectives arrive at breakfast with a warrant and a photo of a shoebox.',
            effects: [{ crime: 'burglary', arrest: true }],
          },
        ],
      },
      {
        id: 'confess',
        label: 'Walk into a station first',
        outcomes: [
          {
            chance: 1,
            text: 'The desk officer has to fetch someone senior. It is a strange relief to say it out loud.',
            effects: [
              { stat: 'karma', delta: 8 },
              { crime: 'burglary', arrest: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'crime2_fence_offer',
    kind: 'choice',
    category: 'crime',
    ages: [19, 55],
    weight: 6,
    cooldownYears: 6,
    adultsOnly: true,
    when: onTheWrongSide,
    text: 'A woman with a market stall and too many rings recognises you from your bad years. She has a van of goods with no paperwork and wants a partner who knows how to keep quiet.',
    choices: [
      {
        id: 'partner',
        label: 'Go in with her',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            success: true,
            text: 'The van empties in a fortnight and you never ask where it was filled. The money is good; sleeping is harder.',
            effects: [{ money: 6000 }, { crime: 'fraud' }, { stat: 'stress', delta: 6 }],
          },
          {
            chance: 0.4,
            text: 'One of the buyers turns out to be wearing a wire under his fleece. She gets away. You do not.',
            effects: [{ crime: 'fraud', arrest: true }],
          },
        ],
      },
      {
        id: 'browse',
        label: 'Buy one thing, nothing more',
        requires: canAfford(400),
        outcomes: [
          {
            chance: 1,
            text: 'You come home with a very good coffee machine at a very suspicious price. It makes excellent, guilty coffee.',
            effects: [
              { money: -400 },
              { stat: 'happiness', delta: 3 },
              { stat: 'karma', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'walk',
        label: 'Keep walking',
        outcomes: [
          {
            chance: 1,
            text: 'She calls after you that the offer stands. You take a different route to the shops for a year.',
            effects: [{ stat: 'karma', delta: 3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'crime2_detective_remembers',
    kind: 'choice',
    category: 'crime',
    ages: [22, 60],
    weight: 5,
    cooldownYears: 10,
    adultsOnly: true,
    when: onTheWrongSide,
    text: 'The detective who worked your old case is two places ahead of you in the bakery queue. She turns, looks at you for exactly one second too long, and smiles like she has a good memory.',
    choices: [
      {
        id: 'greet',
        label: 'Say good morning',
        outcomes: [
          {
            chance: 0.6,
            text: 'She asks how you are keeping and seems to actually want to know. You walk out lighter than you walked in.',
            effects: [
              { stat: 'stress', delta: -3 },
              { stat: 'karma', delta: 2 },
            ],
          },
          {
            chance: 0.4,
            text: '“Staying out of trouble?” she asks, and does not wait for the answer. Your pastry tastes of nothing.',
            effects: [{ stat: 'stress', delta: 5 }],
          },
        ],
      },
      {
        id: 'leave',
        label: 'Abandon your place and leave',
        outcomes: [
          {
            chance: 1,
            text: 'You go without bread. Leaving that fast is exactly the kind of thing a detective writes down.',
            effects: [
              { stat: 'stress', delta: 6 },
              { stat: 'notoriety', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'pay',
        label: 'Pay for her order',
        outcomes: [
          {
            chance: 1,
            text: 'She lets you, then tells the cashier to note the time. You are not sure if that was a joke.',
            effects: [{ money: -15 }, { stat: 'happiness', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'crime2_alibi_request',
    kind: 'choice',
    category: 'crime',
    ages: [19, 55],
    weight: 6,
    cooldownYears: 8,
    adultsOnly: true,
    when: onTheWrongSide,
    bind: { pal: { role: 'friend', minAge: 18, minRelationship: 25 } },
    text: '{pal.first} calls late, talking too fast. If anyone asks, {pal.first} spent Thursday night at your place watching the match. {pal.They} {pal.is} not saying where {pal.they} really went.',
    choices: [
      {
        id: 'cover',
        label: 'Agree to cover',
        outcomes: [
          {
            chance: 1,
            text: 'You learn the score of a match you never saw. {pal.first} thanks you twice and hangs up before you can ask anything.',
            effects: [
              { rel: 'pal', delta: 10, memory: 'the Thursday you covered for them' },
              { stat: 'karma', delta: -4 },
              { stat: 'stress', delta: 5 },
            ],
            next: { eventId: 'crime2_alibi_unravels', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'ask',
        label: 'Ask what happened first',
        outcomes: [
          {
            chance: 0.5,
            text: 'It is smaller than you feared: a fight outside a pub, nobody badly hurt. You talk {pal.them} into handling it honestly.',
            effects: [
              { rel: 'pal', delta: 4, memory: 'the night you talked them down' },
              { stat: 'karma', delta: 4 },
            ],
          },
          {
            chance: 0.5,
            text: '{pal.first} goes silent, then says “forget I called.” The line clicks. Neither of you mentions it again, which says plenty.',
            effects: [{ rel: 'pal', delta: -8, memory: 'the alibi you wouldn’t give' }],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Refuse outright',
        outcomes: [
          {
            chance: 1,
            text: 'You tell {pal.first} you have spent enough nights in interview rooms for one lifetime. {pal.They} call{pal.s} you a coward and then, a week later, an idiot for being right.',
            effects: [
              { rel: 'pal', delta: -10, memory: 'the Thursday you said no' },
              { stat: 'karma', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'crime2_alibi_unravels',
    kind: 'choice',
    category: 'crime',
    ages: [21, 61],
    weight: 6,
    chainOnly: true,
    adultsOnly: true,
    when: notInPrison,
    bind: { pal: { role: 'friend', minAge: 18 } },
    text: 'A detective constable sits in your kitchen with a printout of phone records. They put {pal.first} three miles from your flat on that Thursday. She asks if you would like to revise anything.',
    choices: [
      {
        id: 'stick',
        label: 'Stick to the story',
        outcomes: [
          {
            chance: 0.45,
            success: true,
            text: 'You say the match was dull and the phone must be wrong. She closes her notebook. It stays open in your head for months.',
            effects: [
              { rel: 'pal', delta: 8, memory: 'how you held the line for them' },
              { stat: 'stress', delta: 10 },
            ],
          },
          {
            chance: 0.55,
            text: 'She has a second printout. The charge is lying to investigators, and it lands on you as well as {pal.first}.',
            effects: [
              { crime: 'fraud', arrest: true },
              { rel: 'pal', delta: 3, memory: 'going down together over Thursday' },
            ],
          },
        ],
      },
      {
        id: 'revise',
        label: 'Tell her the truth',
        outcomes: [
          {
            chance: 1,
            text: 'You admit you were alone that night. The constable thanks you. {pal.first} doesn’t, and changes {pal.their} number.',
            effects: [
              { rel: 'pal', delta: -25, memory: 'the day you took back the alibi' },
              { stat: 'karma', delta: 5 },
              { stat: 'stress', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'nothing',
        label: 'Ask for a lawyer and say nothing',
        outcomes: [
          {
            chance: 1,
            text: 'Silence is legal and expensive. Your lawyer earns a fee, the constable leaves, and {pal.first} owes you more than {pal.they} can repay.',
            effects: [
              { money: -2500 },
              { rel: 'pal', delta: 5, memory: 'the silence you kept for them' },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'crime2_neighbour_saw',
    kind: 'choice',
    category: 'crime',
    ages: [20, 58],
    weight: 5,
    cooldownYears: 7,
    adultsOnly: true,
    when: onTheWrongSide,
    text: 'Mr Okonedo from two doors down stops you by the bins. He was up late last month, he says, and saw you come home with someone else’s bag. He would hate for that to become a problem.',
    choices: [
      {
        id: 'pay',
        label: 'Ask what it would cost',
        requires: canAfford(2000),
        outcomes: [
          {
            chance: 1,
            text: 'It costs exactly what he says, and then, at Christmas, a little more. Blackmail turns out to be a subscription.',
            effects: [{ money: -2000 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'deny',
        label: 'Tell him he’s mistaken',
        outcomes: [
          {
            chance: oddsBy('looks', 0.5),
            success: true,
            text: 'You are calm and pleasant and slightly bored. By the end he is apologising for his eyesight.',
            effects: [{ stat: 'stress', delta: -2 }],
          },
          {
            chance: 0.4,
            text: 'He shrugs and mentions it to the community officer at the next residents’ meeting. Now the whole street waves at you carefully.',
            effects: [
              { stat: 'notoriety', delta: 5 },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'call',
        label: 'Call his bluff',
        outcomes: [
          {
            chance: 0.7,
            text: 'You tell him to go ahead and phone whoever he likes. He doesn’t. He also stops taking your bins in.',
            effects: [{ stat: 'stress', delta: 3 }],
          },
          {
            chance: 0.3,
            text: 'He does phone. The bag’s owner identifies it from a photo, and the questions after that are pointed.',
            effects: [{ crime: 'pickpocketing', arrest: true }],
          },
        ],
      },
    ],
  },
  {
    id: 'crime2_protection_money',
    kind: 'choice',
    category: 'crime',
    ages: [22, 60],
    weight: 5,
    cooldownYears: 8,
    adultsOnly: true,
    when: all(onTheWrongSide, hasJob),
    text: 'Two men in matching quilted jackets visit you at work. They know your history, they say, which makes you family. Family contributes an envelope every month.',
    choices: [
      {
        id: 'pay',
        label: 'Hand over the envelope',
        outcomes: [
          {
            chance: 1,
            text: 'The envelope gets thicker each month and the men get friendlier. You hate the friendliness most.',
            effects: [
              { money: -3000 },
              { stat: 'stress', delta: 7 },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Tell them you’re not family',
        outcomes: [
          {
            chance: 0.5,
            text: 'They look at each other and leave. Nothing happens for three weeks, which is its own kind of message.',
            effects: [{ stat: 'stress', delta: 8 }],
          },
          {
            chance: 0.5,
            text: 'They catch up with you in the car park one evening. It is brief, and it is a long time before your ribs forget it.',
            effects: [{ injury: 12 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'report',
        label: 'Report them to the police',
        outcomes: [
          {
            chance: 0.6,
            success: true,
            text: 'The officer is surprised someone with your record walked in voluntarily. The jackets stop coming round.',
            effects: [
              { stat: 'karma', delta: 6 },
              { stat: 'notoriety', delta: -4 },
              { performance: -3 },
            ],
          },
          {
            chance: 0.4,
            text: 'The police take a statement and do very little with it. The men hear you talked, and your workplace gets a broken window.',
            effects: [
              { stat: 'karma', delta: 4 },
              { stat: 'stress', delta: 10 },
              { performance: -6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'crime2_wrong_people_debt',
    kind: 'choice',
    category: 'crime',
    ages: [19, 55],
    weight: 5,
    cooldownYears: 9,
    adultsOnly: true,
    when: onTheWrongSide,
    text: 'An old debt resurfaces, and it has been sold on to people who don’t send letters. A pleasant voice on the phone says the balance has grown, and suggests ways you could help it shrink.',
    choices: [
      {
        id: 'pay',
        label: 'Pay it off in one go',
        requires: canAfford(8000),
        outcomes: [
          {
            chance: 1,
            success: true,
            text: 'You hand over most of your savings in a supermarket car park. The pleasant voice wishes you a lovely weekend.',
            effects: [{ money: -8000 }, { stat: 'stress', delta: -5 }],
          },
        ],
      },
      {
        id: 'favour',
        label: 'Do them a favour instead',
        outcomes: [
          {
            chance: 0.55,
            text: 'You collect a bag, deliver a bag, and do not look inside the bag. The debt is cleared. Your conscience is not.',
            effects: [
              { crime: 'drug_dealing' },
              { stat: 'karma', delta: -4 },
              { stat: 'stress', delta: 8 },
            ],
          },
          {
            chance: 0.45,
            text: 'Halfway across town a patrol car pulls you over for a broken tail light. The tail light is the least of it.',
            effects: [{ crime: 'drug_dealing', arrest: true }],
          },
        ],
      },
      {
        id: 'stall',
        label: 'Ask for more time',
        outcomes: [
          {
            chance: 0.5,
            text: 'The voice agrees, adds a number to the balance, and hangs up. You stop answering unknown calls.',
            effects: [{ money: -2500 }, { stat: 'stress', delta: 9 }],
          },
          {
            chance: 0.5,
            text: 'They send someone to explain what “more time” costs. The explanation is short and painful.',
            effects: [{ injury: 10 }, { money: -1500 }, { stat: 'stress', delta: 8 }],
          },
        ],
      },
    ],
  },
  {
    id: 'crime2_rival_rumours',
    kind: 'choice',
    category: 'crime',
    ages: [19, 58],
    weight: 6,
    cooldownYears: 6,
    adultsOnly: true,
    when: onTheWrongSide,
    bind: { rival: { role: 'enemy', minAge: 18 } },
    text: '{rival.first} has been telling anyone who will listen that you’ve gone back to your old ways. Half of it is invented. The other half is close enough to make you nervous.',
    choices: [
      {
        id: 'confront',
        label: 'Have it out face to face',
        outcomes: [
          {
            chance: 0.5,
            text: 'You tell {rival.first} in front of witnesses exactly what you think. {rival.They} back{rival.s} down, and the story dries up.',
            effects: [
              { rel: 'rival', delta: -5, memory: 'being called out in public' },
              { stat: 'happiness', delta: 5 },
            ],
          },
          {
            chance: 0.5,
            text: 'Voices rise, someone films it, and the clip makes you look exactly like the person {rival.first} described.',
            effects: [
              { rel: 'rival', delta: -8, memory: 'the shouting match on camera' },
              { stat: 'notoriety', delta: 6 },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Let your life answer it',
        outcomes: [
          {
            chance: 1,
            text: 'You turn up on time, pay your debts and say nothing. It is slow, and it works, mostly.',
            effects: [
              { stat: 'karma', delta: 4 },
              { stat: 'notoriety', delta: -3 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'return',
        label: 'Start a rumour of your own',
        outcomes: [
          {
            chance: 1,
            text: 'Your story about {rival.first} is better than {rival.their} story about you. Soon nobody believes either of you about anything.',
            effects: [
              { rel: 'rival', delta: -12, memory: 'the rumour war' },
              { stat: 'karma', delta: -5 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'crime2_inform_offer',
    kind: 'choice',
    category: 'crime',
    ages: [20, 58],
    weight: 5,
    once: true,
    adultsOnly: true,
    when: onTheWrongSide,
    text: 'A plain-clothes officer buys you a coffee you didn’t ask for. Some people you used to run with are on their radar, she says. Help her, and your own file could get much thinner.',
    choices: [
      {
        id: 'accept',
        label: 'Agree to talk',
        outcomes: [
          {
            chance: 0.65,
            success: true,
            text: 'You meet her in car parks and say as little as you can. Your file does get thinner; your circle gets smaller too.',
            effects: [
              { flag: 'informant' },
              { stat: 'notoriety', delta: -10 },
              { stat: 'stress', delta: 10 },
              { money: 1500 },
            ],
          },
          {
            chance: 0.35,
            text: 'Someone sees you getting into her car. Word travels the way it always does, and old friends stop meeting your eye.',
            effects: [
              { flag: 'informant' },
              { stat: 'notoriety', delta: -6 },
              { stat: 'happiness', delta: -8 },
              { stat: 'stress', delta: 12 },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Leave the coffee untouched',
        outcomes: [
          {
            chance: 1,
            text: 'She leaves a card on the table. You leave it there too, under the cup, where she can see it.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'notoriety', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'string',
        label: 'Feed her useless scraps',
        outcomes: [
          {
            chance: 0.5,
            text: 'You give her a name that is already in prison and a rumour that is already in the papers. She is not impressed but keeps calling.',
            effects: [{ stat: 'stress', delta: 6 }, { money: 500 }],
          },
          {
            chance: 0.5,
            text: 'She works out you’re wasting her time in about a week. Your next traffic stop takes a suspiciously long time.',
            effects: [
              { stat: 'notoriety', delta: 4 },
              { stat: 'stress', delta: 7 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'crime2_sibling_dragged',
    kind: 'choice',
    category: 'crime',
    ages: [20, 58],
    weight: 6,
    cooldownYears: 10,
    adultsOnly: true,
    when: onTheWrongSide,
    bind: { kin: { role: 'sibling', minAge: 18 } },
    text: '{kin.first} has started turning up with people you recognise from your worst years. {kin.They} {kin.has} new trainers, a new phone and a new habit of not answering questions.',
    choices: [
      {
        id: 'pull',
        label: 'Go and get them out',
        outcomes: [
          {
            chance: 0.55,
            success: true,
            text: 'You make one phone call to someone who still owes you. {kin.first} is quietly cut loose and furious about it. Gratitude can come later.',
            effects: [
              { rel: 'kin', delta: 6, memory: 'the time you pulled them out' },
              { stat: 'karma', delta: 6 },
              { stat: 'notoriety', delta: 2 },
            ],
          },
          {
            chance: 0.45,
            text: 'Your old crowd does not like being told what to do by someone who left. The conversation ends badly, and you limp home.',
            effects: [
              { injury: 9 },
              { rel: 'kin', delta: 10, memory: 'what you took for them' },
              { stat: 'karma', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'talk',
        label: 'Tell them your whole story',
        outcomes: [
          {
            chance: 0.5,
            text: 'You tell {kin.first} everything, including the parts you never told anyone. {kin.They} listen{kin.s} without looking at {kin.their} phone once.',
            effects: [
              { rel: 'kin', delta: 12, memory: 'the night you told them everything' },
              { stat: 'happiness', delta: 4 },
            ],
          },
          {
            chance: 0.5,
            text: '{kin.first} says you of all people don’t get to lecture. It is a fair point, and it still stings.',
            effects: [
              { rel: 'kin', delta: -6, memory: 'the lecture from you of all people' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Stay out of it',
        outcomes: [
          {
            chance: 1,
            text: 'You tell yourself {kin.first} is an adult and gets to make {kin.their} own mistakes. You check the court listings every week anyway.',
            effects: [
              { stat: 'stress', delta: 6 },
              { stat: 'karma', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
];
