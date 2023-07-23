import db from './db/db';

async function setupDatabase() {
  try {
    // Try to create the ENUM type first
    await db.none(`CREATE TYPE linkPrecedence AS ENUM ('primary', 'secondary');`);
    console.log("Enum 'linkPrecedence' created");
  } catch (err) {
    // If the ENUM type already exists, catch the error and move on
    console.log("Enum 'linkPrecedence' already exists");
  }

  // Then create the table
  await db.none(`
    CREATE TABLE IF NOT EXISTS Contacts (
      id SERIAL PRIMARY KEY,
      phoneNumber VARCHAR(15),
      email VARCHAR(255),
      linkedId INT,
      linkPrecedence linkPrecedence NOT NULL,
      createdAt TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP NOT NULL,
      deletedAt TIMESTAMP
    );
  `);

  console.log("Database setup complete");
}

setupDatabase();
