import type { TownInfo } from '../types';

/**
 * Slovenia town by town, as the people who grew up there would describe it. Keyed by the
 * names in slovenia.ts `cities`. Regions are the traditional ones locals use, with
 * Osrednjeslovenska for the capital and its ring, Savinjska for the Celje basin and its
 * valleys, Obala for the three coastal towns and Primorska for the Karst.
 */
export const SLOVENIA_TOWNS: Record<string, TownInfo> = {
  Ljubljana: {
    region: 'Osrednjeslovenska',
    size: 'capital',
    population: 285000,
    tags: ['capital', 'university', 'river', 'historic'],
    blurb:
      "A capital small enough to cross by bicycle in twenty minutes, all Baroque fronts, café terraces and Plečnik's bridges along the slow green Ljubljanica.",
    landmarks: ['the Triple Bridge', 'Ljubljana Castle', 'the Dragon Bridge', 'Tivoli Park'],
    food: 'kranjska klobasa',
    river: 'Ljubljanica',
    famous: 'Jože Plečnik, the architect who was born here and remade its riverbanks',
    quirk:
      'On any sunny day half the city seems to be drinking coffee beside the Ljubljanica, and the dragons on the Dragon Bridge are said to wag their tails when a virgin walks across.',
    housing: 1.6,
  },
  Maribor: {
    region: 'Štajerska',
    size: 'city',
    population: 97000,
    tags: ['university', 'wine', 'river', 'ski', 'industrial'],
    blurb:
      "Slovenia's second city spreads along the Drava under the green wall of Pohorje, with the oldest grapevine in the world still fruiting on a house front in Lent.",
    landmarks: [
      'the Old Vine House in Lent',
      'the Water Tower on the Drava',
      'the slopes of Pohorje',
      'the Plague Column on the Main Square',
    ],
    food: 'pohorska omleta',
    river: 'Drava',
    famous: 'Anton Martin Slomšek, the bishop who moved his see here and made it a Slovene town',
    quirk:
      'Every summer Festival Lent fills the riverbank with stages for two weeks, and people from Maribor will tell you, with feeling, that their city is not a smaller Ljubljana.',
    housing: 0.95,
  },
  Celje: {
    region: 'Savinjska',
    size: 'city',
    population: 38000,
    tags: ['historic', 'river', 'industrial'],
    blurb:
      'The town of the Counts of Celje, the medieval family whose three gold stars are still on the national coat of arms, under the ruins of the biggest castle in Slovenia.',
    landmarks: [
      'the Old Castle of Celje',
      'the Princely Court museum',
      'the painted Celje Ceiling in the Old Counts’ Mansion',
    ],
    food: 'štajerska kisla juha',
    river: 'Savinja',
    famous: 'Alma Karlin, the writer who was born here and set off alone around the world',
    quirk:
      'The three gold stars of the Counts of Celje are on the Slovenian flag, and someone from Celje will point this out every single time the flag appears on television.',
    housing: 0.95,
  },
  Kranj: {
    region: 'Gorenjska',
    size: 'city',
    population: 38000,
    tags: ['historic', 'river', 'industrial'],
    blurb:
      "Gorenjska's capital stands on a rock spur where the Kokra cuts a deep canyon down to the Sava, with France Prešeren buried in the park among the old graves.",
    landmarks: [
      'the Kokra canyon',
      "Prešeren's grave in the Prešeren Grove",
      'the wartime tunnels under the old town',
      'the Prešeren House',
    ],
    food: 'ajdovi žganci',
    river: 'Kokra',
    famous: 'France Prešeren, who spent his last years here and is buried here',
    quirk:
      'A network of air-raid tunnels dug in the Second World War runs under the old town, and every child in Kranj gets taken down into them at least once.',
    housing: 1.1,
  },
  Koper: {
    region: 'Obala',
    size: 'city',
    population: 26000,
    tags: ['coast', 'historic', 'university', 'minority', 'border', 'industrial'],
    blurb:
      "The country's port town, once an island, packs a Venetian old town around Tito Square beside the cranes of the only cargo harbour Slovenia has.",
    landmarks: [
      'Tito Square and the Praetorian Palace',
      'the Da Ponte fountain',
      'the cathedral bell tower',
      'the Semedela promenade',
    ],
    food: 'istrski fuži',
    famous:
      'Santorio Santorio, the Renaissance physician born here who weighed himself for science',
    quirk:
      'Koper is officially bilingual, so the street signs give the Italian name, Capodistria, under the Slovene one, and older neighbours switch languages mid-sentence.',
    housing: 1.4,
  },
  Velenje: {
    region: 'Savinjska',
    size: 'city',
    population: 25000,
    tags: ['mining', 'industrial', 'lake'],
    blurb:
      'A town built almost from scratch in the 1950s for the coal miners, all wide lawns and modernist blocks, beside a lake that filled the hollow where the ground sank over the mine.',
    landmarks: [
      'Velenje Lake',
      'the Coal Mining Museum of Slovenia',
      'Velenje Castle',
      'the giant Tito statue on the main square',
    ],
    food: 'pohani piščanec',
    river: 'Paka',
    quirk:
      'From 1981 until 1990 the town was officially Titovo Velenje, and the giant statue of Tito on the square never moved.',
    housing: 0.8,
  },
  'Novo mesto': {
    region: 'Dolenjska',
    size: 'city',
    population: 24000,
    tags: ['river', 'wine', 'industrial', 'historic'],
    blurb:
      "Dolenjska's capital sits on a tight bend of the green Krka, with cviček vineyards on every hill around it and a car factory on the edge of town.",
    landmarks: [
      'the Kandija bridge over the Krka',
      'the Chapter Church of St Nicholas',
      'the arcaded Main Square',
      'the Dolenjska Museum and its Iron Age situlae',
    ],
    food: 'štruklji',
    river: 'Krka',
    famous: 'Božidar Jakac, the painter who was born here',
    quirk:
      'Novo mesto calls itself the city of situlae, after the bronze Iron Age buckets dug up on its hills, and everyone drinks cviček, the light red wine that Dolenjska swears by.',
    housing: 0.9,
  },
  Ptuj: {
    region: 'Štajerska',
    size: 'town',
    population: 17000,
    tags: ['historic', 'wine', 'river'],
    blurb:
      'The oldest town in Slovenia, Roman Poetovio, climbs from the Drava to its castle, with wine cellars under the streets and kurenti stamping through every carnival.',
    landmarks: [
      'Ptuj Castle',
      'the old wine cellar under the town',
      'the Orpheus Monument',
      'the town tower',
    ],
    food: 'pustni krofi',
    river: 'Drava',
    quirk:
      'At Kurentovanje, the carnival, hundreds of kurenti in sheepskins, horned masks and cowbells chase winter out of town, and Ptuj families argue about whose grandfather wore the best one.',
    housing: 0.85,
  },
  Trbovlje: {
    region: 'Zasavje',
    size: 'town',
    population: 14000,
    tags: ['mining', 'industrial'],
    blurb:
      'A proud red coal town in a narrow Zasavje valley, under the tallest chimney in Europe at the power station down by the Sava.',
    landmarks: [
      'the 360-metre power station chimney',
      'the Delavski dom',
      'Kum, the hill above the valley',
    ],
    food: 'ričet',
    famous: 'Laibach, the band that formed here in 1980 and scandalised Yugoslavia',
    quirk:
      'The miners’ greeting, Srečno, is still how half of Trbovlje says goodbye, years after the last coal came up.',
    housing: 0.65,
  },
  Kamnik: {
    region: 'Gorenjska',
    size: 'town',
    population: 14000,
    tags: ['historic', 'alpine', 'river'],
    blurb:
      "A medieval town under the Kamnik Alps, with a little castle on a rock in the middle of the old streets and Velika planina's herdsmen's huts up on the plateau above.",
    landmarks: [
      'Velika planina',
      'the Small Castle',
      'the Volčji Potok arboretum',
      'the source of the Kamniška Bistrica',
    ],
    food: 'trnič',
    river: 'Kamniška Bistrica',
    famous: 'Rudolf Maister, the general who was born here and won Maribor for Slovenia in 1918',
    quirk:
      'Herdsmen on Velika planina still spend the summer in oval huts with shingle roofs reaching almost to the ground, and they stamp their little trnič cheeses with patterns that were once given as love tokens.',
    housing: 1.2,
  },
  Jesenice: {
    region: 'Gorenjska',
    size: 'town',
    population: 13000,
    tags: ['industrial', 'border', 'alpine', 'river'],
    blurb:
      'A steel town strung along the Sava under the Karawanks, where the ironworks made the place and ice hockey made it famous.',
    landmarks: ['the old ironworks', 'the Podmežakla ice hall', 'the daffodil meadows of Golica'],
    food: 'ričet',
    river: 'Sava',
    quirk:
      'Each May the meadows of Golica above town turn white with wild daffodils, and the steelworkers’ grandchildren hike up to see them.',
    housing: 0.75,
  },
  'Nova Gorica': {
    region: 'Goriška',
    size: 'town',
    population: 13000,
    tags: ['border', 'wine', 'river', 'university'],
    blurb:
      'A town built from nothing after 1947 when the new border cut it off from Gorizia, with a square at the old Transalpina station that is half in one country and half in the other.',
    landmarks: [
      'the Transalpina square on the border',
      'the Kostanjevica monastery',
      'Sveta Gora above the valley',
      'the Solkan Bridge',
    ],
    food: 'cherries from the Brda hills',
    river: 'Soča',
    quirk:
      'In 2025 Nova Gorica and Gorizia were European Capital of Culture together, one capital spread across two countries.',
    housing: 1.05,
  },
  Domžale: {
    region: 'Osrednjeslovenska',
    size: 'town',
    population: 13000,
    tags: ['industrial', 'river'],
    blurb:
      'A busy town on the road north of Ljubljana that grew prosperous on straw hats, once plaited at kitchen tables all across the valley.',
    landmarks: ['the Straw Hat Museum', 'the riverside path along the Kamniška Bistrica'],
    food: 'potica',
    river: 'Kamniška Bistrica',
    quirk:
      'In the 1800s the villages around Domžale plaited straw hats by the hundred thousand and shipped them as far as America.',
    housing: 1.25,
  },
  'Škofja Loka': {
    region: 'Gorenjska',
    size: 'town',
    population: 12000,
    tags: ['historic', 'river'],
    blurb:
      'A thousand-year-old town, one of the best-kept in the country, where the two Sora rivers meet under the castle and the old square has barely changed in centuries.',
    landmarks: [
      'Loka Castle',
      'the Capuchin Bridge',
      'the old town square',
      'the Capuchin monastery library',
    ],
    food: 'loški kruhki',
    river: 'Sora',
    famous: 'Ivan Tavčar, who wrote its valleys and its old families into his novels',
    quirk:
      'The Škofja Loka Passion, the oldest surviving play in Slovene, is staged in the streets every few years, with hundreds of locals in costume and a good few on horseback.',
    housing: 1.15,
  },
  'Murska Sobota': {
    region: 'Prekmurje',
    size: 'town',
    population: 11000,
    tags: ['farming'],
    blurb:
      "Prekmurje's capital, flat as a table, ringed by fields of pumpkins and maize and a short bike ride from the floodplain forests of the Mura.",
    landmarks: [
      'the Sobota castle and its park',
      'the floating mill on the Mura',
      'the Pomurje Museum',
    ],
    food: 'prekmurska gibanica',
    river: 'Mura',
    quirk:
      'People here speak prekmurščina, a dialect so different that for centuries it had its own books and hymnals, and storks nest on the chimneys every spring.',
    housing: 0.65,
  },
  Izola: {
    region: 'Obala',
    size: 'town',
    population: 11000,
    tags: ['coast', 'minority', 'historic'],
    blurb:
      'A fishing town on what was once an island, with a working harbour, painted boats, and the best fish on the coast according to everyone from Izola.',
    landmarks: ['the old fishing harbour', 'the Besenghi Palace', 'Simon’s Bay'],
    food: 'fried sardines',
    quirk:
      'Izola is Isola in Italian, the island, and it really was one until the channel was filled in about two hundred years ago.',
    housing: 1.35,
  },
  Piran: {
    region: 'Obala',
    size: 'small town',
    population: 3800,
    tags: ['coast', 'historic', 'minority'],
    blurb:
      'A Venetian town on the tip of a narrow peninsula, with oval Tartini Square, a bell tower copied from St Mark’s, and the sea on three sides.',
    landmarks: [
      'Tartini Square',
      "St George's Church and its bell tower",
      'the town walls above the rooftops',
      'the Sečovlje salt pans',
    ],
    food: 'grilled squid',
    famous: 'Giuseppe Tartini, the violinist and composer who was born here',
    quirk:
      'The Sečovlje salt pans south of town are still worked by hand the medieval way, and the salt flower skimmed off the top sells for a small fortune.',
    housing: 1.5,
  },
  Postojna: {
    region: 'Notranjska',
    size: 'town',
    population: 9500,
    tags: ['karst'],
    blurb:
      "A karst town sitting on top of one of Europe's great cave systems, where a little train runs visitors kilometres into the hill.",
    landmarks: ['Postojna Cave', 'Predjama Castle in its cliff', 'the Pivka cave', 'Sovič hill'],
    food: 'ričet',
    river: 'Pivka',
    famous: 'Erazem of Predjama, the robber knight who held out in the cliff castle down the road',
    quirk:
      'The olm, the blind pale salamander of the caves, can live for a century and go for years without eating, and every child in Postojna can tell you so.',
    housing: 0.9,
  },
  Bled: {
    region: 'Gorenjska',
    size: 'small town',
    population: 5000,
    tags: ['lake', 'alpine', 'historic'],
    blurb:
      'A lake the colour of bottle glass, a church on a tiny island and a castle on a cliff, with the Julian Alps standing behind it all like a backdrop.',
    landmarks: ['the island church', 'Bled Castle', 'the Vintgar gorge', 'Straža hill'],
    food: 'kremšnita',
    quirk:
      'The cream cake has been made to the same recipe since the 1950s, and the pletna boatmen who row to the island come from local families who have done it for generations.',
    housing: 1.3,
  },
  Kočevje: {
    region: 'Dolenjska',
    size: 'town',
    population: 8000,
    tags: ['forest', 'river'],
    blurb:
      'A town ringed by some of the wildest forest in Europe, home to brown bears and to the lost villages the Gottschee Germans left behind in 1941.',
    landmarks: ['the Rajhenav virgin forest', 'the forests of Kočevski Rog', 'Kočevje Lake'],
    food: 'gobova juha',
    river: 'Rinža',
    quirk:
      'For six centuries German-speaking Gottscheers farmed here, and deep in the forest you can still find the overgrown churchyards of their villages.',
    housing: 0.65,
  },
  'Slovenj Gradec': {
    region: 'Koroška',
    size: 'town',
    population: 7500,
    tags: ['historic', 'river', 'forest'],
    blurb:
      'A small, cultured town on the Mislinja between Pohorje and Uršlja gora, a United Nations Messenger of Peace city with a gallery that brings the art of the world to Koroška.',
    landmarks: [
      'the Koroška Gallery of Fine Arts',
      'the Church of St Elizabeth on the old town square',
      'Uršlja gora',
      'the house where Hugo Wolf was born',
    ],
    food: 'koroški krapi',
    river: 'Mislinja',
    famous: 'Hugo Wolf, the composer who was born here',
    quirk:
      'Since 1989 it has carried the United Nations title of Messenger of Peace, and people from Slovenj Gradec mention it about as often as people from Celje mention the stars.',
    housing: 0.75,
  },
  Ajdovščina: {
    region: 'Goriška',
    size: 'town',
    population: 6500,
    tags: ['wine', 'historic'],
    blurb:
      'A Vipava valley town built inside the walls of a Roman fort, where the burja comes down off the plateau hard enough to tip over lorries.',
    landmarks: [
      'the Roman towers of Castra',
      'the Pilon Gallery',
      'the spring of the Hubelj',
      'the Nanos plateau',
    ],
    food: 'jota',
    river: 'Hubelj',
    famous: 'Veno Pilon, the painter who was born here',
    quirk:
      'When the burja blows the road through the valley is closed to lorries and caravans, and old roofs here have stones laid on the tiles to keep them on.',
    housing: 0.95,
  },
  Brežice: {
    region: 'Posavje',
    size: 'town',
    population: 6800,
    tags: ['river', 'border', 'spa', 'wine'],
    blurb:
      'A border town near where the Krka runs into the Sava, with a castle full of Baroque frescoes and the hot springs of Čatež just across the river.',
    landmarks: [
      'Brežice Castle and its Knights’ Hall',
      'the old water tower',
      'the Čatež hot springs',
      'the sand cellars of Bizeljsko',
    ],
    food: 'krvavice with sauerkraut',
    river: 'Sava',
    quirk:
      'Up in Bizeljsko the farmers keep their wine in repnice, little caves dug by hand into soft quartz sand.',
    housing: 0.8,
  },
  Krško: {
    region: 'Posavje',
    size: 'town',
    population: 7000,
    tags: ['industrial', 'river'],
    blurb:
      'A Sava valley town best known for the country’s only nuclear power station and for a speedway track that fills on race nights.',
    landmarks: ['Rajhenburg Castle', 'the Matija Gubec speedway stadium', 'the Sava riverbank'],
    food: 'štruklji',
    river: 'Sava',
    famous: 'Janez Vajkard Valvasor, the great scholar of Carniola, who spent his last years here',
    quirk:
      'The nuclear plant is owned half by Slovenia and half by Croatia, a leftover of Yugoslavia that the two countries still run together.',
    housing: 0.8,
  },
  Sežana: {
    region: 'Primorska',
    size: 'town',
    population: 6000,
    tags: ['karst', 'border', 'wine'],
    blurb:
      'The main town of the Karst, a stone plateau of red earth, dry walls and teran vineyards, a few minutes from Trieste and from the white horses of Lipica.',
    landmarks: [
      'the Lipica stud farm',
      'the Škocjan Caves',
      'the Sežana botanical garden',
      'the Vilenica cave',
    ],
    food: 'kraški pršut',
    famous: 'Srečko Kosovel, the poet of the Karst, who was born here',
    quirk:
      'Teran, the Karst wine, is so dark it is almost black, and grandparents here will tell you a glass a day is better than anything the doctor gives you.',
    housing: 1.0,
  },
  Idrija: {
    region: 'Goriška',
    size: 'town',
    population: 5800,
    tags: ['mining', 'historic', 'river'],
    blurb:
      'A mercury-mining town in a deep green valley, where the mine ran for five hundred years and the women made bobbin lace while the men were underground.',
    landmarks: [
      "Anthony's Shaft in the old mine",
      'Gewerkenegg Castle',
      'the Kamšt water wheel',
      'the Idrija klavže dams',
    ],
    food: 'idrijski žlikrofi',
    river: 'Idrijca',
    quirk:
      'Idrija lace is made by hand on bobbins, and the town has kept a lace school running since 1876.',
    housing: 0.75,
  },
  Tolmin: {
    region: 'Goriška',
    size: 'small town',
    population: 3300,
    tags: ['alpine', 'river'],
    blurb:
      'A mountain town where the Tolminka meets the Soča, known for its gorges, its cheese, and the music festivals that fill the riverbank every summer.',
    landmarks: [
      'the Tolmin Gorges',
      "the Devil's Bridge",
      'the meeting of the Soča and the Tolminka',
      'Kozlov rob castle hill',
    ],
    food: 'tolminc',
    river: 'Soča',
    quirk:
      'In the Tolmin Gorges a boulder wedged between the cliffs is called the Bear’s Head, and the meeting of the two rivers is the lowest point of the Triglav National Park.',
    housing: 0.85,
  },
  Kobarid: {
    region: 'Goriška',
    size: 'small town',
    population: 1200,
    tags: ['alpine', 'river', 'historic', 'border'],
    blurb:
      'A small town in the Soča valley with a big history: the front line of the First World War, and the 1917 breakthrough the Italians still call Caporetto.',
    landmarks: [
      'the Kobarid Museum of the First World War',
      'the Italian Charnel House on St Anthony’s hill',
      'the Kozjak waterfall',
      'the Napoleon Bridge over the Soča',
    ],
    food: 'kobariški štruklji',
    river: 'Soča',
    famous: 'Ernest Hemingway, who set part of A Farewell to Arms around its battle',
    quirk:
      'The 1917 rout here was so complete that Caporetto became an everyday Italian word for a disaster.',
    housing: 0.85,
  },
  Radovljica: {
    region: 'Gorenjska',
    size: 'town',
    population: 6000,
    tags: ['historic', 'river'],
    blurb:
      'A little walled town on a terrace high above the Sava, with one of the prettiest old squares in the country and the Karawanks along the horizon.',
    landmarks: [
      'the Beekeeping Museum',
      'Linhart Square',
      'the gingerbread workshop at the old Lectar inn',
      'the forges of Kropa',
    ],
    food: 'lect gingerbread',
    river: 'Sava',
    famous: 'Anton Tomaž Linhart, the playwright who was born here',
    quirk:
      'Beekeepers here once painted the front boards of their hives with saints, devils and rude jokes, and the museum is full of them.',
    housing: 1.15,
  },
  Logatec: {
    region: 'Notranjska',
    size: 'town',
    population: 9000,
    tags: ['karst', 'forest'],
    blurb:
      'A spread-out town on the old road from Vienna to Trieste, where the forests begin and the rivers start disappearing into the ground.',
    landmarks: ['the Roman fort ruins on Hrušica', 'Planinsko polje', 'the forests above Rovte'],
    food: 'ričet',
    quirk:
      'The Logaščica just stops at the edge of town: it sinks into the ground and flows on in the dark towards the springs of the Ljubljanica.',
    housing: 1.05,
  },
  Vrhnika: {
    region: 'Notranjska',
    size: 'town',
    population: 8500,
    tags: ['river', 'historic'],
    blurb:
      'The town at the springs of the Ljubljanica, on the edge of the Ljubljana Marshes, where Ivan Cankar was born on the hill called Klanec.',
    landmarks: [
      'the springs of the Ljubljanica',
      "Cankar's birthplace on Klanec",
      'the Holy Trinity church on its hill',
      'the Ljubljana Marshes',
    ],
    food: 'potica',
    river: 'Ljubljanica',
    famous: 'Ivan Cankar, the writer who was born here',
    quirk:
      'Legend says Jason and the Argonauts landed here with the Golden Fleece, having sailed up from the Black Sea, and Vrhnika has never let it go.',
    housing: 1.15,
  },
  Žalec: {
    region: 'Savinjska',
    size: 'town',
    population: 5000,
    tags: ['farming', 'river'],
    blurb:
      'The hop capital of the Savinja valley, where tall green hop gardens line every road and the town fountain pours beer.',
    landmarks: [
      'the Green Gold beer fountain',
      'the hop-growing and brewing museum',
      'the Roman necropolis at Šempeter',
      'the Pekel cave',
    ],
    food: 'hop shoots with eggs',
    river: 'Savinja',
    quirk:
      'Every year at the hop-growers’ festival the valley crowns a Hop Princess, and grandmothers here still talk about the year their cousin won.',
    housing: 0.85,
  },
  'Slovenska Bistrica': {
    region: 'Štajerska',
    size: 'town',
    population: 8000,
    tags: ['historic', 'forest'],
    blurb:
      'A quiet Styrian town at the foot of Pohorje, with a Baroque castle in the centre and dark spruce forest climbing away behind it.',
    landmarks: [
      'Bistrica Castle',
      'the Osankarica clearing on Pohorje',
      'the Black Lake on Pohorje',
    ],
    food: 'štajerska zaseka',
    quirk:
      'The town remembers the Pohorje Battalion, the partisans who fought to the last man at Osankarica in the snow of January 1943.',
    housing: 0.85,
  },
  Ormož: {
    region: 'Štajerska',
    size: 'small town',
    population: 2000,
    tags: ['wine', 'border', 'river'],
    blurb:
      'A little town on a terrace above the Drava, looking across the river at Croatia, with the steep Jeruzalem vineyards rising behind it.',
    landmarks: ['Ormož Castle', 'the Jeruzalem wine hills', 'the Ormož lagoons bird reserve'],
    food: 'prleška tünka',
    river: 'Drava',
    quirk:
      'Jeruzalem, the hilltop village in the vineyards, is said to be named by crusaders who stopped here on their way and decided they had found paradise.',
    housing: 0.6,
  },
  Lendava: {
    region: 'Prekmurje',
    size: 'small town',
    population: 2900,
    tags: ['minority', 'border', 'wine', 'farming'],
    blurb:
      'A bilingual town under the vineyard hills, with signs in Slovene and Hungarian and the borders of both Hungary and Croatia a few minutes away.',
    landmarks: [
      'Lendava Castle',
      'the Vinarium tower on the Lendava hills',
      'the Hungarian cultural house by Makovecz',
    ],
    food: 'bograč',
    quirk:
      'Lendava calls itself the home of bograč, and every year teams cook it in kettles over open fires to see whose is the real one.',
    housing: 0.6,
  },
  Črnomelj: {
    region: 'Bela krajina',
    size: 'town',
    population: 5600,
    tags: ['river', 'farming', 'border'],
    blurb:
      "Bela krajina's chief town, on a bend where the Lahinja and Dobličica meet, among birch groves, ferns and white-painted churches.",
    landmarks: [
      'the Lahinja Landscape Park',
      'the Mithras shrine at Rožanec',
      'the Kolpa river beaches',
    ],
    food: 'belokranjska pogača',
    river: 'Lahinja',
    quirk:
      'Jurjevanje, the oldest folklore festival in the country, has greeted Green George and the spring here every June since 1964.',
    housing: 0.6,
  },
  Metlika: {
    region: 'Bela krajina',
    size: 'small town',
    population: 3300,
    tags: ['wine', 'border', 'river'],
    blurb:
      'A small town right on the Kolpa and the Croatian border, with metliška črnina in the cellars and white linen costumes at every festival.',
    landmarks: [
      'Metlika Castle and the Bela krajina Museum',
      'the Three Parishes at Rosalnice',
      'the Kolpa river beaches',
    ],
    food: 'belokranjska povitica',
    river: 'Kolpa',
    quirk:
      'At Vinska vigred every May the town fills with dancers in white embroidered linen, and the birch trees of Bela krajina turn up on every poster.',
    housing: 0.6,
  },
  'Ravne na Koroškem': {
    region: 'Koroška',
    size: 'town',
    population: 7000,
    tags: ['industrial', 'river', 'forest'],
    blurb:
      'An ironworks town in the Meža valley, where steel has been forged for three hundred years and the hills above are full of lonely farms.',
    landmarks: [
      'the steel sculptures of the Forma Viva park',
      'Ravne Castle and the Koroška library',
      "Prežihov Voranc's cottage",
      'Uršlja gora',
    ],
    food: 'ajdovi žganci',
    river: 'Meža',
    famous: 'Prežihov Voranc, the writer who grew up in the hills just above it',
    quirk:
      'The town was called Guštanj until 1952, and some of the oldest people in the valley still call it that.',
    housing: 0.65,
  },
  Litija: {
    region: 'Osrednjeslovenska',
    size: 'town',
    population: 6500,
    tags: ['river'],
    blurb:
      'A Sava valley town at the very middle of the country, with an old lead mine running under the hill and the river wide and grey below the bridge.',
    landmarks: [
      'GEOSS, the geometric centre of Slovenia',
      'the Sitarjevec mine',
      'the village of Vače, where the situla was found',
    ],
    food: 'štruklji',
    river: 'Sava',
    quirk:
      'At GEOSS above Vače you can stand on the exact middle of Slovenia, and everyone from Litija has a photo of themselves doing it.',
    housing: 0.75,
  },
  Grosuplje: {
    region: 'Dolenjska',
    size: 'town',
    population: 7500,
    tags: ['karst'],
    blurb:
      'A fast-growing commuter town on the road south of Ljubljana, the first stop in Dolenjska, with caves underfoot and Stična Abbey down the road.',
    landmarks: ['Županova jama', 'Stična Abbey', 'Radensko polje'],
    food: 'krvavice',
    quirk:
      'Grosuplje has grown from a village into a town within living memory, and people who were children here can point at shops and say whose field it used to be.',
    housing: 1.15,
  },
  Ribnica: {
    region: 'Dolenjska',
    size: 'small town',
    population: 3700,
    tags: ['forest', 'historic'],
    blurb:
      'A valley town famous for wooden ware: spoons, sieves, rakes and baskets carried by pedlars to every corner of the old empire.',
    landmarks: [
      'Ribnica Castle and its park',
      "St Stephen's Church with its Plečnik towers",
      'the September wooden-ware fair',
    ],
    food: 'ajdovi žganci',
    quirk:
      'The wooden-ware fair still sells handmade spoons and sieves every autumn, and the rest of Slovenia tells jokes about how crafty the Ribnica pedlars were.',
    housing: 0.7,
  },
  'Zagorje ob Savi': {
    region: 'Zasavje',
    size: 'town',
    population: 6600,
    tags: ['mining', 'industrial'],
    blurb:
      'A Zasavje mining town in a green side valley of the Sava, where coal was dug for two centuries and the miners’ brass band still plays on holidays.',
    landmarks: [
      'Kum, the highest hill in Zasavje',
      'the ruins of Medija Castle',
      'the old mining village of Kisovec',
    ],
    food: 'ajdovi žganci',
    quirk:
      'Families here still keep a miner’s lamp on the shelf, and the old shift times decide when some households eat lunch.',
    housing: 0.65,
  },
  Šentjur: {
    region: 'Savinjska',
    size: 'small town',
    population: 4900,
    tags: ['farming', 'historic'],
    blurb:
      'A Styrian market town east of Celje, proud of its composer brothers, the Ipavecs, and of the apple orchards of Kozjansko over the hills.',
    landmarks: ['the Ipavec House', 'the hill fort on Rifnik', 'the Kozjansko Park'],
    food: 'apple strudel',
    famous: 'Benjamin Ipavec, the doctor and composer who was born here',
    quirk:
      'The Ipavecs were doctors by day and composers by night, and Šentjur has never quite got over having that much music in one family.',
    housing: 0.75,
  },
  'Rogaška Slatina': {
    region: 'Savinjska',
    size: 'small town',
    population: 4800,
    tags: ['spa', 'border'],
    blurb:
      'A spa town of grand Habsburg-era hotels around a long park, built on a mineral water so full of magnesium that people drink it as medicine.',
    landmarks: ['the Crystal Hall', 'the Drinking Hall', 'the spa park', 'Boč hill'],
    food: 'gibanica',
    quirk:
      'The town is just as famous for hand-cut crystal glass, and in a great many Slovenian homes the good glasses came from here.',
    housing: 0.75,
  },
  Bovec: {
    region: 'Goriška',
    size: 'small town',
    population: 1500,
    tags: ['alpine', 'river', 'ski', 'border'],
    blurb:
      'The adventure capital of the upper Soča, a mountain village under Kanin where the river runs a startling emerald green.',
    landmarks: [
      "the Soča's emerald pools",
      'the Boka waterfall',
      'the Kluže fortress',
      'the Kanin cable car',
    ],
    food: 'frika',
    river: 'Soča',
    quirk:
      'In summer there seem to be more rafting guides in Bovec than locals, and half of them go to the shop in a wetsuit.',
    housing: 1.1,
  },
  Medvode: {
    region: 'Osrednjeslovenska',
    size: 'town',
    population: 5000,
    tags: ['river', 'lake'],
    blurb:
      'A town just north of Ljubljana where the Sora flows into the Sava, with a reservoir lake at Zbilje for rowing and castle ruins on the hill above.',
    landmarks: ['Zbilje Lake', 'the Smlednik castle ruins', 'Goričane Manor'],
    food: 'štruklji',
    river: 'Sora',
    quirk:
      'The name Medvode means between the waters, and the town sits exactly where the Sora runs into the Sava.',
    housing: 1.25,
  },
  'Kranjska Gora': {
    region: 'Gorenjska',
    size: 'small town',
    population: 1500,
    tags: ['alpine', 'ski', 'border', 'lake'],
    blurb:
      'An alpine village at the top of the Sava valley, where the World Cup slalom racers come every winter and the Planica ski-flying hills are just down the road.',
    landmarks: [
      "Planica's ski-flying hills",
      'Lake Jasna',
      'the Russian Chapel on the Vršič pass',
      'Zelenci, the source of the Sava',
    ],
    food: 'ričet',
    quirk:
      'Every March the whole valley moves to Planica for the ski-flying, and on a still day you can hear the crowd from the village.',
    housing: 1.3,
  },
  Laško: {
    region: 'Savinjska',
    size: 'small town',
    population: 3200,
    tags: ['spa', 'river', 'historic'],
    blurb:
      'A Savinja valley town of beer and warm springs, with a brewery that has been going since 1825 and a spa down by the river.',
    landmarks: [
      'Tabor Castle on the hill',
      'the thermal spa',
      'the old brewery',
      'the bridge over the Savinja',
    ],
    food: 'grilled sausages',
    river: 'Savinja',
    quirk:
      'Every July the Beer and Flowers festival fills the town, and the river smells faintly of malt for a week.',
    housing: 0.75,
  },
  Dravograd: {
    region: 'Koroška',
    size: 'small town',
    population: 3300,
    tags: ['river', 'border', 'industrial'],
    blurb:
      'A Koroška border town where the Meža and the Mislinja run into the Drava, under hydro dams that hold the big river back.',
    landmarks: ['the Church of St Vitus', 'the hydro dam on the Drava', 'the Drava riverside path'],
    food: 'smoked trout',
    river: 'Drava',
    quirk:
      'Its little Romanesque Church of St Vitus is one of the oldest buildings in Slovenia, and has been standing since the 1100s.',
    housing: 0.65,
  },
  Mozirje: {
    region: 'Savinjska',
    size: 'small town',
    population: 2000,
    tags: ['alpine', 'river', 'ski'],
    blurb:
      'A small town in the Upper Savinja valley, known for its flower park and for the ski slopes of Golte on the plateau above.',
    landmarks: ['Mozirski gaj', 'the slopes of Golte', 'Logarska dolina up the valley'],
    food: 'zgornjesavinjski želodec',
    river: 'Savinja',
    quirk:
      'Mozirski gaj puts on a new flower show every few weeks from spring to autumn, and children here can name tulips most adults have never heard of.',
    housing: 0.75,
  },
  Cerknica: {
    region: 'Notranjska',
    size: 'small town',
    population: 4000,
    tags: ['karst', 'lake', 'forest'],
    blurb:
      'A Notranjska town beside Lake Cerknica, the lake that fills every autumn and drains away through sinkholes by summer.',
    landmarks: ['Lake Cerknica', 'the natural bridges of Rakov Škocjan', 'Slivnica hill'],
    food: 'baked pike',
    quirk:
      'Legend says witches gather on Slivnica above the town, and at carnival time they come down into Cerknica in force.',
    housing: 0.8,
  },
  'Ilirska Bistrica': {
    region: 'Notranjska',
    size: 'small town',
    population: 4300,
    tags: ['forest', 'border', 'karst', 'river'],
    blurb:
      'A town under Snežnik, the highest mountain in the country outside the Alps, with Croatia over the hills and the burja whistling down the valley.',
    landmarks: ['Snežnik', 'the forests below Snežnik', 'the source of the Bistrica'],
    food: 'plum dumplings',
    river: 'Reka',
    quirk:
      'The Brkini hills next door are plum country, and in a good year it seems every family has more plums than it knows what to do with.',
    housing: 0.65,
  },
  Lenart: {
    region: 'Štajerska',
    size: 'small town',
    population: 3000,
    tags: ['wine', 'farming'],
    blurb:
      'The market town of the Slovenske gorice, low rolling hills of vineyards and orchards where wooden wind rattles keep the birds off the grapes.',
    landmarks: [
      "St Leonard's Church",
      'the vineyard hills of the Slovenske gorice',
      'the pilgrimage church at Sveta Trojica',
    ],
    food: 'štajerska kisla juha',
    quirk:
      'Klopotci, the tall wooden wind rattles, go up in the vineyards in high summer and come down after St Martin’s Day, and their clatter is the sound of autumn here.',
    housing: 0.6,
  },
  'Gornja Radgona': {
    region: 'Štajerska',
    size: 'small town',
    population: 2800,
    tags: ['wine', 'border', 'river'],
    blurb:
      'A Mura border town facing Austrian Bad Radkersburg across the bridge, known for its sparkling wine and the big farm fair every summer.',
    landmarks: [
      'the bridge over the Mura to Austria',
      'the old sparkling-wine cellars',
      'Negova Castle',
      'the castle on the hill',
    ],
    food: 'pumpkin-seed oil salad',
    river: 'Mura',
    quirk:
      'The town has made sparkling wine in the bottle-fermented way since the 1850s, and every wedding toast here is made with it.',
    housing: 0.6,
  },
  Trebnje: {
    region: 'Dolenjska',
    size: 'small town',
    population: 3900,
    tags: ['farming'],
    blurb:
      'A Dolenjska town in the Temenica valley, proud of its gallery of self-taught painters and of the vineyard cottages on the hills around it.',
    landmarks: [
      'the Gallery of Naive Artists',
      'the Temenica valley',
      "Baraga's birthplace at Mala vas",
    ],
    food: 'potica',
    famous: 'Frederic Baraga, the missionary bishop who was born in the hills nearby',
    quirk:
      'Every summer self-taught painters from all over the world gather here to paint, and the gallery has been keeping their work since 1968.',
    housing: 0.75,
  },
};
