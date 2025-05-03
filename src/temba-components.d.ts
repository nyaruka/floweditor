import { CanvasPositions } from 'store/editor';

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

export interface EditorState {
  flow: FlowContents;
  activeLanguage: string;
  fetching: boolean;
  saving: boolean;
}

export interface Workspace {
  uuid: string;
  name: string;
  country: string;
  languages: string[];
  timezone: string;
  date_style: DateStyle;
  anon: boolean;
}

export interface App {
  subscribe(arg0: (state: any, prevState: any) => void): () => void;
}

export interface TembaAppState {
  flow: FlowContents;
  isTranslating: boolean;
  languageNames: { [key: string]: string };
  languageCode: string;
  workspace: Workspace;

  getLanguage(): Language;
  getFlowResults(): InfoResult[];
  getResultByKey(id: any): InfoResult;

  setFlowContents(contents: FlowContents): void;
  setFlowInfo(info: any): void;
  setLanguageCode(code: string): void;

  // Update flow definition
  updateCanvasPositions(positions: CanvasPositions): void;
  removeNodes(uuids: string[]): void;
}

export interface TembaStore extends HTMLElement {
  postJSON(
    arg0: string,
    payload: { text: string; lang: { from: FlowContents; to: string } }
  ): Promise<any>;
  getApp: () => App;
  getState: () => TembaAppState;
  setKeyedAssets: (key: string, assets: string[]) => void;
  getKeyedAssets: () => { [key: string]: string[] };
}
