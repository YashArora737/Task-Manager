import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { config } from './config/env';
import { prisma } from './lib/prisma';

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
  });

  const shutdown = async () => {
    console.log('\n⚡ Graceful shutdown...');
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main();
