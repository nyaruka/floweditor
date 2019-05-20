// test-utils.js
import ConfigProvider from 'config';
import { FlowDefinition, FlowNode } from 'flowTypes';
import React from 'react';
import { Provider } from 'react-redux';
import { render } from 'react-testing-library';
import createStore from 'store/createStore';
import { initialState } from 'store/state';
import { createUUID } from 'utils';

import * as config from './config';

export const TEST_NODE: FlowNode = {
  uuid: createUUID(),
  actions: [],
  exits: [{ uuid: createUUID() }]
};

export const TEST_DEFINITION: FlowDefinition = {
  uuid: createUUID(),
  language: 'eng',
  name: 'Favorites',
  nodes: [TEST_NODE],
  localization: {},
  revision: 1,
  _ui: null
};

const initial = initialState;
initial.flowContext.definition = TEST_DEFINITION;

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
export * from 'react-testing-library';

// override render method
export { customRender as render };
