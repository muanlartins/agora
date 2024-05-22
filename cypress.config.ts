import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      config.viewportHeight = 768;
      config.viewportWidth = 1024;
    },
  },
});
