// Base config provided via Webpack's 'externals' feature
declare module 'Config';

// Custom module declarations
declare module 'textarea-caret';

declare module 'get-input-selection';

declare module 'split-sms';

declare module 'jsplumb';

interface AutoBindOptions {
    include?: Array<string | RegExp>;
    exclude?: Array<string | RegExp>;
}

declare module 'auto-bind' {
    export function react(self: React.Component, options?: AutoBindOptions): void;
}
