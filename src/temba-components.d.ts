export interface TembaStore extends HTMLElement {
  setKeyedAssets: (key: string, assets: string[]) => void;
  getKeyedAssets: () => { [key: string]: string[] };
}
