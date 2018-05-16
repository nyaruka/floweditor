const { configure } = require('@storybook/react');

// automatically import all files ending in *.stories.tsx
const req = require.context('../stories', true, /.stories.tsx$/);

function loadStories(): void {
    req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
