// test-utils.js
import ConfigProvider from 'config';
import React from 'react';
import { Provider } from 'react-redux';
import { render } from 'react-testing-library';
import createStore from 'store/createStore';
import { initialState } from 'store/state';

import * as config from './config';

const store = createStore(initialState);

const AllTheProviders = ({ children }: { children: any }) => {
  return (
    <ConfigProvider config={config as any}>
      <Provider store={store}>{children}</Provider>
    </ConfigProvider>
  );
};

const customRender = (ui: any, options?: any) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from "react-testing-library";

// override render method
export { customRender as render };
