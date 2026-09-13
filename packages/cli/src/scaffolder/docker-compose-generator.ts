import { ProjectConfig } from '../types.js';

export function generateDockerCompose(config: ProjectConfig): string | null {
  if (config.database === 'none' || config.database === 'sqlite') {
    return null;
  }

  const dbName = `${config.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_db`;

  if (config.database === 'postgres') {
    return `version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: ${config.projectName}-postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ${dbName}
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: ${config.projectName}-pgadmin
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - '5055:80'
    depends_on:
      - postgres

volumes:
  postgres_data:
`;
  }

  if (config.database === 'mysql') {
    return `version: '3.8'

services:
  mysql:
    image: mysql:8.4
    container_name: ${config.projectName}-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: ${dbName}
    ports:
      - '3306:3306'
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost', '-u', 'root', '-proot']
      interval: 5s
      timeout: 5s
      retries: 5

  adminer:
    image: adminer:latest
    container_name: ${config.projectName}-adminer
    restart: always
    ports:
      - '8080:8080'
    depends_on:
      - mysql

volumes:
  mysql_data:
`;
  }

  return null;
}
