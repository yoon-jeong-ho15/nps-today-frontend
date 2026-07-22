import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    "../app/**/*.mdx",
    "../app/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../components/**/*.mdx",
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp"
  ],
  framework: "@storybook/react-vite",
  viteFinal: async (config) => {
    return mergeConfig(config, {
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          "~": path.resolve(process.cwd(), "app"),
        },
      },
    });
  },
};
export default config;