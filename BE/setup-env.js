import readline from 'readline';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupEnv() {
  console.log('=== Daily Learning Tracker - Environment Setup ===\n');

  // Database type
  const dbType = await question('Database type (mysql/postgresql) [mysql]: ') || 'mysql';
  
  // Database credentials
  const dbHost = await question('Database host [localhost]: ') || 'localhost';
  const dbPort = await question(`Database port [${dbType === 'mysql' ? '3306' : '5432'}]: `) || (dbType === 'mysql' ? '3306' : '5432');
  const dbUser = await question('Database username: ');
  const dbPassword = await question('Database password: ');
  const dbName = await question('Database name: ');

  // Server port
  const serverPort = await question('Server port [3000]: ') || '3000';

  // JWT secrets
  console.log('\n--- JWT Configuration ---');
  const jwtSecret = await question('JWT Secret (min 32 characters) [auto-generate]: ');
  const jwtRefreshSecret = await question('JWT Refresh Secret (min 32 characters) [auto-generate]: ');

  // CORS origin
  const corsOrigin = await question('CORS Origin (frontend URL) [http://localhost:5173]: ') || 'http://localhost:5173';

  // Generate JWT secrets if not provided
  const generateSecret = () => {
    return crypto.randomBytes(32).toString('hex');
  };

  const finalJwtSecret = jwtSecret || generateSecret();
  const finalJwtRefreshSecret = jwtRefreshSecret || generateSecret();

  // Build DATABASE_URL
  const databaseUrl = dbType === 'mysql' 
    ? `mysql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`
    : `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=public`;

  // Build .env content
  const envContent = `# Server Configuration
PORT=${serverPort}
NODE_ENV=development

# Database Configuration
DATABASE_URL="${databaseUrl}"

# JWT Configuration
JWT_SECRET=${finalJwtSecret}
JWT_REFRESH_SECRET=${finalJwtRefreshSecret}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# CORS
CORS_ORIGIN=${corsOrigin}

# Redis (optional, for caching)
# REDIS_URL=redis://localhost:6379
`;

  // Write .env file
  const envPath = path.join(__dirname, '.env');
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Environment file created successfully!');
  console.log(`📁 Location: ${envPath}`);
  console.log('\n⚠️  Important: Make sure your database is running and the database exists!');
  console.log('\nNext steps:');
  console.log('1. Update Prisma schema if using MySQL (change provider to "mysql")');
  console.log('2. Run: npm run db:generate');
  console.log('3. Run: npm run db:push (or npm run db:migrate)');
  console.log('4. Run: npm run dev');

  rl.close();
}

setupEnv().catch(console.error);
