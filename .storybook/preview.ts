import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'abyss',
      values: [
        { name: 'abyss', value: '#000000' },
        { name: 'oil', value: '#0a0a0a' },
        { name: 'steel', value: '#141414' },
      ],
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;