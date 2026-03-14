import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.test.prisma',
  migrations: {
    path: 'prisma/migrations-test',
  },
  datasource: {
    // db: {
    url: 'file:./prisma/test.db',
    adapter: 'sqlite',
    // },
  },
  generators: {
    client: {
      provider: 'prisma-client',
      output: './generated/prisma-test',
    },
  },
});
