import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function getBasePath() {
  const repository = process.env.GITHUB_REPOSITORY;

  if (!process.env.GITHUB_ACTIONS || !repository) {
    return '/';
  }

  const [owner, repo] = repository.split('/');
  return repo === `${owner}.github.io` ? '/' : `/${repo}/`;
}

export default defineConfig({
  base: getBasePath(),
  plugins: [react()],
});
