export interface InfoResult {
  key: string;
  name: string;
  categories: string[];
  node_uuids: string[];
}

export interface ObjectRef {
  uuid: string;
  name: string;
}

export interface TypedObjectRef extends ObjectRef {
  type: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface FlowInfo {
  results: InfoResult[];
  dependencies: TypedObjectRef[];
  counts: { nodes: number; languages: number };
  locals: string[];
}

export interface FlowContents {
  definition: FlowDefinition;
  info: FlowInfo;
}

export interface TembaStore extends HTMLElement {
  setKeyedAssets: (key: string, assets: string[]) => void;
  getKeyedAssets: () => { [key: string]: string[] };
  getLanguage(code: string): Language;

  // flow specific cache
  loadFlow: (uuid: string, revision: string = 'latest') => Promise<FlowContents>;
  setFlowContents: (contents: FlowContents) => void;
  setFlowInfo: (info: FlowInfo) => void;
  getFlowContents(): FlowContents;
  getFlowResults(): InfoResult[];
  getFlowLanguages(): Language[];
}
