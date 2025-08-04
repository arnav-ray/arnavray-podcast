import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify/functions';

export default defineConfig({
  output: 'static',
  site: 'https://podcast.arnavray.ca'
});
