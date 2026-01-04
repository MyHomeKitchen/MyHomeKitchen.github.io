import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target directory
const TARGET_DIR = path.join(__dirname, '../src/assets/products');

// Simplified catalog for downloading
const PRODUCTS_TO_FETCH = [
    { name: 'Banana', keyword: 'banana' },
    { name: 'Tomato', keyword: 'tomato' },
    { name: 'Potato', keyword: 'potato' },
    { name: 'Onion', keyword: 'onion' },
    { name: 'Garlic', keyword: 'garlic' },
    { name: 'Lemon', keyword: 'lemon' },
    { name: 'Lime', keyword: 'lime' },
    { name: 'Orange', keyword: 'orange' },
    { name: 'Lettuce', keyword: 'lettuce' },
    { name: 'Spinach', keyword: 'spinach' },
    { name: 'Cucumber', keyword: 'cucumber' },
    { name: 'Broccoli', keyword: 'broccoli' },
    { name: 'Bell Pepper', keyword: 'bell pepper' },
    { name: 'Avocado', keyword: 'avocado' },
    { name: 'Grapes', keyword: 'grapes' },
    { name: 'Strawberry', keyword: 'strawberry' },
    { name: 'Blueberry', keyword: 'blueberry' },
    { name: 'Watermelon', keyword: 'watermelon' },
    { name: 'Zucchini', keyword: 'zucchini' },
    { name: 'Mushroom', keyword: 'mushroom' },
    { name: 'Corn', keyword: 'corn' },
    { name: 'Ginger', keyword: 'ginger' },
    { name: 'Eggs', keyword: 'eggs' },
    { name: 'Butter', keyword: 'butter' },
    { name: 'Yogurt', keyword: 'yogurt' },
    { name: 'Cream Cheese', keyword: 'cream cheese' },
    { name: 'Sour Cream', keyword: 'sour cream' },
    { name: 'Heavy Cream', keyword: 'milk cream' },
    { name: 'Orange Juice', keyword: 'orange juice' },
    { name: 'Tofu', keyword: 'tofu' },
    { name: 'Rice', keyword: 'rice grain' },
    { name: 'Pasta', keyword: 'pasta' },
    { name: 'Flour', keyword: 'flour' },
    { name: 'Sugar', keyword: 'sugar' },
    { name: 'Oats', keyword: 'oats' },
    { name: 'Bagels', keyword: 'bagel' },
    { name: 'Tortillas', keyword: 'tortilla' },
    { name: 'Quinoa', keyword: 'quinoa' },
    { name: 'Ground Beef', keyword: 'ground beef' },
    { name: 'Pork', keyword: 'pork meat' },
    { name: 'Bacon', keyword: 'bacon' },
    { name: 'Sausage', keyword: 'sausage' },
    { name: 'Ham', keyword: 'ham meat' },
    { name: 'Turkey', keyword: 'roasted turkey' },
    { name: 'Fish', keyword: 'fish fillet' },
    { name: 'Salmon', keyword: 'salmon fillet' },
    { name: 'Shrimp', keyword: 'shrimp' },
    { name: 'Canned Beans', keyword: 'beans' },
    { name: 'Lentils', keyword: 'lentils' },
    { name: 'Olive Oil', keyword: 'olive oil' },
    { name: 'Vegetable Oil', keyword: 'oil bottle' },
    { name: 'Salt', keyword: 'salt shaker' },
    { name: 'Pepper', keyword: 'black pepper' },
    { name: 'Spices', keyword: 'spices' },
    { name: 'Tomato Sauce', keyword: 'tomato sauce' },
    { name: 'Peanut Butter', keyword: 'peanut butter' },
    { name: 'Jam', keyword: 'fruit jam' },
    { name: 'Honey', keyword: 'honey jar' },
    { name: 'Mayonnaise', keyword: 'mayonnaise' },
    { name: 'Ketchup', keyword: 'ketchup' },
    { name: 'Mustard', keyword: 'mustard condiment' },
    { name: 'Soy Sauce', keyword: 'soy sauce' },
    { name: 'Vinegar', keyword: 'vinegar bottle' },
    { name: 'Soup', keyword: 'soup bowl' },
    { name: 'Cereal', keyword: 'cereal bowl' },
    { name: 'Chips', keyword: 'potato chips' },
    { name: 'Crackers', keyword: 'crackers' },
    { name: 'Nuts', keyword: 'mixed nuts' },
    { name: 'Coffee', keyword: 'coffee cup' },
    { name: 'Tea', keyword: 'tea cup' },
    { name: 'Soda', keyword: 'soda can' },
    { name: 'Water', keyword: 'water bottle' },
    { name: 'Beer', keyword: 'beer glass' },
    { name: 'Wine', keyword: 'wine bottle' },
    { name: 'Dish Soap', keyword: 'dish soap' },
    { name: 'Trash Bags', keyword: 'trash bag' },
    { name: 'Paper Towels', keyword: 'paper towel roll' },
    { name: 'Toilet Paper', keyword: 'toilet paper' },
    { name: 'Laundry Detergent', keyword: 'laundry detergent' },
    { name: 'Dishwasher Pods', keyword: 'dishwasher' },
    { name: 'Batteries', keyword: 'batteries' },
    { name: 'Light Bulbs', keyword: 'light bulb' },
    { name: 'Shampoo', keyword: 'shampoo bottle' },
    { name: 'Conditioner', keyword: 'conditioner bottle' },
    { name: 'Body Wash', keyword: 'body wash' },
    { name: 'Soap', keyword: 'soap bar' },
    { name: 'Toothpaste', keyword: 'toothpaste' },
    { name: 'Toothbrush', keyword: 'toothbrush' },
    { name: 'Deodorant', keyword: 'deodorant stick' },
    { name: 'Razor', keyword: 'razor shaving' },
    { name: 'Lotion', keyword: 'lotion bottle' },
    { name: 'Sunscreen', keyword: 'sunscreen' }
];

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded: ${path.basename(filepath)}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            console.error(`Error downloading ${url}: ${err.message}`);
            reject(err);
        });
    });
};

async function fetchAll() {
    console.log('Starting image downloads...');

    // Process in chunks to avoid overwhelming the server or network
    const CHUNK_SIZE = 5;
    for (let i = 0; i < PRODUCTS_TO_FETCH.length; i += CHUNK_SIZE) {
        const chunk = PRODUCTS_TO_FETCH.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(async (item) => {
            const filename = item.name.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '') + '.jpg';
            const filepath = path.join(TARGET_DIR, filename);

            // Check if exists
            if (fs.existsSync(filepath)) {
                // console.log(`Skipping ${filename}, already exists.`);
                // return;
            }

            // Using LoremFlickr
            const url = `https://loremflickr.com/300/300/${encodeURIComponent(item.keyword)}/all`;

            try {
                await downloadImage(url, filepath);
            } catch (e) {
                console.error(`Failed to fetch ${item.name}`);
            }
        }));
    }
    console.log('Done!');
}

fetchAll();
