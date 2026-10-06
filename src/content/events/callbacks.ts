import type { EventDef } from '../../engine/events/types';
import {
  all,
  canAfford,
  hasChildren,
  hasFlag,
  hasKidAged,
  isMarried,
  notInPrison,
  oddsBy,
} from './conditions';

const noChildren = (s: Parameters<typeof hasChildren>[0]): boolean => !hasChildren(s);

/** Old choices coming back years later: each event reads a flag an earlier event set. */
export const CALLBACK_EVENTS: EventDef[] = [
  {
    id: 'cb_playground_kept_promise',
    kind: 'choice',
    category: 'family',
    ages: [32, 70],
    weight: 8,
    once: true,
    when: all(hasFlag('wants_children'), hasChildren),
    bind: { kid: { role: 'child' } },
    text: 'You pass the playground where you once said, out loud and a little terrified, that you wanted children. Today {kid.first} is the one dragging you towards the swings.',
    choices: [
      {
        id: 'push',
        label: 'Push the swing as high as allowed',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} shrieks for "higher" until your arms ache. Somewhere a younger you, arguing about baby names, would be very pleased.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { rel: 'kid', delta: 6, memory: 'the swings at the old playground' },
            ],
          },
        ],
      },
      {
        id: 'tell',
        label: 'Tell {kid.first} what you decided here',
        outcomes: [
          {
            chance: 1,
            text: 'You explain that this bench is roughly where {kid.first} was first imagined. {kid.They} find{kid.s} this deeply embarrassing and ask to hear it again.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'stress', delta: -3 },
              { rel: 'kid', delta: 8, memory: 'the story of the playground bench' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cb_playground_still_waiting',
    kind: 'choice',
    category: 'family',
    adultsOnly: true,
    ages: [32, 55],
    weight: 7,
    once: true,
    when: all(hasFlag('wants_children'), noChildren),
    text: 'Years after that walk past the playground, when you said yes to children, the house is still quiet. The quiet is not empty, exactly; it just never became what you pictured.',
    choices: [
      {
        id: 'talk',
        label: 'Say it out loud to someone you trust',
        outcomes: [
          {
            chance: 1,
            text: 'You talk for an hour and cry for about four minutes of it. Plans change shape; that is not the same as failing.',
            effects: [
              { stat: 'stress', delta: -6 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'godparent',
        label: 'Offer to be a godparent to a friend’s baby',
        outcomes: [
          {
            chance: 1,
            text: 'You are given a tiny, furious person to hold at the ceremony. You will be the one who sends the excellent birthday presents.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'karma', delta: 3 },
              { flag: 'cb_godparent' },
            ],
          },
        ],
      },
      {
        id: 'let_be',
        label: 'Let it rest for now',
        outcomes: [
          {
            chance: 1,
            text: 'You water the plants, put on music and let the evening be an evening. Some questions keep without going off.',
            effects: [{ stat: 'stress', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'cb_child_free_lie_in',
    kind: 'choice',
    category: 'social',
    ages: [33, 72],
    weight: 8,
    once: true,
    when: hasFlag('child_free'),
    bind: { pal: { role: 'friend', minAge: 25 } },
    text: '{pal.first} rings at seven on a Saturday, hoarse from a toddler’s birthday party, and asks how your morning is going. You are still in bed, as agreed all those years ago on that walk past the playground.',
    choices: [
      {
        id: 'brag',
        label: 'Describe your croissant in detail',
        outcomes: [
          {
            chance: 1,
            text: '{pal.first} calls you a monster and laughs for the first time in a week. You promise to bring over a bag of croissants and stay for the chaos.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { rel: 'pal', delta: 4, memory: 'the croissant phone call' },
            ],
          },
        ],
      },
      {
        id: 'help',
        label: 'Get up and go help with the clean-up',
        outcomes: [
          {
            chance: 1,
            text: 'You spend the afternoon scraping icing off a ceiling, then drive home to total silence. Both halves of the day feel right.',
            effects: [
              { stat: 'karma', delta: 4 },
              { stat: 'happiness', delta: 3 },
              { rel: 'pal', delta: 9, memory: 'scraping icing off the ceiling together' },
            ],
          },
        ],
      },
      {
        id: 'trip',
        label: 'Book a last-minute trip instead',
        requires: canAfford(800),
        outcomes: [
          {
            chance: 1,
            text: 'By evening you are somewhere with a sea view and a bad map. The life you chose turns out to suit you rather well.',
            effects: [
              { money: -800 },
              { stat: 'happiness', delta: 8 },
              { stat: 'stress', delta: -5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cb_informant_favour',
    kind: 'choice',
    category: 'crime',
    adultsOnly: true,
    ages: [26, 70],
    weight: 8,
    once: true,
    when: all(hasFlag('informant'), notInPrison),
    text: 'A coffee arrives at your table that you did not order. It is the same plain-clothes officer from the car-park years, greyer now, with one more name she would like you to remember.',
    choices: [
      {
        id: 'one_more',
        label: 'Give her the name',
        outcomes: [
          {
            chance: 0.6,
            success: true,
            text: 'You say it quietly and she writes nothing down. She leaves an envelope and the impression that this really was the last time.',
            effects: [
              { money: 1000 },
              { stat: 'notoriety', delta: -4 },
              { stat: 'stress', delta: 6 },
              { stat: 'karma', delta: -2 },
            ],
          },
          {
            chance: 0.4,
            text: 'Word gets back, as it always does. A man you used to run with crosses the road when he sees you.',
            effects: [
              { stat: 'stress', delta: 10 },
              { stat: 'happiness', delta: -6 },
              { status: 'enemy' },
            ],
          },
        ],
      },
      {
        id: 'done',
        label: 'Tell her you are out of that life',
        outcomes: [
          {
            chance: 1,
            text: 'She studies you for a long moment, then nods and pays for both coffees. Being nobody’s source anymore feels like putting down a heavy bag.',
            effects: [
              { stat: 'stress', delta: -6 },
              { stat: 'discipline', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'leave',
        label: 'Walk out without a word',
        outcomes: [
          {
            chance: 1,
            text: 'You leave the coffee steaming. For a month you check every parked car, but nobody comes to collect.',
            effects: [
              { stat: 'stress', delta: 4 },
              { stat: 'notoriety', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cb_crew_bill_due',
    kind: 'choice',
    category: 'crime',
    adultsOnly: true,
    ages: [21, 65],
    weight: 8,
    once: true,
    when: all(hasFlag('back_with_crew'), notInPrison),
    text: 'The driver with the expensive watch, the one who kept your seat warm at the bus stop, needs somewhere to keep a few boxes. "Just till the weekend," he says. It was never just till the weekend.',
    choices: [
      {
        id: 'store',
        label: 'Take the boxes',
        outcomes: [
          {
            chance: 0.55,
            text: 'The boxes leave on Sunday, as promised, along with a thick envelope. You do not sleep well all week.',
            effects: [
              { money: 1800 },
              { stat: 'notoriety', delta: 6 },
              { stat: 'karma', delta: -5 },
              { stat: 'stress', delta: 8 },
            ],
          },
          {
            chance: 0.45,
            text: 'The weekend becomes three months. When they finally collect, half your garage goes with them and nobody apologises.',
            effects: [
              { money: -600 },
              { stat: 'notoriety', delta: 8 },
              { stat: 'stress', delta: 12 },
              { stat: 'happiness', delta: -5 },
            ],
          },
        ],
      },
      {
        id: 'quit',
        label: 'Tell him you are finished with all of it',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.55),
            success: true,
            text: 'He shrugs like it was always going to happen. You stop checking mirrors, slowly, over about a year.',
            effects: [
              { stat: 'karma', delta: 6 },
              { stat: 'stress', delta: -4 },
              { unflag: 'back_with_crew' },
            ],
          },
          {
            chance: 0.4,
            text: 'He takes it personally. Your car gets keyed twice, and your name stops opening any of the doors it used to.',
            effects: [
              { stat: 'stress', delta: 8 },
              { money: -400 },
              { status: 'enemy' },
              { unflag: 'back_with_crew' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cb_crew_driver_older',
    kind: 'notice',
    category: 'crime',
    ages: [24, 70],
    weight: 7,
    once: true,
    when: hasFlag('refused_crew'),
    text: 'In the local paper there is a photo of a man being led from court, and it takes you a moment to place him: the driver who once slowed beside your bus stop and offered you your old seat back.',
    outcomes: [
      {
        chance: 0.6,
        text: 'Three of the old crew are named in the article. You read it twice, then go and catch your bus, which is, for once, on time.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { stat: 'stress', delta: -4 },
          { stat: 'karma', delta: 2 },
        ],
      },
      {
        chance: 0.4,
        text: 'You expected to feel smug. Mostly you feel tired for him, and grateful for a nineteen-minute wait you still remember.',
        effects: [
          { stat: 'stress', delta: -2 },
          { stat: 'discipline', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'cb_release_plan_found',
    kind: 'choice',
    category: 'random',
    ages: [24, 64],
    weight: 9,
    once: true,
    when: hasFlag('release_plan'),
    text: 'A folded sheet falls out of an old coat: the plan you wrote on the back of your release papers. ID, bank account, job, address. Every line is ticked now, some in different pens.',
    choices: [
      {
        id: 'frame',
        label: 'Frame it and hang it in the hall',
        outcomes: [
          {
            chance: 1,
            text: 'Visitors assume it is a shopping list. You never correct them, and you touch the frame on your way out most mornings.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { stat: 'discipline', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'pass_on',
        label: 'Give it to someone just getting out',
        outcomes: [
          {
            chance: 1,
            text: 'You hand it to a lad at the support centre who has the same look you had. He reads it, then turns it over and starts his own list.',
            effects: [
              { stat: 'karma', delta: 8 },
              { stat: 'happiness', delta: 5 },
              { status: 'friend' },
            ],
          },
        ],
      },
      {
        id: 'new_list',
        label: 'Write a new plan on the other side',
        outcomes: [
          {
            chance: 1,
            text: 'This time the list says holiday, savings, learn to cook, call your mother. It looks almost doable, which is how the last one started.',
            effects: [
              { stat: 'discipline', delta: 5 },
              { stat: 'stress', delta: -3 },
              { skill: 'cooking', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cb_taking_care_checkup',
    kind: 'notice',
    category: 'health',
    ages: [55, 95],
    weight: 9,
    once: true,
    when: hasFlag('taking_care'),
    text: 'The same doctor who once took off her glasses before giving you bad news now leaves them on, scrolls through your results and raises her eyebrows in the good direction.',
    outcomes: [
      {
        chance: 0.7,
        text: 'All those dull vegetables and daily walks show up as numbers she calls "frankly annoying, in a good way." You celebrate with a very small slice of cake.',
        effects: [
          { stat: 'health', delta: 6 },
          { stat: 'happiness', delta: 6 },
          { stat: 'stress', delta: -4 },
        ],
      },
      {
        chance: 0.3,
        text: 'Some numbers are better and one is stubborn. She tells you to keep going, and for once you do not argue with a doctor.',
        effects: [
          { stat: 'health', delta: 3 },
          { stat: 'discipline', delta: 3 },
        ],
      },
    ],
  },
  {
    id: 'cb_bucket_list_reread',
    kind: 'choice',
    category: 'travel',
    ages: [55, 95],
    weight: 9,
    once: true,
    when: hasFlag('bucket_list'),
    text: 'The list you wrote at the kitchen table after that doctor’s appointment is stuck to the fridge, curling at the corners. Four items are crossed off. The fifth just says "learn to sail."',
    choices: [
      {
        id: 'go',
        label: 'Book the sailing course',
        requires: canAfford(3000),
        outcomes: [
          {
            chance: 0.7,
            success: true,
            text: 'By Friday you can tie four knots and tack without hitting anyone. You cross off item five with wet, triumphant hands.',
            effects: [
              { money: -3000 },
              { stat: 'happiness', delta: 12 },
              { stat: 'stress', delta: -6 },
            ],
          },
          {
            chance: 0.3,
            text: 'The wind refuses to blow for five days. You learn every knot in the book from a very sorry instructor and decide that counts as half.',
            effects: [{ money: -3000 }, { stat: 'happiness', delta: 4 }],
          },
        ],
      },
      {
        id: 'add',
        label: 'Add three new items to the bottom',
        outcomes: [
          {
            chance: 1,
            text: 'Learn to swim properly, eat a whole lobster, forgive your cousin. The list gets longer every year, which feels like the point.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'local',
        label: 'Do the cheapest item this afternoon',
        outcomes: [
          {
            chance: 1,
            text: 'Item nine is "eat chips on the pier in the rain." You manage it by four o’clock and get fully soaked, as intended.',
            effects: [
              { money: -10 },
              { stat: 'happiness', delta: 6 },
              { stat: 'health', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cb_railway_grandchild',
    kind: 'choice',
    category: 'family',
    ages: [62, 100],
    weight: 9,
    once: true,
    when: hasFlag('late_railway'),
    bind: { gk: { role: 'grandchild', minAge: 4, maxAge: 13 } },
    text: '{gk.first} has discovered the model railway, the one with the strong opinions about sheep, and is lying flat on the carpet watching the train come round the bend, completely silent.',
    choices: [
      {
        id: 'controls',
        label: 'Hand over the controls',
        outcomes: [
          {
            chance: 0.6,
            text: '{gk.first} runs the express at full speed into the station and you say nothing at all. It is the most patient you have ever been.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { rel: 'gk', delta: 10, memory: 'driving the train in the spare room' },
            ],
          },
          {
            chance: 0.4,
            text: 'A derailment takes out the viaduct and two sheep. {gk.first} looks stricken; you declare it a scheduled disaster drill.',
            effects: [
              { money: -60 },
              { stat: 'happiness', delta: 5 },
              { rel: 'gk', delta: 8, memory: 'the great viaduct derailment' },
            ],
          },
        ],
      },
      {
        id: 'build',
        label: 'Let {gk.first} design a new station',
        outcomes: [
          {
            chance: 1,
            text: 'The new station is mostly a dinosaur enclosure with a ticket office. You build it exactly to plan, and it is the best thing on the layout.',
            effects: [
              { skill: 'art', delta: 2 },
              { stat: 'happiness', delta: 7 },
              { rel: 'gk', delta: 12, memory: 'building the dinosaur station together' },
            ],
          },
        ],
      },
      {
        id: 'rules',
        label: 'Explain the timetable first',
        outcomes: [
          {
            chance: 1,
            text: 'Twenty minutes into the history of signal boxes, {gk.first} is asleep on the carpet. You run the evening service very quietly.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'gk', delta: 2, memory: 'the very long timetable lecture' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cb_memoir_archive',
    kind: 'choice',
    category: 'random',
    ages: [67, 105],
    weight: 8,
    once: true,
    when: hasFlag('memoir'),
    text: 'The local history society has heard about the life story you put together from those forty years of photo albums. Their secretary asks, very politely, whether they could keep a copy in the archive.',
    choices: [
      {
        id: 'donate',
        label: 'Give them a copy',
        outcomes: [
          {
            chance: 1,
            text: 'You are catalogued between a parish map and a box of ration books. A schoolteacher writes to say her class loved the chapter about your first job.',
            effects: [{ stat: 'happiness', delta: 8 }, { stat: 'karma', delta: 3 }, { fame: 1 }],
          },
        ],
      },
      {
        id: 'talk',
        label: 'Offer to give a talk instead',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.6),
            success: true,
            text: 'Thirty people in a cold hall laugh in all the right places, and one man in the front row turns out to be in a photograph from 1974.',
            effects: [{ stat: 'happiness', delta: 9 }, { status: 'friend' }],
          },
          {
            chance: 0.3,
            text: 'You lose your place twice and the slide projector eats a photograph. Everyone is very kind about it, which is somehow worse.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'private',
        label: 'Keep it for the family',
        outcomes: [
          {
            chance: 1,
            text: 'You thank them and decline. Some of those people in the albums would not want strangers knowing their haircuts.',
            effects: [{ stat: 'stress', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'cb_memoir_school_project',
    kind: 'choice',
    category: 'family',
    ages: [70, 105],
    weight: 9,
    once: true,
    when: hasFlag('sr2_memoir_written'),
    bind: { gk: { role: 'grandchild', minAge: 10, maxAge: 18 } },
    text: '{gk.first} has a school project on family history and has quietly read both of your memoir notebooks, including, it turns out, the chapters you wrote with the door closed.',
    choices: [
      {
        id: 'answer',
        label: 'Answer every question honestly',
        outcomes: [
          {
            chance: 1,
            text: 'The questions are sharp and you answer them straight. {gk.first} gets top marks and, more importantly, looks at you differently afterwards.',
            effects: [
              { stat: 'stress', delta: -3 },
              { stat: 'karma', delta: 3 },
              { rel: 'gk', delta: 12, memory: 'the honest answers for the school project' },
            ],
          },
        ],
      },
      {
        id: 'light',
        label: 'Steer the project to the funny chapters',
        outcomes: [
          {
            chance: 1,
            text: 'The project ends up being mostly about a runaway goat at a wedding. The teacher gives it a merit and asks to meet the goat.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { rel: 'gk', delta: 6, memory: 'the school project about the goat' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cb_memoir_bull_doubts',
    kind: 'choice',
    category: 'family',
    ages: [70, 105],
    weight: 9,
    once: true,
    when: hasFlag('sr2_memoir_embellished'),
    bind: { gk: { role: 'grandchild', minAge: 10 } },
    text: '{gk.first} has been fact-checking your memoir. The town where you famously outran a bull, {gk.they} point{gk.s} out, has kept careful farm records since 1890 and never once owned a bull.',
    choices: [
      {
        id: 'confess',
        label: 'Admit you improved on the truth',
        outcomes: [
          {
            chance: 1,
            text: '{gk.first} is delighted, not disappointed. Together you mark every embellishment in red, and the annotated edition becomes the family favourite.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'happiness', delta: 5 },
              { rel: 'gk', delta: 10, memory: 'the red-pen edition of your memoir' },
            ],
          },
        ],
      },
      {
        id: 'double',
        label: 'Insist it was a visiting bull',
        outcomes: [
          {
            chance: 1,
            text: 'You describe the visiting bull in such loving detail that {gk.first} gives up and starts believing it. Nobody asks about the minor royal.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'karma', delta: -1 },
              { rel: 'gk', delta: 4, memory: 'the story of the visiting bull' },
            ],
          },
        ],
      },
      {
        id: 'sequel',
        label: 'Announce a second volume',
        outcomes: [
          {
            chance: 1,
            text: 'Volume two features a hot-air balloon and a duel. {gk.first} offers to be your editor, mostly to keep you within sight of the facts.',
            effects: [
              { skill: 'writing', delta: 2 },
              { stat: 'happiness', delta: 6 },
              { rel: 'gk', delta: 6, memory: 'editing your second volume' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cb_juvenile_teacher_again',
    kind: 'choice',
    category: 'social',
    ages: [24, 60],
    weight: 8,
    once: true,
    when: hasFlag('juvenile_warning'),
    text: 'In the supermarket queue you recognise the teacher who once wrote your name in the school incident book and phoned your parents. They recognise you too, slightly too fast.',
    choices: [
      {
        id: 'apologise',
        label: 'Apologise for the kid you were',
        outcomes: [
          {
            chance: 1,
            text: 'They laugh and say they have seen far worse since. Then, gently, that they always thought you would turn out all right.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'karma', delta: 4 },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'pretend',
        label: 'Study the chewing gum until they leave',
        outcomes: [
          {
            chance: 1,
            text: 'You read every flavour twice. When you look up they are gone, and you are a grown adult, hiding behind mints.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'boast',
        label: 'Mention, casually, how well you are doing',
        outcomes: [
          {
            chance: 0.5,
            text: 'They seem genuinely pleased, which takes the wind out of your speech. You end up carrying their shopping to the car.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'karma', delta: 2 },
            ],
          },
          {
            chance: 0.5,
            text: '"Good for you," they say, in exactly the voice from the head teacher’s office. You are fifteen again for the whole drive home.',
            effects: [
              { stat: 'stress', delta: 4 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cb_affair_late_again',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [30, 75],
    weight: 7,
    once: true,
    when: all(hasFlag('had_affair'), isMarried),
    bind: { sp: { role: 'spouse', minAge: 18 } },
    text: 'You hear yourself telling {sp.first} you will be working late, and this time it is simply true. The words still taste of the evenings that started with one drink with a colleague.',
    choices: [
      {
        id: 'home',
        label: 'Leave the work and go home anyway',
        outcomes: [
          {
            chance: 1,
            text: 'You walk in at six with groceries. {sp.first} is surprised, then pleased, and you cook together without anyone mentioning why it matters.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'stress', delta: -3 },
              { rel: 'sp', delta: 6, memory: 'the night you came home early' },
            ],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Stay late and text a photo of your desk',
        outcomes: [
          {
            chance: 1,
            text: 'A photo of a spreadsheet and a cold coffee. {sp.first} replies with a thumbs-up. Proof is a strange thing to feel you owe.',
            effects: [
              { stat: 'stress', delta: 4 },
              { rel: 'sp', delta: 1, memory: 'the photo of your desk' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cb_bike_own_child',
    kind: 'choice',
    category: 'family',
    ages: [24, 60],
    weight: 9,
    once: true,
    when: all(hasFlag('kid2_rides_bike'), hasKidAged(4, 9)),
    bind: { kid: { role: 'child', maxAge: 9, minAge: 4 } },
    text: 'The stabilisers come off {kid.first}’s bike and you find yourself jogging behind, holding the saddle, making the exact promise your father once made to you in the park.',
    choices: [
      {
        id: 'let_go',
        label: 'Let go when the moment is right',
        outcomes: [
          {
            chance: 0.65,
            success: true,
            text: '{kid.first} glides away, realises you are twenty metres back, and is furious. You finally understand your father completely.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { rel: 'kid', delta: 6, memory: 'learning to ride when you let go' },
            ],
          },
          {
            chance: 0.35,
            text: 'The moment was not right. {kid.first} meets a hedge, comes out leafy and outraged, and wants a plaster for each knee.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { rel: 'kid', delta: 2, memory: 'the hedge on the first bike ride' },
            ],
          },
        ],
      },
      {
        id: 'hold',
        label: 'Keep your promise and never let go',
        outcomes: [
          {
            chance: 1,
            text: 'You jog the whole park twice without letting go. {kid.first} is thrilled; your knees file a formal complaint.',
            effects: [
              { stat: 'health', delta: 1 },
              { stat: 'stress', delta: -2 },
              { rel: 'kid', delta: 8, memory: 'the time you never let go of the saddle' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cb_biker_jacket_grandchild',
    fromYear: 2008,
    kind: 'choice',
    category: 'random',
    ages: [55, 90],
    weight: 8,
    once: true,
    when: hasFlag('mid2_biker'),
    text: 'The cherry-red motorbike from the Calder Road dealership still lives in the garage, under a sheet, beside a leather jacket that has given up pretending to fit.',
    choices: [
      {
        id: 'ride',
        label: 'Take it out one more time',
        outcomes: [
          {
            chance: oddsBy('health', 0.6),
            success: true,
            text: 'It starts on the second try. You ride to the coast at a dignified forty and buy an ice cream that tastes like being fifty again.',
            effects: [
              { stat: 'happiness', delta: 9 },
              { stat: 'stress', delta: -4 },
            ],
          },
          {
            chance: 0.3,
            text: 'It starts, you do not quite stop. A low wall and a bruised hip later, you agree the bike might be retired.',
            effects: [{ injury: 5 }, { stat: 'happiness', delta: -2 }],
          },
        ],
      },
      {
        id: 'restore',
        label: 'Restore it properly',
        requires: canAfford(1200),
        outcomes: [
          {
            chance: 1,
            text: 'A winter of oily fingers and online forums later, it shines like the day you first walked past it eleven times.',
            effects: [
              { money: -1200 },
              { stat: 'happiness', delta: 7 },
              { skill: 'art', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'sell',
        label: 'Sell it to a younger fool',
        outcomes: [
          {
            chance: 1,
            text: 'A wide-eyed forty-nine-year-old hands over cash. You recognise the look exactly and wish him well.',
            effects: [{ money: 4000 }, { stat: 'happiness', delta: 1 }, { unflag: 'mid2_biker' }],
          },
        ],
      },
    ],
  },
  {
    id: 'cb_civilian_service_care_home',
    kind: 'choice',
    category: 'social',
    ages: [28, 68],
    weight: 8,
    once: true,
    when: hasFlag('civilian_service'),
    text: 'A letter forwarded three times reaches you: the care home where you did your civilian service instead of the army is closing, and they are inviting everyone who ever worked there to a farewell tea.',
    choices: [
      {
        id: 'go',
        label: 'Go to the farewell tea',
        outcomes: [
          {
            chance: 1,
            text: 'The residents you knew are long gone, but a nurse remembers you as "the one who did the voices." You do the voices. People cry, in the good way.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { stat: 'karma', delta: 3 },
              { status: 'friend' },
            ],
          },
        ],
      },
      {
        id: 'volunteer',
        label: 'Sign up to volunteer somewhere new',
        outcomes: [
          {
            chance: 1,
            text: 'You start Thursday afternoons at another home across town. It turns out the knack never left you.',
            effects: [
              { stat: 'karma', delta: 7 },
              { stat: 'happiness', delta: 5 },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'donate',
        label: 'Send a donation and a card',
        requires: canAfford(200),
        outcomes: [
          {
            chance: 1,
            text: 'You write a card about the year you were adored by everyone over ninety. It is pinned on the noticeboard until the very last day.',
            effects: [
              { money: -200 },
              { stat: 'karma', delta: 4 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
];
