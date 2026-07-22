import type { Preview } from '@storybook/react-vite';
import { ThemeProvider } from '../app/components/theme-provider';
import '../app/app.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo'
    }
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="light" storageKey="nps-ui-theme-storybook">
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;