interface SplitOptions {
    summary?: boolean;
    characterset?: CharacterSet;
}

interface AutoBindOptions {
    include?: Array<string | RegExp>;
    exclude?: Array<string | RegExp>;
}

declare interface FlowEditorConfig {
    path?: string;
    languages: { [iso: string]: string };
    endpoints: Endpoints;
    flow: string;
}

declare var __webpack_public_path__: string;
declare var __webpack_require__: { p: string };
declare var __flow_editor_config__: FlowEditorConfig;

interface SplitStats {
    characterSet: CharacterSet;
    parts: string[];
    bytes: number;
    length: number;
    remainingInPart: number;
}

// Base config provided via Webpack's 'externals' feature
declare module 'Config';

// Custom module declarations
declare module 'textarea-caret';

declare module 'get-input-selection';

declare module 'split-sms' {
    export function split(message: string, options?: SplitOptions): SplitStats;
}

declare module 'jsplumb';

declare module 'auto-bind' {
    export function react(self: React.Component, options?: AutoBindOptions): void;
}

declare module '@ycleptkellan/substantive' {
    export const substArr: (arg: any) => boolean;
    export const substStr: (arg: any) => boolean;
    export const substObj: (arg: any) => boolean;
}
