import {
    Milk, Apple, Banana, Carrot, Beef, Fish,
    Utensils, Refrigerator, Coffee, Beer, Wine,
    Tv, Smartphone, Wrench, ShoppingBag,
    Circle, Egg, Sandwich, CakeSlice, Pizza,
    Bath, Bed, Briefcase, Calculator, Calendar,
    Droplet, Trash2, Zap, Lightbulb, Shirt,
    Sparkles, Sun, Cookie, Drumstick, User,
    Thermometer, Pill, Stethoscope, Baby,
    PawPrint, Snowflake, Globe,
    Scissors, FileText, Mail, Paperclip,
    PartyPopper, Gift,  // Party
    Sprout, Shovel,     // Gardening
    Candy, Popcorn,      // Snacks
    Plug, Battery, Monitor, // Tech
    Hammer, Ruler, Construction, // Tools
    Dumbbell, Activity, Trophy, // Sports
    Palette, Brush, PenTool, // Crafts
    Sofa, Image, // Home
    Truck, // Auto
    Tent, Flame, // Camping
    Book, Gamepad, Plane, Watch, Music, Headphones, Armchair // New
} from 'lucide-react';

// Keyword to Icon mapping
const ICON_MAP = {
    // Books & Games
    book: Book,
    read: Book,
    game: Gamepad,
    puzzle: Gamepad,
    card: Gamepad,

    // Travel
    trip: Plane,
    plane: Plane,
    suitcase: Briefcase,
    backpack: ShoppingBag,

    // Jewelry
    jewelry: Watch,
    ring: Watch,
    necklace: Watch,
    watch: Watch,
    gold: Watch,

    // Furniture
    chair: Armchair,
    desk: Armchair,
    shelf: Armchair,
    lamp: Lightbulb,

    // Music
    music: Music,
    guitar: Music,
    piano: Music,
    drum: Music,
    listen: Headphones,
    headphone: Headphones,

    // Home
    pillow: Sofa,
    couch: Sofa,
    sofa: Sofa,
    blanket: Bed,
    candle: Flame,
    vase: Image, // Fallback
    frame: Image,
    decor: Image,

    // Clothing
    shirt: Shirt,
    sock: Shirt,
    wear: Shirt,
    hat: User,
    scarf: User,

    // Auto
    car: Truck,
    oil: Droplet,
    wiper: Droplet,
    auto: Truck,

    // Camping
    camp: Tent,
    tent: Tent,
    sleep: Bed,
    lantern: Lightbulb,
    bug: Sparkles,
    cooler: Snowflake, // Use existing snowflake if variable scope allows, or redefine logic. Javascript object keys are strings.

    // Tech
    phone: Smartphone,
    charger: Plug,
    usb: Plug,
    cable: Plug,
    hdmi: Monitor,
    screen: Monitor,
    battery: Battery,
    power: Plug,
    cord: Plug,

    // Tools
    hammer: Hammer,
    screw: Construction,
    nail: Construction,
    measure: Ruler,
    wrench: Wrench,
    fix: Wrench,
    build: Hammer,

    // Sports
    gym: Dumbbell,
    yoga: Activity,
    exercise: Activity,
    ball: Trophy, // Fallback for various balls
    sport: Trophy,
    tennis: Activity,
    soccer: Activity,

    // Crafts
    art: Palette,
    paint: Palette,
    draw: Brush,
    brush: Brush,
    glue: PenTool,
    yarn: PenTool,
    marker: PenTool,

    // Office
    pen: FileText,
    paper: FileText,
    notebook: FileText,
    office: Paperclip,
    tape: Paperclip,
    scissors: Scissors,
    mail: Mail,
    envelope: Mail,

    // Party
    party: PartyPopper,
    balloon: PartyPopper,
    cake: Gift,
    gift: Gift,
    cup: PartyPopper,

    // Gardening
    garden: Sprout,
    plant: Sprout,
    flower: Sprout,
    dirt: Sprout,
    soil: Shovel,
    shovel: Shovel,
    tool: Shovel,

    // Snacks
    snack: Candy,
    candy: Candy,
    gum: Candy,
    chocolate: Candy,
    sweet: Candy,
    popcorn: Popcorn,
    movie: Popcorn,

    // Produce
    apple: Apple,
    fruit: Apple,
    banana: Banana,
    carrot: Carrot,
    veg: Carrot,
    vegetable: Carrot,
    green: Carrot, // Leafy greens

    // Frozen
    ice: Snowflake,
    frozen: Snowflake,
    cold: Snowflake,

    // Baby
    baby: Baby,
    diaper: Baby,
    formula: Baby,

    // Pets
    pet: PawPrint,
    dog: PawPrint,
    cat: PawPrint,

    // Health
    med: Pill,
    pill: Pill,
    health: Stethoscope,
    vitamin: Pill,
    band: Stethoscope,

    // International
    asian: Globe,
    world: Globe,
    mexican: Globe,

    // Meat & Protein
    beef: Beef,
    meat: Beef,
    pork: Beef,
    chicken: Drumstick, // Try Drumstick, fallback gracefully handled by import if strict (but JS is lenient, will just be undefined if not exported)
    poultry: Drumstick,
    fish: Fish,
    seafood: Fish,

    // Dairy
    milk: Milk,
    dairy: Milk,
    cheese: Milk, // Fallback
    yogurt: Milk,
    egg: Egg,
    breakfast: Egg,

    // Kitchen Tools / Eating
    spoon: Utensils,
    fork: Utensils,
    kitchen: Utensils,
    fridge: Refrigerator,

    // Drink
    coffee: Coffee,
    tea: Coffee,
    beer: Beer,
    drink: Beer,
    alcohol: Wine,
    wine: Wine,
    juice: Droplet,
    water: Droplet,
    oil: Droplet,
    sauce: Droplet,
    liquid: Droplet,

    // Household / Misc
    tv: Tv,
    phone: Smartphone,
    tool: Wrench,
    shop: ShoppingBag,
    bag: ShoppingBag,
    trash: Trash2,
    waste: Trash2,
    battery: Zap,
    power: Zap,
    bulb: Lightbulb,
    light: Lightbulb,
    clean: Sparkles,
    laundry: Shirt,
    clothes: Shirt,

    // Bakery
    bread: Sandwich,
    sandwich: Sandwich,
    bakery: Sandwich,
    cake: CakeSlice,
    dessert: CakeSlice,
    cookie: Cookie,
    sweet: Cookie,
    pizza: Pizza,

    // Personal / Living
    bath: Bath,
    soap: Bath,
    shampoo: Bath,
    bed: Bed,
    sleep: Bed,
    office: Briefcase,
    work: Briefcase,
    calc: Calculator,
    date: Calendar,
    sun: Sun,
    skin: User,
    body: User
};

/**
 * Returns a Lucide Icon component based on the item name
 * @param {string} name - The item name
 * @returns {Component} - The Lucide Icon component
 */
export function getIconForProduct(name) {
    if (!name) return Circle;

    const lowerName = name.toLowerCase();

    // 1. Check exact matches or partial keyword matches
    for (const [key, Icon] of Object.entries(ICON_MAP)) {
        if (lowerName.includes(key)) {
            // Safety check in case the icon import failed (undefined)
            if (Icon) return Icon;
        }
    }

    // 2. Default fallback
    return Circle;
}
