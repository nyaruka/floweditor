declare interface FlowEditorConfig {
    path?: string;
    languages: { [iso: string]: string };
    endpoints: Endpoints;
    flow: string;
}

declare var __webpack_public_path__: string;
declare var __webpack_require__: { p: string };
declare var __flow_editor_config__: FlowEditorConfig;