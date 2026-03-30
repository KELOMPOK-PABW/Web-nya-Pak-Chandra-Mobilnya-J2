require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const mariadb = require('mariadb');

const app = express();


const connectionString = process.env.DATABASE_URL
const pool = mariadb.createPool(connectionString);
const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({ adapter });

const PORT = process.env.PORT || 3000;

app.use(express.json());


app.get('/', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ message: 'Welcome to API', database: 'Connected' });
  } catch (error) {
    console.error('Database failed:', error);
    res.status(500).json({ message: 'Database failed', error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
