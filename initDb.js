const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function initDb() {
    try {
        console.log('Connecting to MySQL Server at ' + (process.env.DB_HOST || 'localhost'));
        
        // Connect without a specific database to create it if it doesn't exist
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true // required to run schema dump
        });

        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema.sql...');
        await connection.query(schema);
        
        console.log('Database initialized successfully!');
        await connection.end();
        process.exit(0);

    } catch (err) {
        console.error('Failed to initialize database: ', err.message);
        process.exit(1);
    }
}

initDb();
