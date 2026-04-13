const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

async function verifySetup() {
    console.log('--- Hostel Management System Verification ---');
    
    // 1. Check .env
    console.log('1. Checking Environment Variables...');
    if (!process.env.DB_HOST || !process.env.DB_NAME) {
        console.error('   ❌ Error: .env file is missing or incomplete.');
        return;
    }
    console.log('   ✅ .env loaded.');

    // 2. Check Database Connection
    console.log('2. Connecting to MySQL...');
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });
        console.log('   ✅ Database connected successfully.');

        // 3. Check Tables
        console.log('3. Checking Tables...');
        const [tables] = await connection.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        const requiredTables = ['students', 'rooms', 'fees', 'staff'];
        
        let allTablesExist = true;
        requiredTables.forEach(table => {
            if (tableNames.includes(table)) {
                console.log(`   ✅ Table "${table}" exists.`);
            } else {
                console.error(`   ❌ Error: Table "${table}" is missing.`);
                allTablesExist = false;
            }
        });

        if (allTablesExist) {
            console.log('\n✨ ALL SYSTEMS READY! You can now run: node server.js');
        } else {
            console.log('\n⚠️ Some tables are missing. Try running: node initDb.js');
        }

        await connection.end();
    } catch (err) {
        console.error('   ❌ Database connection failed: ', err.message);
        console.log('\n💡 Tip: Make sure MySQL is running and your password in .env is correct.');
    }
}

verifySetup();
