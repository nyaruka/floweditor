import { TembaStore } from 'temba-components';
export let store: TembaStore;
export const loadStore = () => {
  store = document.querySelector('temba-store') as TembaStore;
  if (!store) {
    store = {} as TembaStore;
  }
  return store;
};
