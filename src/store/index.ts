import { TembaStore } from 'temba-components';
export let store: TembaStore;
export const loadStore = () => {
  store = document.querySelector('temba-store') as TembaStore;
  if (!store) {
    return {} as TembaStore;
  }

  console.log('loaded store', store);
  return store;
};
