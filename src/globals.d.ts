declare interface FlowEditorConfig {
    languages: { [iso: string]: string };
    endpoints: Endpoints;
    flow: string;
    path?: string;
    assetHost?: string;
}
