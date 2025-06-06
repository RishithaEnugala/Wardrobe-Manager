const stringSimilarity = require('string-similarity');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

const { db } = require('./db');

const vocabulary = {
    categories: [
        'top', 
        'trousers', 
        'dresses', 
        'skirts', 
        'jackets', 
        'coats', 
        'shirts', 
        'shorts', 
        'blouses', 
        'suits', 
        'activewear', 
        'formalwear', 
        'outerwear', 
        'sweaters', 
        'cardigans', 
        'accessories'
    ],    
    genders: ['male', 'female', 'unisex'],
    seasons: ['spring', 'summer', 'autumn', 'winter', 'rainy', 'all_season'],
    statuses: ['clean', 'in_use', 'laundry'],
    colors: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown', 'gray'],
};

const synonyms = {
    categories: {
        pants: 'trousers',
        shirt: 'top',
        skirts: 'dresses',
        outfit: null,
    },
    genders: {
        men: 'male',
        women: 'female',
        boys: 'male',
        girls: 'female',
    },
    seasons: {
        winterwear: 'winter',
        summerwear: 'summer',
        rainywear: 'rainy',
    },
    general: {
        all: 'give all clothes',
        everything: 'give all clothes',
    }
};

let context = {
    previousQueryFilters: {},
};

const fuzzyMatch = (word, list) => {
    const matches = stringSimilarity.findBestMatch(word, list);
    return matches.bestMatch.rating > 0.6 ? matches.bestMatch.target : null;
};

const nlpParser = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    if (lowerCaseQuery.includes(synonyms.general.all) || lowerCaseQuery.includes(synonyms.general.everything)) {
        return {
            category: null,
            gender: null,
            season: null,
            status: null,
            color: null,
        };
    }

    const tokens = tokenizer.tokenize(query.toLowerCase());

    const filters = {
        category: null,
        gender: null,
        season: null,
        status: null,
        color: null,
    };

    tokens.forEach((token) => {
        const category = fuzzyMatch(token, vocabulary.categories) || synonyms.categories[token];
        if (category) filters.category = category;

        const gender = fuzzyMatch(token, vocabulary.genders) || synonyms.genders[token];
        if (gender) filters.gender = gender;

        const season = fuzzyMatch(token, vocabulary.seasons) || synonyms.seasons[token];
        if (season) filters.season = season;

        const status = fuzzyMatch(token, vocabulary.statuses);
        if (status) filters.status = status;

        const color = fuzzyMatch(token, vocabulary.colors);
        if (color) filters.color = color;
    });

    return Object.keys(filters).some(key => filters[key]) ? filters : context.previousQueryFilters;
};

const buildSQLQuery = (filters) => {
    let query = "SELECT * FROM wardrobe_items WHERE 1=1";

    if (filters.category) query += ` AND category = '${filters.category}'`;
    if (filters.gender) query += ` AND gender = '${filters.gender}'`;
    if (filters.season) query += ` AND season = '${filters.season}'`;
    if (filters.status) query += ` AND status = '${filters.status}'`;
    if (filters.color) query += ` AND color_palette LIKE '%${filters.color}%'`;

    return query;
};

const fetchItems = async (sqlQuery) => {
    try {
        const [rows] = await db.query(sqlQuery); 
        console.log("Fetched rows:", rows); 
        return Array.isArray(rows) ? rows : [];
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
};

const generateResponse = (items) => {
    if (items.length === 0) {
        return "Sorry, no items match your criteria.";
    }

    return items.map(item => {
        return {
            id: item.id,
            category: item.category,
            gender: item.gender,
            material: item.material,
            color_palette: item.color_palette,
            season: item.season,
            dress_type: item.dress_type,
            status: item.status,
            image_url: item.image_url,
            brand: item.brand,
            care_instructions: item.care_instructions,
            location: item.location,
            last_worn: item.last_worn,
            date_added: item.date_added,
            name: item.name
        };
    });
};

const getClothes = async (userQuery) => {
    const filters = nlpParser(userQuery);

    context.previousQueryFilters = filters;

    const sqlQuery = buildSQLQuery(filters);
    console.log('Generated SQL Query:', sqlQuery);  
    const items = await fetchItems(sqlQuery);  

    return generateResponse(items);
};

module.exports = { getClothes };
