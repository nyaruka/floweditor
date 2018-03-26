import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { ConfigProviderContext } from '../config';
import { AppState, createStore, initialState } from '../store';

export interface Resp {
    results: Array<{ [key: string]: any }>;
    total?: number;
}

export interface QueryString {
    [key: string]: string;
}

/**
 * Compose setup method for component tests
 */
export const createSetup = <P extends {}, C extends ConfigProviderContext = ConfigProviderContext>(
    Component: React.ComponentClass | React.SFC,
    baseProps: P = {} as any,
    context: C | Partial<C> = {},
    childContextTypes: { [key: string]: Function } = {}
) => (propOverrides: P | Partial<P> = {}, shallowRender: boolean = false) => {
    // Waiting on https://github.com/Microsoft/TypeScript/pull/1328
    const props = Object.assign({}, baseProps, propOverrides);
    // prettier-ignore
    const wrapper = (
        // tslint:disable-next-line:ban-types
        shallowRender ? (shallow as Function) : (mount as Function)
    )(
        <Component {...props} />, { context }
    );

    return {
        wrapper,
        props,
        context
    };
};

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
