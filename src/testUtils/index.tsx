// TODO: Remove use of Function
// tslint:disable:ban-types
import { ConfigProviderContext, fakePropType } from 'config/ConfigProvider';
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import { FlowDefinition, FlowEditorConfig } from 'flowTypes';
import mutate, { Query } from 'immutability-helper';
import * as React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import createStore from 'store/createStore';
import { RenderNodeMap } from 'store/flowContext';
import { getFlowComponents } from 'store/helpers';
import AppState, { initialState } from 'store/state';
import config from 'test/config';
import * as matchers from 'testUtils/matchers';
import { merge, set } from 'utils';

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

const flowEditorConfig: FlowEditorConfig = config;

export const configProviderContext: ConfigProviderContext = {
  config: flowEditorConfig
};

export const setMock = (implementation?: (...args: any[]) => any): Query<jest.Mock> =>
  set(jest.fn(implementation));

/**
 * Compose setup method for component tests
 */
export const composeSetup = <P extends {}>(
  Component: React.ComponentClass | React.SFC,
  baseProps: P = {} as any,
  baseDuxState: AppState | Partial<AppState> = baseState,
  baseContext: ConfigProviderContext = configProviderContext
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
  baseDuxState: AppState | Partial<AppState> = baseState,
  baseContext: ConfigProviderContext = configProviderContext
) => ({
  setup: composeSetup<P>(Component, baseProps, baseDuxState, baseContext),
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
