// test-utils.js
import { render, fireEvent } from '@testing-library/react';
import ConfigProvider from 'config';
import { FlowDefinition, FlowNode } from 'flowTypes';
import React from 'react';
import { Provider } from 'react-redux';
import createStore from 'store/createStore';
import { AssetType } from 'store/flowContext';
import { initialState } from 'store/state';
import { createUUID } from 'utils';

import config from './config';

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

export const EMPTY_TEST_ASSETS = {
  channels: { items: {}, type: AssetType.Channel },
  fields: { items: {}, type: AssetType.Field },
  languages: { items: {}, type: AssetType.Language },
  labels: { items: {}, type: AssetType.Label },
  results: { items: {}, type: AssetType.Result },
  flows: { items: {}, type: AssetType.Flow },
  recipients: { items: {}, type: AssetType.Contact || AssetType.Group || AssetType.URN }
};

const initial = initialState;
initial.flowContext.definition = TEST_DEFINITION;
initial.flowContext.assetStore = { ...EMPTY_TEST_ASSETS };

const store = createStore(initial);

const AllTheProviders = ({ children }: { children: any }) => {
  return (
    <ConfigProvider config={config as any}>
      <Provider store={store}>{children}</Provider>
    </ConfigProvider>
  );
};

const customRender = (ui: any, options?: any) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export const fireChangeText = (ele: any, value: string): void => {
  fireEvent.change(ele, { currentTarget: { value }, target: { value } });
};

export const mock = <T extends {}, K extends keyof T>(object: T, property: K, value: T[K]) => {
  Object.defineProperty(object, property, { get: () => value });
};

export const getCallParams = (mockCall: any) => {
  return mockCall.mock.calls[0];
};

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
