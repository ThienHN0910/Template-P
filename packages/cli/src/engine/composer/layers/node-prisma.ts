import type { FileOperation } from '../operations.js';

export function getNodePrismaOperations(
  provider: 'postgresql' | 'sqlserver' | 'mysql' | 'sqlite'
): FileOperation[] {
  const schemaPrisma = `// Prisma Schema for Node.js 24 Backend
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${provider}"
  url = env("DATABASE_URL")
}

model Product {
  id          String   @id @default(uuid())
  name        String
  description String
  price       Decimal
  createdAt   DateTime @default(now())
}
`;

  const dbTs = `import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export { PrismaClient };
export default prisma;
`;

  return [
    {
      kind: 'createFile',
      path: 'apps/backend/prisma/schema.prisma',
      content: schemaPrisma,
    },
    {
      kind: 'createFile',
      path: 'apps/backend/src/db.ts',
      content: dbTs,
    },
    {
      kind: 'mergeJson',
      path: 'apps/backend/package.json',
      data: {
        dependencies: {
          '@prisma/client': '^7.0.0',
        },
        devDependencies: {
          prisma: '^7.0.0',
        },
      },
    },
  ];
}
