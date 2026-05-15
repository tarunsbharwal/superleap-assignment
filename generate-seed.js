import { v4 as uuidv4 } from 'uuid';
import { writeFileSync } from 'fs';

const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];
const sources = ['website', 'referral', 'campaign', 'direct'];
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const leads = Array.from({ length: 50 }).map(() => {
    const firstName = getRandomItem(firstNames);
    const lastName = getRandomItem(lastNames);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const now = new Date();
    const createdAt = new Date(now.getTime() - Math.random() * 10000000000).toISOString();
    
    return {
        id: uuidv4(),
        name,
        email,
        phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
        status: getRandomItem(statuses),
        source: getRandomItem(sources),
        created_at: createdAt,
        updated_at: createdAt
    };
});

writeFileSync('./db.json', JSON.stringify({ leads }, null, 2));
console.log('Seed data generated at db.json');
