// TODO: Remove use of Function
// tslint:disable:ban-types
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import { object } from 'prop-types';
import * as React from 'react';
import * as config from '../../__test__/config';
import { ConfigProviderContext, endpointsPT, flowPT, languagesPT } from '../config';
import { FlowDefinition, FlowEditorConfig } from '../flowTypes';
import { AppState, createStore, initialState } from '../store';
import { getBaseLanguage } from '../utils';

export interface Resp {
    results: Array<{ [key: string]: any }>;
    total?: number;
}

export interface QueryString {
    [key: string]: string;
}

const initialContext: ConfigProviderContext = {
    endpoints: (config as FlowEditorConfig).endpoints,
    languages: (config as FlowEditorConfig).languages,
    flow: (config as FlowEditorConfig).flow
};

const initialTestState: AppState = {
    ...initialState,
    ...{
        flowContext: {
            ...initialState.flowContext,
            definition: require('../../__test__/flows/colors.json') as FlowDefinition
        }
    },
    ...{
        flowEditor: {
            ...initialState.flowEditor,
            editorUI: {
                ...initialState.flowEditor.editorUI,
                language: getBaseLanguage((config as FlowEditorConfig).languages)
            }
        }
    }
};

/**
 * Compose setup method for component tests
 */
export const createSetup = <P extends {}>(
    Component: React.ComponentClass | React.SFC,
    baseProps: P = {} as any,
    baseDuxState: AppState | Partial<AppState> = initialState,
    baseContext: ConfigProviderContext = initialContext,
    connectedChildren: boolean = false
) => (
    shallowRender: boolean = true,
    propOverrides: P | Partial<P> = {},
    duxStateOverrides = {} as AppState,
    contextOverrides = {} as ConfigProviderContext | Partial<ConfigProviderContext>,
    childContextTypeOverrides: { [key: string]: Function } = {}
) => {
    // Waiting on https://github.com/Microsoft/TypeScript/pull/1328
    const props = Object.assign({}, baseProps, propOverrides);
    const context = connectedChildren
        ? Object.assign({}, baseContext, {
              store: createStore(Object.assign({}, baseDuxState, duxStateOverrides))
          })
        : baseContext;
    // tslint:disable-next-line:ban-types
    const wrapper = (shallowRender ? (shallow as Function) : (mount as Function))(
        <Component {...props} />,
        {
            context,
            childContextTypes: Object.assign(
                {},
                {
                    store: object,
                    endpoints: endpointsPT,
                    languages: languagesPT,
                    flow: flowPT
                },
                childContextTypeOverrides
            )
        }
    );

    return {
        wrapper,
        props,
        context,
        instance: wrapper.instance()
    };
};
export const createSpy = (obj: Object | React.ComponentClass) => (instanceMethod: string) =>
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
export const restoreSpies = (...spies: jest.SpyInstance[]) =>
    spies.forEach(spy => spy.mockRestore());

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
): any => {
    return componentWrapper.find(`[${attributeName}="${specName}"]`);
};

const DEBUG = false;

export const timeStart = (name: string) => {
    if (DEBUG) {
        console.time(name);
    }
};

export const timeEnd = (name: string) => {
    if (DEBUG) {
        console.timeEnd(name);
    }
};
