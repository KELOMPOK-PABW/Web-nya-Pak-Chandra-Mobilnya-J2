
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

async function main() {
  console.log("=== Fixing Database (for all team members) ===");

  const url = new URL(process.env.DATABASE_URL);
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: url.port,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  });

  console.log("\n1. Checking users table password column...");
  try {
    await connection.execute("ALTER TABLE users CHANGE COLUMN password password_hash VARCHAR(191) NOT NULL");
    console.log("   Renamed password -> password_hash");
  } catch (e) {
    if (e.code === "ER_BAD_FIELD_ERROR") {
      console.log("   password_hash already exists, skipping");
    } else throw e;
  }

  console.log("\n2. Checking user_roles table...");
  const [userRolesTables] = await connection.execute("SHOW TABLES LIKE 'user_roles'");
  if (userRolesTables.length === 0) {
    await connection.execute(`
      CREATE TABLE user_roles (
        user_id INT NOT NULL,
        role_id INT NOT NULL,
        PRIMARY KEY (user_id, role_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log("   Created user_roles table");
  } else {
    console.log("   user_roles already exists");
  }

  console.log("\n3. Checking role table contents...");
  const [existingRoles] = await connection.execute("SELECT name_role FROM role");
  const existingRoleNames = existingRoles.map(r => r.name_role);

  const requiredRoles = ["buyer", "seller", "kurir"];
  for (const roleName of requiredRoles) {
    if (!existingRoleNames.includes(roleName)) {
      await connection.execute("INSERT INTO role (name_role) VALUES (?)", [roleName]);
      console.log(`   Added role: ${roleName}`);
    }
  }

  console.log("\nAll database fixes complete!");
  await connection.end();
}

main().catch((err) => {
  console.error("\nERROR:", err);
  process.exit(1);
});
