import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname);

export default {
  rootDir: root,
  displayName: 'root-tests',
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  testEnvironment: 'node',
  clearMocks: true,
  preset: 'ts-jest',
  moduleNameMapper: {
    '@src/(.*)': '<rootDir>/src/$1',
    '@test/(.*)': '<rootDir>/test/$1',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/src/'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts', '!src/index.ts'],
};
