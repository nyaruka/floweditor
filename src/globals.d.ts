declare interface FlowEditorConfig {
    path?: string;
    languages: { [iso: string]: string };
    endpoints: Endpoints;
    flow: string;
}

declare var __webpack_public_path__: string;
declare var __webpack_require__: { p: string };
declare var __flow_editor_config__: FlowEditorConfig;

declare namespace jest {
    interface Matchers<R> {
        toBeChecked(): void;
        toBeDisabled(): void;
        toBeEmpty(): void;
        toBePresent(): void;
        toContainReact(component: React.ReactElement<any>): void;
        toHaveClassName(className: string): void;
        toHaveHTML(html: string): void;
        toHaveProp(propKey: string, propValue?: any): void;
        toHaveRef(refName: string): void;
        toHaveState(stateKey: string, stateValue?: any): void;
        toHaveStyle(styleKey: string, styleValue?: any): void;
        toHaveTagName(tagName: string): void;
        toHaveText(text: string): void;
        toIncludeText(text: string): void;
        toHaveValue(value: any): void;
        toMatchElement(element: React.ReactElement<any>): void;
        toMatchSelector(selector: string): void;
    }
}

declare interface Spy {
    (...params: any[]): any;
    identity: string;
    and: SpyAnd;
    calls: Calls;
    mostRecentCall: { args: any[]; };
    argsForCall: any[];
    wasCalled: boolean;
}