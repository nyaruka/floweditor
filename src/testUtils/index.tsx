/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Remove use of Function
// tslint:disable:ban-types
import { ConfigProviderContext, fakePropType } from 'config/ConfigProvider';
import { FlowTypes } from 'config/interfaces';
import { info } from 'core-js/core/log';
import { keyFor } from 'core-js/fn/symbol';
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import { FlowDefinition, FlowEditorConfig } from 'flowTypes';
import mutate, { Query } from 'immutability-helper';
import * as React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { loadStore } from 'store';
import createStore from 'store/createStore';
import { RenderNodeMap } from 'store/flowContext';
import { getFlowComponents } from 'store/helpers';
import AppState, { initialState } from 'store/state';
import { App, FlowContents, FlowInfo, InfoResult, TembaAppState } from 'temba-components';
import { getFlowEditorConfig } from 'test/config';
import * as matchers from 'testUtils/matchers';
import { createUUID, merge, set } from 'utils';

// we need to use require syntax to bust implicit any
const boring: FlowDefinition = require('test/flows/boring.json');

// force our matchers to be read in
const match = matchers;

export interface Resp {
  assets: Array<{ [key: string]: any }>;
}

export interface QueryString {
  [key: string]: string;
}

export const contextTypes: { [key: string]: Function } = {
  config: fakePropType,
  store: fakePropType,
  assetService: fakePropType
};

export const baseState: AppState = mutate(initialState, {
  flowContext: merge({
    definition: require('test/flows/colors.json') as FlowDefinition
  }),
  editorState: merge({
    language: { id: 'eng', name: 'English' }
  })
});

export const getConfigProviderContext = (
  flowType: FlowTypes = FlowTypes.MESSAGING
): ConfigProviderContext => {
  const flowEditorConfig = getFlowEditorConfig(flowType);
  const win = window as any;
  if (win.isMobile && win.isMobile()) {
    flowEditorConfig.mutable = false;
  }

  const configProviderContext = { config: flowEditorConfig };
  return configProviderContext;
};

export const setMock = (implementation?: (...args: any[]) => any): Query<jest.Mock> =>
  set(jest.fn(implementation));

/**
 * Compose setup method for component tests
 */
export const composeSetup = <P extends {}>(
  Component: React.ComponentClass | React.SFC,
  baseProps: P = {} as any,
  flowType: FlowTypes = FlowTypes.MESSAGING,
  baseDuxState: AppState | Partial<AppState> = baseState,
  baseContext: ConfigProviderContext = getConfigProviderContext(flowType)
) => (
  shallowRender: boolean = true,
  propOverrides: Query<P | Partial<P>> = {},
  duxStateOverrides: Query<AppState | Partial<AppState>> = {},
  contextOverrides: Query<ConfigProviderContext | Partial<ConfigProviderContext>> = {},
  childContextTypeOverrides: { [key: string]: Function } = {},
  children: Array<JSX.Element | React.ComponentClass | React.SFC> = []
) => {
  const props = mutate(baseProps, propOverrides);
  const store = createStore(mutate(baseDuxState, duxStateOverrides) as AppState);
  let context = mutate(baseContext, merge({ store }));

  if (Object.keys(duxStateOverrides).length > 0) {
    context = mutate(context, duxStateOverrides);
  }

  if (Object.keys(contextOverrides).length > 0) {
    context = mutate(context, contextOverrides as ConfigProviderContext);
  }

  const childContextTypes: { [contextProp: string]: Function } = mutate(
    contextTypes,
    childContextTypeOverrides
  );
  // tslint:disable-next-line:ban-types
  const wrapper = (shallowRender ? (shallow as Function) : (mount as Function))(
    <Component {...props}>{children}</Component>,
    {
      context,
      childContextTypes
    }
  );

  return {
    wrapper,
    props,
    context,
    instance: wrapper.instance()
  };
};

export const composeSpy = (obj: Object | React.ComponentClass) => (instanceMethod: string) =>
  jest.spyOn((obj as React.ComponentClass).prototype || obj, instanceMethod as any);

/**
 * Wait for promises in queue to resolve
 */
export const flushPromises = () => new Promise((resolve: any) => setImmediate(resolve));

/**
 * Restore spy mocks (distinct from mocks created w/ jest.fn()).
 * Use to declaratively restore multiple spy mocks,
 * otherwise just call .mockRestore() on lone spy.
 */
