import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/e2e',use:{baseURL:'http://127.0.0.1:3017'},webServer:{command:'npm run start -- --hostname 127.0.0.1 --port 3017',url:'http://127.0.0.1:3017',reuseExistingServer:!process.env.CI}});
