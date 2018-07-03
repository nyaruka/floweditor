// TODO: Remove use of Function
// tslint:disable:ban-types
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import mutate, { Query } from 'immutability-helper';
import * as React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { ConfigProviderContext } from '../config';
import { fakePropType } from '../config/ConfigProvider';
import { FlowDefinition, FlowEditorConfig } from '../flowTypes';
import AssetService from '../services/AssetService';
import { AppState, createStore, initialState } from '../store';
import { RenderNodeMap } from '../store/flowContext';
import { getFlowComponents } from '../store/helpers';
import * as matchers from '../testUtils/matchers';
import { merge, set } from '../utils';

// we need to use require syntax to bust implicit any
const config = require('../../__test__/config');

const boring: FlowDefinition = require('../../__test__/flows/boring.json');

// force our matchers to be read in
const match = matchers;

export interface Resp {
    assets: Array<{ [key: string]: any }>;
}

export interface QueryString {
    [key: string]: string;
}

export const contextTypes: { [key: string]: Function } = {
    store: fakePropType,
    endpoints: fakePropType,
    flow: fakePropType,
    assetService: fakePropType
};

export const baseState: AppState = mutate(initialState, {
    flowContext: merge({
        definition: require('../../__test__/flows/colors.json') as FlowDefinition
    }),
    flowEditor: {
        editorUI: merge({
            language: { id: 'eng', name: 'English' }
        })
    }
});

const flowEditorConfig: FlowEditorConfig = config;

export const configProviderContext: ConfigProviderContext = {
    endpoints: flowEditorConfig.endpoints,
    flow: flowEditorConfig.flow,
    assetService: new AssetService(flowEditorConfig)
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
        context = mutate(context, contextOverrides);
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
export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

/**
 * Restore spy mocks (distinct from mocks created w/ jest.fn()).
 * Use to declaratively restore multiple spy mocks,
 * otherwise just call .mockRestore() on lone spy.
 */
export const restoreSpies = (...spies: Array<jest.SpyInstance<any>>) =>
    spies.forEach(spy => spy.mockRestore());

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
    Component: React.ComponentClass | React.SFC,
    baseProps: P = {} as any,
    baseDuxState: AppState | Partial<AppState> = baseState,
    baseContext: ConfigProviderContext = configProviderContext
) => ({
    setup: composeSetup<P>(Component, baseProps, baseDuxState, baseContext),
    spyOn: composeSpy(Component)
});

export const prepMockDuxState = (): { testNodes: RenderNodeMap; mockDuxState: AppState } => {
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