export const restoreSpies = (...spies: Array<jest.SpyInstance<any>>) =>
  spies.forEach((spy: any) => spy.mockRestore());

// To-do: type this method's output, can pass it prop generic ingested by getComponentTestUtils
/**
 * NOTE: borrowed from EventBrite: https://github.com/eventbrite/javascript/blob/master/react/testing.md#finding-nodes
 * Finds all instances of components in the rendered `componentWrapper` that are DOM components
 * with the `data-spec` attribute matching `name`.
 * @param {ReactWrapper|ShallowWrapper} componentWrapper - Rendered componentWrapper (result of mount, shallow, or render)
 * @param  {string} snacName - Name of `data-spec` attribute value to find
 * @param {string|Function} (Optional) typeFilter - (Optional) Expected type of the wrappers (defaults to all HTML tags)
 * @returns {ReactWrapper|ReactWrapper[]|ShallowWrapper|ShallowWrapper[]} Matching DOM components
 */
export const getSpecWrapper = (
  componentWrapper: ReactWrapper<{}, {}> | ShallowWrapper<{}, {}>,
  specName: string,
  attributeName: string = 'data-spec'
): any => componentWrapper.find(`[${attributeName}="${specName}"]`);

export const composeDuxState = (
  query: Query<AppState | Partial<AppState>> = {},
  duxState = baseState
) => mutate(duxState, query);

export const composeComponentTestUtils = <P extends {}>(
  Component: React.ComponentClass | React.SFC | any,
  baseProps: P = {} as any,
  flowType: FlowTypes = FlowTypes.MESSAGING,
  baseDuxState: AppState | Partial<AppState> = baseState,
  baseContext: ConfigProviderContext = getConfigProviderContext(flowType)
) => ({
  setup: composeSetup<P>(Component, baseProps, flowType, baseDuxState, baseContext),
  spyOn: composeSpy(Component)
});

export const prepMockDuxState = (): {
  testNodes: RenderNodeMap;
  mockDuxState: AppState;
} => {
  const testNodes = getFlowComponents(boring).renderNodeMap;

  return {
    testNodes,
    mockDuxState: {
      ...initialState,
      flowContext: {
        ...initialState.flowContext,
        definition: boring,
        nodes: testNodes
      }
    }
  };
};

export const createMockStore: Function = configureStore([thunk]);

export const mock = <T extends {}, K extends keyof T>(object: T, property: K, value: T[K]) => {
  Object.defineProperty(object, property, { get: () => value });
};

interface StoreOverrides {
  languageCode?: string;
  isTranslating?: boolean;
  results?: InfoResult[];
}

export const setupStore = ({
  languageCode = 'eng',
  isTranslating = false,
  results = []
}: StoreOverrides = {}) => {
  const languageNames: { [key: string]: string } = { eng: 'English', spa: 'Spanish' };
  const store = loadStore();
  mock(store, 'getState', () => {
    const state: TembaAppState = {
      isTranslating,
      languageCode,
      languageNames,
      workspace: {
        uuid: createUUID(),
        name: 'Test Workspace',
        languages: ['eng', 'spa'],
        timezone: 'UTC',
        date_style: 'MM/DD/YYYY',
        country: 'US',
        anon: false
      },
      flowDefinition: null,
      flowInfo: null,
      setFlowInfo: (info: FlowInfo) => {},
      setFlowContents: (contents: FlowContents) => {},
      setLanguageCode: (code: string) => {},
      getLanguage: () => ({ name: languageNames[languageCode], code: languageCode }),
      getFlowResults: () => results,
      getResultByKey: (key: any) => {
        const result = results.find(r => r.key === key);
        return result || null;
      },
      updateCanvasPositions: (positions: any) => {},
      removeNodes: (uuids: string[]) => {}
    };
    return state;
  });

  mock(store, 'getApp', () => {
    const app: App = {
      subscribe: (callback: (state: any, prevState: any) => void) => {
        // Mock implementation of subscribe
        return () => {
          // Mock unsubscribe function
        };
      }
    };
    return app;
  });

  mock(store, 'resolveUsers', async (objects: any[], fields: string[]) => {
    // mock implementation to add UUIDs to users that don't have them
    objects.forEach(obj => {
      fields.forEach(field => {
        if (obj[field] && obj[field].email && !obj[field].uuid) {
          obj[field].uuid = `mock-uuid-${obj[field].email.replace('@', '-at-')}`;
        }
      });
    });
  });
};
