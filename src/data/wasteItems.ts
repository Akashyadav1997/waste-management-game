import type { PreparationRequirement, WasteItem } from '../game/types';

export const preparationLabels: Record<PreparationRequirement, string> = {
  rinseClean: 'Rinse clean',
  wrapSafely: 'Wrap safely',
};

export const wasteItems: WasteItem[] = [
  {
    id: 'banana-peel',
    displayName: 'Banana peel',
    category: 'wet',
    model: 'banana',
    explanation: 'A banana peel is wet waste and can break down with other food scraps.',
    hint: 'It is a fruit peel that rots naturally.',
    handling: 'Put it with wet waste, then wash your hands.',
    chapters: ['kitchen', 'school', 'finale'],
  },
  {
    id: 'vegetable-peels',
    displayName: 'Vegetable peels',
    category: 'wet',
    model: 'peels',
    explanation: 'Vegetable peels are wet waste and belong with other food scraps.',
    hint: 'These kitchen scraps can break down naturally.',
    handling: 'Keep them separate from clean, dry material.',
    chapters: ['kitchen'],
  },
  {
    id: 'eggshells',
    displayName: 'Eggshells',
    category: 'wet',
    model: 'eggshells',
    explanation: 'Eggshells belong in the green wet-waste bin.',
    hint: 'They are food preparation waste.',
    handling: 'Put them with wet scraps, then wash your hands.',
    chapters: ['kitchen'],
  },
  {
    id: 'clean-paper',
    displayName: 'Clean paper',
    category: 'dry',
    model: 'paper',
    explanation: 'Clean paper belongs in the blue dry-waste bin.',
    hint: 'It is clean and dry.',
    handling: 'Keep it dry and fold it before sorting when practical.',
    chapters: ['kitchen', 'school', 'finale'],
  },
  {
    id: 'clean-cardboard',
    displayName: 'Clean cardboard box',
    category: 'dry',
    model: 'cardboard',
    explanation: 'A clean cardboard box belongs in the blue dry-waste bin.',
    hint: 'It is clean, dry packaging.',
    handling: 'Flatten it when practical and keep it dry.',
    chapters: ['kitchen'],
  },
  {
    id: 'empty-plastic-bottle',
    displayName: 'Empty plastic bottle',
    category: 'dry',
    model: 'bottle',
    preparation: 'rinseClean',
    explanation: 'A rinsed, empty plastic bottle belongs in the blue dry-waste bin.',
    hint: 'Empty packaging should be clean and dry before collection.',
    handling: 'Empty it, rinse it clean, let it dry, and keep it out of drains.',
    chapters: ['kitchen', 'drain', 'flood', 'finale'],
  },
  {
    id: 'toothpaste-tube',
    displayName: 'Empty toothpaste tube',
    category: 'dry',
    model: 'tube',
    preparation: 'rinseClean',
    explanation: 'An empty, clean toothpaste tube is dry plastic packaging for the blue bin.',
    hint: 'It is empty plastic packaging, not sanitary waste.',
    handling: 'Empty and clean it at home, let it dry, and never put it in a street drain.',
    chapters: ['drain', 'finale'],
  },
  {
    id: 'shampoo-sachet',
    displayName: 'Empty shampoo sachet',
    category: 'dry',
    model: 'sachet',
    preparation: 'rinseClean',
    explanation: 'An empty, clean shampoo sachet belongs with dry plastic packaging in the blue bin.',
    hint: 'Small plastic pouches are still dry packaging.',
    handling: 'Empty it, rinse it clean, let it dry, and keep it out of drains.',
    chapters: ['drain'],
  },
  {
    id: 'soap-wrapper',
    displayName: 'Empty plastic soap wrapper',
    category: 'dry',
    model: 'wrapper',
    explanation: 'An empty plastic soap wrapper belongs in the blue dry-waste bin.',
    hint: 'It is dry plastic packaging.',
    handling: 'Make sure it is empty and dry before sorting it.',
    chapters: ['drain'],
  },
  {
    id: 'soap-box',
    displayName: 'Empty soap box',
    category: 'dry',
    model: 'cardboard',
    explanation: 'An empty cardboard soap box belongs in the blue dry-waste bin.',
    hint: 'It is a cardboard box.',
    handling: 'Flatten it when practical and keep it dry.',
    chapters: ['drain'],
  },
  {
    id: 'cotton-buds',
    displayName: 'Used cotton swabs / ear buds',
    category: 'sanitary',
    model: 'buds',
    explanation: 'Used cotton buds are sanitary waste and belong in the yellow bin.',
    hint: 'Used personal-care swabs belong with sanitary waste.',
    handling: 'Do not flush them or put them in a drain. Ask an adult for help.',
    chapters: ['drain'],
  },
  {
    id: 'fruit-offcuts',
    displayName: 'Fruit offcuts',
    category: 'wet',
    model: 'fruit',
    explanation: 'Fruit offcuts are wet waste for the green bin.',
    hint: 'They are leftover pieces of food.',
    handling: 'Keep them separate from clean, dry material.',
    chapters: ['road'],
  },
  {
    id: 'plastic-bag',
    displayName: 'Empty plastic bag',
    category: 'dry',
    model: 'bag',
    preparation: 'rinseClean',
    explanation: 'An empty, clean plastic bag belongs in the blue dry-waste bin.',
    hint: 'It is plastic, even when it is soft and flexible.',
    handling: 'Empty it, rinse it if soiled, let it dry, and keep it from blowing away.',
    chapters: ['road'],
  },
  {
    id: 'newspaper',
    displayName: 'Newspaper',
    category: 'dry',
    model: 'newspaper',
    explanation: 'A clean newspaper belongs in the blue dry-waste bin.',
    hint: 'It is clean, dry paper.',
    handling: 'Keep it dry and fold it neatly.',
    chapters: ['road'],
  },
  {
    id: 'cooked-leftovers',
    displayName: 'Cooked leftovers',
    category: 'wet',
    model: 'leftovers',
    explanation: 'Cooked leftovers are wet waste for the green bin.',
    hint: 'They are leftover food.',
    handling: 'Keep them away from paper and other dry waste.',
    chapters: ['road'],
  },
  {
    id: 'school-wrapper',
    displayName: 'Empty plastic snack wrapper',
    category: 'dry',
    model: 'wrapper',
    explanation: 'An empty plastic snack wrapper belongs in the blue dry-waste bin.',
    hint: 'It is dry plastic packaging.',
    handling: 'Make sure it is empty and put it in the dry-waste bin.',
    chapters: ['school', 'flood'],
  },
  {
    id: 'plant-leaves',
    displayName: 'Plant leaves',
    category: 'wet',
    model: 'leaves',
    explanation: 'Plant leaves and flowers belong in the green wet-waste bin.',
    hint: 'Leaves break down naturally, even when they look dry.',
    handling: 'Collect them without entering floodwater or reaching into a drain.',
    chapters: ['flood'],
  },
  {
    id: 'milk-pouch',
    displayName: 'Empty milk pouch',
    category: 'dry',
    model: 'milkPouch',
    preparation: 'rinseClean',
    explanation: 'A rinsed, empty milk pouch belongs in the blue dry-waste bin.',
    hint: 'Milk is food, but its empty pouch is plastic packaging.',
    handling: 'Empty it, rinse it clean, let it dry, and keep it out of drains.',
    chapters: ['flood'],
  },
  {
    id: 'contained-sanitary',
    displayName: 'Wrapped used sanitary pad',
    category: 'sanitary',
    model: 'containedSanitary',
    preparation: 'wrapSafely',
    explanation: 'A used sanitary pad (sanitary napkin) belongs in the yellow bin. Its paper wrapping does not turn it into dry paper waste.',
    hint: 'This is a used hygiene pad inside a wrapper, not a clean paper napkin.',
    handling: 'Do not touch loose sanitary waste. Ask an adult to wrap and handle it safely.',
    chapters: ['finale'],
  },
  {
    id: 'used-battery',
    displayName: 'Used battery',
    category: 'hazardous',
    model: 'battery',
    explanation: 'A used battery is hazardous household waste for the red bin.',
    hint: 'Batteries contain chemicals and need special collection.',
    handling: 'Do not open or play with it. Ask an adult to store and dispose of it safely.',
    chapters: ['finale'],
  },
  {
    "id": "vegetable-offcuts",
    "displayName": "Vegetable offcuts",
    "category": "wet",
    "model": "vegetables",
    "explanation": "Vegetable offcuts belongs in the green wet-waste bin in this game.",
    "hint": "These are pieces left after chopping vegetables.",
    "handling": "Keep food scraps separate from packaging.",
    "chapters": [
      "kitchen"
    ]
  },
  {
    "id": "spoiled-produce",
    "displayName": "Spoiled fruit and vegetables",
    "category": "wet",
    "model": "spoiledFruit",
    "explanation": "Spoiled fruit and vegetables belongs in the green wet-waste bin in this game.",
    "hint": "Spoiled produce is still organic food waste.",
    "handling": "Do not eat it; place it with wet waste.",
    "chapters": [
      "road"
    ]
  },
  {
    "id": "coffee-grounds",
    "displayName": "Used coffee grounds",
    "category": "wet",
    "model": "coffee",
    "explanation": "Used coffee grounds belongs in the green wet-waste bin in this game.",
    "hint": "These brown crumbs came from brewing coffee.",
    "handling": "Let them cool and keep them out of the sink.",
    "chapters": [
      "kitchen"
    ]
  },
  {
    "id": "paper-coffee-filter",
    "displayName": "Paper coffee filter",
    "category": "wet",
    "model": "coffeeFilter",
    "explanation": "Paper coffee filter belongs in the green wet-waste bin in this game.",
    "hint": "This uncoated filter holds used coffee grounds.",
    "handling": "Put the paper filter and grounds together with wet waste.",
    "chapters": [
      "kitchen"
    ]
  },
  {
    "id": "plastic-free-tea-bag",
    "displayName": "Plastic-free tea bag",
    "category": "wet",
    "model": "teaBag",
    "explanation": "Plastic-free tea bag belongs in the green wet-waste bin in this game.",
    "hint": "This tea bag is confirmed to contain no plastic.",
    "handling": "Let it cool; remove any staple. Plastic mesh tea bags do not belong here.",
    "chapters": [
      "kitchen"
    ]
  },
  {
    "id": "stale-bread",
    "displayName": "Stale bread",
    "category": "wet",
    "model": "bread",
    "explanation": "Stale bread belongs in the green wet-waste bin in this game.",
    "hint": "Bread is food even when it feels dry.",
    "handling": "Remove the plastic bread bag first.",
    "chapters": [
      "kitchen"
    ]
  },
  {
    "id": "pasta",
    "displayName": "Leftover pasta",
    "category": "wet",
    "model": "pasta",
    "explanation": "Leftover pasta belongs in the green wet-waste bin in this game.",
    "hint": "Cooked pasta is a food scrap.",
    "handling": "Drain excess liquid and keep the food separate from its container.",
    "chapters": [
      "road"
    ]
  },
  {
    "id": "cereals",
    "displayName": "Leftover cereals",
    "category": "wet",
    "model": "cereal",
    "explanation": "Leftover cereals belongs in the green wet-waste bin in this game.",
    "hint": "These are cereal pieces, not their cardboard box.",
    "handling": "Separate food from its packaging.",
    "chapters": [
      "kitchen"
    ]
  },
  {
    "id": "plain-baked-bread",
    "displayName": "Plain baked bread roll",
    "category": "wet",
    "model": "breadRoll",
    "explanation": "Plain baked bread roll belongs in the green wet-waste bin in this game.",
    "hint": "Plain baked food belongs with other food scraps.",
    "handling": "Remove any wrapper before sorting.",
    "chapters": [
      "school"
    ]
  },
  {
    "id": "meat-scraps",
    "displayName": "Meat scraps (cooked or uncooked)",
    "category": "wet",
    "model": "meat",
    "explanation": "Meat scraps (cooked or uncooked) belongs in the green wet-waste bin in this game.",
    "hint": "Meat is food waste, whether cooked or raw.",
    "handling": "Use covered wet-waste collection; wash hands. Not all home compost accepts meat.",
    "chapters": [
      "road"
    ]
  },
  {
    "id": "fish-scraps",
    "displayName": "Fish scraps (cooked or uncooked)",
    "category": "wet",
    "model": "fish",
    "explanation": "Fish scraps (cooked or uncooked) belongs in the green wet-waste bin in this game.",
    "hint": "Fish scraps are food waste.",
    "handling": "Use covered wet-waste collection; wash hands. Not all home compost accepts fish.",
    "chapters": [
      "road"
    ]
  },
  {
    "id": "dairy",
    "displayName": "Dairy leftovers",
    "category": "wet",
    "model": "dairy",
    "explanation": "Dairy leftovers belongs in the green wet-waste bin in this game.",
    "hint": "This is leftover cheese, not its packaging.",
    "handling": "Keep dairy food separate from its container; use wet-waste collection.",
    "chapters": [
      "kitchen"
    ]
  },
  {
    "id": "nut-shells",
    "displayName": "Nut shells",
    "category": "wet",
    "model": "nuts",
    "explanation": "Nut shells belongs in the green wet-waste bin in this game.",
    "hint": "Hard shells are still plant material.",
    "handling": "Separate shells from plastic snack packets.",
    "chapters": [
      "road"
    ]
  },
  {
    "id": "fresh-flowers",
    "displayName": "Fresh flowers",
    "category": "wet",
    "model": "flowers",
    "explanation": "Fresh flowers belongs in the green wet-waste bin in this game.",
    "hint": "Flowers are organic plant material.",
    "handling": "Remove ribbons, wire and plastic wrapping.",
    "chapters": [
      "flood"
    ]
  },
  {
    "id": "dry-leaves",
    "displayName": "Dry leaves",
    "category": "wet",
    "model": "dryLeaves",
    "explanation": "Dry leaves belongs in the green wet-waste bin in this game.",
    "hint": "Dry in appearance does not mean dry-waste category.",
    "handling": "Keep leaves out of drains; ask an adult to clear blockages.",
    "chapters": [
      "flood"
    ]
  },
  {
    "id": "dry-flowers",
    "displayName": "Dry flowers",
    "category": "wet",
    "model": "dryFlowers",
    "explanation": "Dry flowers belongs in the green wet-waste bin in this game.",
    "hint": "Dried flowers can still break down naturally.",
    "handling": "Remove non-organic decorations first.",
    "chapters": [
      "flood"
    ]
  },
  {
    "id": "packing-straw",
    "displayName": "Rice / wheat packing straw",
    "category": "wet",
    "model": "strawBundle",
    "explanation": "Rice / wheat packing straw belongs in the green wet-waste bin in this game.",
    "hint": "Natural packing straw comes from plants.",
    "handling": "Separate natural straw from plastic packaging.",
    "chapters": [
      "flood"
    ]
  },
  {
    "id": "wooden-ice-cream-stick",
    "displayName": "Wooden ice cream stick",
    "category": "wet",
    "model": "woodStick",
    "explanation": "Wooden ice cream stick belongs in the green wet-waste bin in this game.",
    "hint": "This stick is plain, uncoated wood.",
    "handling": "Keep plastic sticks separate; follow local organic-waste collection guidance.",
    "chapters": [
      "school"
    ]
  },
  {
    "id": "biodegradable-plate",
    "displayName": "Biodegradable leaf plate",
    "category": "wet",
    "model": "leafPlate",
    "explanation": "Biodegradable leaf plate belongs in the green wet-waste bin in this game.",
    "hint": "This plate is made of leaves, without a plastic lining.",
    "handling": "Use wet-waste collection for this uncoated leaf plate.",
    "chapters": [
      "road"
    ]
  },
  {
    "id": "biodegradable-cup",
    "displayName": "Biodegradable fibre cup",
    "category": "wet",
    "model": "fibreCup",
    "explanation": "Biodegradable fibre cup belongs in the green wet-waste bin in this game.",
    "hint": "This cup is confirmed to be uncoated plant fibre.",
    "handling": "Check the material: plastic-lined cups and industrially compostable plastics need different collection.",
    "chapters": [
      "school"
    ]
  },
  {
    "id": "biodegradable-glass",
    "displayName": "Biodegradable fibre tumbler",
    "category": "wet",
    "model": "fibreGlass",
    "explanation": "Biodegradable fibre tumbler belongs in the green wet-waste bin in this game.",
    "hint": "This drinking vessel is uncoated plant fibre, not glass.",
    "handling": "Use the local organic-waste stream only for accepted natural-fibre utensils.",
    "chapters": [
      "road"
    ]
  },
  {
    "id": "pencil-shavings",
    "displayName": "Pencil shavings",
    "category": "wet",
    "model": "shavings",
    "explanation": "Pencil shavings belongs in the green wet-waste bin in this game.",
    "hint": "These are shavings from an untreated wooden pencil.",
    "handling": "Keep the plastic sharpener and eraser pieces separate.",
    "chapters": [
      "school"
    ]
  },
  {
    "id": "clean-tissue",
    "displayName": "Clean unused tissue",
    "category": "dry",
    "model": "tissue",
    "explanation": "Clean unused tissue belongs in the blue dry-waste bin in this game.",
    "hint": "This tissue is clean and unused.",
    "handling": "Keep it dry; used personal-care tissues belong in the sanitary stream.",
    "chapters": [
      "school"
    ]
  },
  {
    "id": "notebook",
    "displayName": "Old notebook",
    "category": "dry",
    "model": "notebook",
    "explanation": "Old notebook belongs in the blue dry-waste bin in this game.",
    "hint": "Notebook pages are clean paper.",
    "handling": "Keep the paper dry.",
    "chapters": [
      "school"
    ]
  },
  {
    "id": "plastic-pen",
    "displayName": "Empty plastic pen",
    "category": "dry",
    "model": "pen",
    "explanation": "Empty plastic pen belongs in the blue dry-waste bin in this game.",
    "hint": "An empty pen is a dry plastic item.",
    "handling": "Do not break it open or try to wash ink into a drain.",
    "chapters": [
      "school"
    ]
  },
  {
    "id": "plastic-container",
    "displayName": "Empty plastic container",
    "category": "dry",
    "model": "container",
    "explanation": "Empty plastic container belongs in the blue dry-waste bin in this game.",
    "hint": "Food was wet waste; its empty plastic container is dry waste.",
    "handling": "Empty, rinse and dry the container before sorting.",
    "chapters": [
      "kitchen"
    ],
    "preparation": "rinseClean"
  },
  {
    "id": "glass-bottle",
    "displayName": "Empty glass bottle",
    "category": "dry",
    "model": "glassBottle",
    "explanation": "Empty glass bottle belongs in the blue dry-waste bin in this game.",
    "hint": "This is an intact glass container.",
    "handling": "Rinse and dry it; ask an adult to keep glass securely packed.",
    "chapters": [
      "road"
    ],
    "preparation": "rinseClean"
  },
  {
    "id": "broken-glass",
    "displayName": "Safely wrapped broken glass",
    "category": "dry",
    "model": "brokenGlass",
    "explanation": "Safely wrapped broken glass belongs in the blue dry-waste bin in this game.",
    "hint": "Glass stays dry waste, but sharp pieces need protection.",
    "handling": "Ask an adult to use a rigid puncture-resistant container, label it SHARP and follow local collection instructions.",
    "chapters": [
      "finale"
    ],
    "preparation": "wrapSafely"
  },
  {
    "id": "razor",
    "displayName": "Safely covered shaving razor",
    "category": "dry",
    "model": "razor",
    "explanation": "Safely covered shaving razor belongs in the blue dry-waste bin in this game.",
    "hint": "This household razor is a sharp dry item in this game.",
    "handling": "Never handle an exposed blade. An adult should secure it in a labelled puncture-resistant container.",
    "chapters": [
      "finale"
    ],
    "preparation": "wrapSafely"
  },
  {
    "id": "stapler-pins",
    "displayName": "Safely contained stapler pins",
    "category": "dry",
    "model": "staples",
    "explanation": "Safely contained stapler pins belongs in the blue dry-waste bin in this game.",
    "hint": "These small pins are metal.",
    "handling": "Ask an adult to contain sharp pins securely; do not scatter them.",
    "chapters": [
      "school"
    ],
    "preparation": "wrapSafely"
  },
  {
    "id": "metal-can",
    "displayName": "Empty metal food can",
    "category": "dry",
    "model": "can",
    "explanation": "Empty metal food can belongs in the blue dry-waste bin in this game.",
    "hint": "This empty container is metal, not food.",
    "handling": "Rinse and dry it; ask an adult to cover any sharp edge.",
    "chapters": [
      "kitchen"
    ],
    "preparation": "rinseClean"
  },
  {
    "id": "aluminium-foil",
    "displayName": "Clean aluminium foil",
    "category": "dry",
    "model": "foil",
    "explanation": "Clean aluminium foil belongs in the blue dry-waste bin in this game.",
    "hint": "Clean foil is a thin sheet of metal.",
    "handling": "Remove food, rinse if needed, dry and gather it together.",
    "chapters": [
      "road"
    ],
    "preparation": "rinseClean"
  },
  {
    "id": "aluminium-tab",
    "displayName": "Aluminium can tab",
    "category": "dry",
    "model": "canTab",
    "explanation": "Aluminium can tab belongs in the blue dry-waste bin in this game.",
    "hint": "This pull tab is a small metal part.",
    "handling": "Keep it with the empty can so it is not lost.",
    "chapters": [
      "road"
    ]
  },
  {
    "id": "soda-can",
    "displayName": "Empty soda can",
    "category": "dry",
    "model": "sodaCan",
    "explanation": "Empty soda can belongs in the blue dry-waste bin in this game.",
    "hint": "A drink can is metal packaging.",
    "handling": "Empty, rinse and dry it.",
    "chapters": [
      "school"
    ],
    "preparation": "rinseClean"
  },
  {
    "id": "old-clothes",
    "displayName": "Worn-out clothes",
    "category": "dry",
    "model": "shirt",
    "explanation": "Worn-out clothes belongs in the blue dry-waste bin in this game.",
    "hint": "Worn fabric belongs with dry material.",
    "handling": "Reuse or donate usable clothing; keep discarded fabric clean and dry.",
    "chapters": [
      "road"
    ]
  },
  {
    "id": "fabric-scraps",
    "displayName": "Fabric scraps",
    "category": "dry",
    "model": "fabric",
    "explanation": "Fabric scraps belongs in the blue dry-waste bin in this game.",
    "hint": "These offcuts are cloth, not food.",
    "handling": "Gather the dry scraps for textile collection where available.",
    "chapters": [
      "school"
    ]
  },
  {
    "id": "rubber-material",
    "displayName": "Worn rubber sandal",
    "category": "dry",
    "model": "sandal",
    "explanation": "Worn rubber sandal belongs in the blue dry-waste bin in this game.",
    "hint": "Rubber does not become wet waste when it gets wet.",
    "handling": "Keep rubber with dry waste; never leave it in a drain.",
    "chapters": [
      "flood"
    ]
  },
  {
    "id": "broom-sticks",
    "displayName": "Discarded broom sticks",
    "category": "dry",
    "model": "broom",
    "explanation": "Discarded broom sticks belongs in the blue dry-waste bin in this game.",
    "hint": "The project groups discarded broom sticks with dry waste.",
    "handling": "Tie the sticks together for collection.",
    "chapters": [
      "flood"
    ]
  },
  {
    "id": "thermocol",
    "displayName": "Thermocol packaging",
    "category": "dry",
    "model": "foam",
    "explanation": "Thermocol packaging belongs in the blue dry-waste bin in this game.",
    "hint": "This foam is plastic packaging, not plant material.",
    "handling": "Keep the pieces together so they cannot blow into drains.",
    "chapters": [
      "flood"
    ]
  },
  {
    "id": "plastic-straw",
    "displayName": "Plastic drinking straw",
    "category": "dry",
    "model": "plasticStraw",
    "explanation": "Plastic drinking straw belongs in the blue dry-waste bin in this game.",
    "hint": "Plastic straws differ from natural rice or wheat straw.",
    "handling": "Empty and clean it, then keep it from blowing away.",
    "chapters": [
      "flood"
    ],
    "preparation": "rinseClean"
  },
  {
    "id": "plastic-plate",
    "displayName": "Non-biodegradable plastic plate",
    "category": "dry",
    "model": "plasticPlate",
    "explanation": "Non-biodegradable plastic plate belongs in the blue dry-waste bin in this game.",
    "hint": "This plate is made of plastic, unlike a leaf plate.",
    "handling": "Remove food, rinse and dry it.",
    "chapters": [
      "road"
    ],
    "preparation": "rinseClean"
  },
  {
    "id": "plastic-cup",
    "displayName": "Non-biodegradable plastic cup",
    "category": "dry",
    "model": "plasticCup",
    "explanation": "Non-biodegradable plastic cup belongs in the blue dry-waste bin in this game.",
    "hint": "This cup is plastic, not uncoated plant fibre.",
    "handling": "Empty, rinse and dry it.",
    "chapters": [
      "school"
    ],
    "preparation": "rinseClean"
  },
  {
    "id": "plastic-glass",
    "displayName": "Non-biodegradable plastic tumbler",
    "category": "dry",
    "model": "plasticGlass",
    "explanation": "Non-biodegradable plastic tumbler belongs in the blue dry-waste bin in this game.",
    "hint": "This drinking vessel is plastic.",
    "handling": "Empty, rinse and dry it.",
    "chapters": [
      "road"
    ],
    "preparation": "rinseClean"
  },
  {
    "id": "eraser",
    "displayName": "Used eraser",
    "category": "dry",
    "model": "eraser",
    "explanation": "Used eraser belongs in the blue dry-waste bin in this game.",
    "hint": "An eraser is rubber, unlike wooden pencil shavings.",
    "handling": "Gather small eraser pieces with dry waste.",
    "chapters": [
      "school"
    ]
  },
  {
    "id": "used-diaper",
    "displayName": "Wrapped used diaper",
    "category": "sanitary",
    "model": "diaper",
    "explanation": "Wrapped used diaper belongs in the yellow sanitary-waste bin in this game.",
    "hint": "Used diapers are personal hygiene waste.",
    "handling": "An adult should wrap it securely; never flush it.",
    "chapters": [
      "drain"
    ],
    "preparation": "wrapSafely"
  },
  {
    "id": "bandage",
    "displayName": "Wrapped used bandage",
    "category": "sanitary",
    "model": "bandage",
    "explanation": "Wrapped used bandage belongs in the yellow sanitary-waste bin in this game.",
    "hint": "This is a household adhesive bandage in the project sanitary stream.",
    "handling": "Ask an adult to wrap it. Blood-soaked dressings need special-care collection under local guidance.",
    "chapters": [
      "drain"
    ],
    "preparation": "wrapSafely"
  },
  {
    "id": "used-tissue",
    "displayName": "Used personal-cleaning tissue",
    "category": "sanitary",
    "model": "usedTissue",
    "explanation": "Used personal-cleaning tissue belongs in the yellow sanitary-waste bin in this game.",
    "hint": "Your chart puts tissues used for cleaning in yellow. Clean, unused tissues go in blue.",
    "handling": "Wrap it for sanitary collection. Chemical-soaked wipes need special-care collection.",
    "chapters": [
      "drain"
    ],
    "preparation": "wrapSafely"
  },
  {
    "id": "electronics",
    "displayName": "Discarded mobile phone (e-waste)",
    "category": "hazardous",
    "model": "phone",
    "explanation": "Discarded mobile phone (e-waste) belongs in the red hazardous-household-waste bin in this game.",
    "hint": "Electronics contain components that need special collection.",
    "handling": "Ask an adult to take it to an authorised e-waste collection point.",
    "chapters": [
      "finale"
    ]
  },
  {
    "id": "cleaning-chemical",
    "displayName": "Household cleaning chemical",
    "category": "hazardous",
    "model": "chemical",
    "explanation": "Household cleaning chemical belongs in the red hazardous-household-waste bin in this game.",
    "hint": "Cleaning chemicals can harm people and water.",
    "handling": "Keep the bottle closed; do not mix or pour it into a drain. Ask an adult for special collection.",
    "chapters": [
      "finale"
    ]
  },
  {
    "id": "paint",
    "displayName": "Leftover paint tin",
    "category": "hazardous",
    "model": "paint",
    "explanation": "Leftover paint tin belongs in the red hazardous-household-waste bin in this game.",
    "hint": "Paint residue needs special-care collection.",
    "handling": "Keep the lid closed; never pour paint into a drain. Ask an adult for help.",
    "chapters": [
      "finale"
    ]
  },
  {
    "id": "insecticide",
    "displayName": "Insecticide spray can",
    "category": "hazardous",
    "model": "spray",
    "explanation": "Insecticide spray can belongs in the red hazardous-household-waste bin in this game.",
    "hint": "Insecticide contains pest-control chemicals.",
    "handling": "Do not spray, crush or puncture it. Ask an adult for special collection.",
    "chapters": [
      "finale"
    ]
  },
  {
    "id": "expired-medicine",
    "displayName": "Expired medicines",
    "category": "hazardous",
    "model": "medicine",
    "explanation": "Expired medicines belongs in the red hazardous-household-waste bin in this game.",
    "hint": "Old medicines need special collection, not the sanitary bin.",
    "handling": "Do not taste or flush them. Give them to an adult for designated collection.",
    "chapters": [
      "finale"
    ]
  },
  {
    "id": "thermometer",
    "displayName": "Old mercury thermometer",
    "category": "hazardous",
    "model": "thermometer",
    "explanation": "Old mercury thermometer belongs in the red hazardous-household-waste bin in this game.",
    "hint": "A mercury thermometer needs special-care collection.",
    "handling": "Do not break or touch a leaking thermometer. Ask an adult for help.",
    "chapters": [
      "finale"
    ]
  },
  {
    "id": "light-bulb",
    "displayName": "Discarded light bulb",
    "category": "hazardous",
    "model": "bulb",
    "explanation": "Discarded light bulb belongs in the red hazardous-household-waste bin in this game.",
    "hint": "Bulbs need separate collection in this game.",
    "handling": "Ask an adult to pack it securely and use designated collection.",
    "chapters": [
      "finale"
    ],
    "preparation": "wrapSafely"
  },
  {
    "id": "tube-light",
    "displayName": "Fluorescent tube light",
    "category": "hazardous",
    "model": "tubeLight",
    "explanation": "Fluorescent tube light belongs in the red hazardous-household-waste bin in this game.",
    "hint": "Fluorescent tubes can contain mercury.",
    "handling": "Do not break it. An adult should pack it for special collection.",
    "chapters": [
      "finale"
    ],
    "preparation": "wrapSafely"
  },
  {
    "id": "cfl",
    "displayName": "Compact fluorescent lamp (CFL)",
    "category": "hazardous",
    "model": "cfl",
    "explanation": "Compact fluorescent lamp (CFL) belongs in the red hazardous-household-waste bin in this game.",
    "hint": "A CFL contains components that need special-care collection.",
    "handling": "Do not break it. Ask an adult to pack it and use designated collection.",
    "chapters": [
      "finale"
    ],
    "preparation": "wrapSafely"
  },
];

export function getWasteItem(itemId: string): WasteItem | undefined {
  return wasteItems.find((item) => item.id === itemId);
}

export function getPreparationLabel(requirement?: PreparationRequirement): string | undefined {
  return requirement ? preparationLabels[requirement] : undefined;
}
