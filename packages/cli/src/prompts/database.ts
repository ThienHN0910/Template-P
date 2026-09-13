import * as p from '@clack/prompts';
import pc from 'picocolors';
import { DatabaseChoice } from '../types.js';

export async function promptDatabase(): Promise<DatabaseChoice> {
  const db = await p.select({
    message: 'Select Database for your Backend:',
    options: [
      {
        value: 'postgres',
        label: 'PostgreSQL',
        hint: 'recommended: enterprise relational DB with Docker Compose & ORM setup',
      },
      {
        value: 'mysql',
        label: 'MySQL / MariaDB',
        hint: 'popular relational DB with Docker Compose & ORM setup',
      },
      {
        value: 'sqlite',
        label: 'SQLite',
        hint: 'zero config, single local file, ideal for prototyping & lightweight apps',
      },
      {
        value: 'none',
        label: 'None / Configure later',
        hint: 'no database boilerplate',
      },
    ],
    initialValue: 'postgres',
  });

  if (p.isCancel(db)) {
    p.cancel(pc.yellow('Operation cancelled.'));
    process.exit(0);
  }

  return db as DatabaseChoice;
}
