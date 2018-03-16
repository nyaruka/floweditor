// Custom module declarations

declare module '*.css';

declare module '*.scss';

declare module 'textarea-caret';

declare module 'get-input-selection';

declare module 'redux-render';

enum CharacterSet {
    Unicode = 'Unicode',
    GSM = 'GSM'
}

declare module 'split-sms' {
    export function split(
        message: string
    ): {
        characterSet: CharacterSet;
        parts: string[];
        bytes: number;
        length: number;
        remainingInPart: number;
    };
}

declare module 'jsplumb';

declare module 'auto-bind' {
    export function react(
        self: React.Component,
        options?: {
            include?: Array<string | RegExp>;
            exclude?: Array<string | RegExp>;
        }
    ): void;
}
