// TODO: Remove use of Function
// tslint:disable:ban-types
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import mutate, { Query } from 'immutability-helper';
import { object } from 'prop-types';
import * as React from 'react';
import * as config from '../../__test__/config';
import { ConfigProviderContext, endpointsPT, flowPT, languagesPT } from '../config';
import { Operators } from '../config/operatorConfigs';
import { Types } from '../config/typeConfigs';
import {
    AnyAction,
    CallWebhook,
    Case,
    ChangeGroups,
    ContactProperties,
    Exit,
    FlowDefinition,
    FlowEditorConfig,
    FlowNode,
    Group,
    Methods,
    Router,
    SendEmail,
    SendMsg,
    SetContactProperty,
    StartFlow,
    StartFlowArgs,
    StartFlowExitNames,
    SwitchRouter,
    Wait,
    WaitTypes,
    Field
} from '../flowTypes';
import { AppState, createStore, initialState, SearchResult } from '../store';
import { capitalize, getBaseLanguage, merge, set } from '../utils';
import { SetContactField, SetRunResult } from '../flowTypes';

const { results: groupsResults } = require('../../assets/groups.json');

export interface Resp {
    results: Array<{ [key: string]: any }>;
    total?: number;
}

export interface QueryString {
    [key: string]: string;
}

export const contextTypes: { [key: string]: Function } = {
    store: object,
    endpoints: endpointsPT,
    languages: languagesPT,
    flow: flowPT
};

export const baseState: AppState = {
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

export const configProviderContext: ConfigProviderContext = {
    endpoints: (config as FlowEditorConfig).endpoints,
    languages: (config as FlowEditorConfig).languages,
    flow: (config as FlowEditorConfig).flow
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
    childContextTypeOverrides: { [key: string]: Function } = {}
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
        <Component {...props} />,
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
export const restoreSpies = (...spies: jest.SpyInstance[]) =>
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

/**
 * Create a select control option
 */
export const genSelectOption = ({ label }: { label: string }) => ({
    label: capitalize(label.trim()),
    labelKey: 'name',
    valueKey: 'id'
});

export const genSendMsgAction = ({
    uuid = 'send_msg-0',
    text = 'Hey!',
    all_urns = false
}: {
    uuid?: string;
    text?: string;
    // tslint:disable-next-line:variable-name
    all_urns?: boolean;
} = {}): SendMsg => ({
    type: Types.send_msg,
    uuid,
    text,
    all_urns
});

export const genSendEmailAction = ({
    uuid = 'send_email-0',
    subject = 'New Sign Up',
    body = '@run.results.name just signed up.',
    emails = ['jane@exaumple.com']
}: {
    uuid?: string;
    subject?: string;
    body?: string;
    emails?: string[];
} = {}): SendEmail => ({
    uuid,
    type: Types.send_email,
    subject,
    body,
    emails
});

export const genCallWebhookAction = ({
    uuid = 'call_webhook-0',
    url = 'https://www.example.com',
    method = Methods.GET
}: {
    uuid?: string;
    url?: string;
    method?: Methods;
} = {}): CallWebhook => ({
    uuid,
    type: Types.call_webhook,
    url,
    method
});

export const genAddGroupsAction = ({
    uuid = 'add_contact_groups-0',
    groups = groupsResults
}: { uuid?: string; groups?: Group[] } = {}): ChangeGroups => ({
    uuid,
    type: Types.add_contact_groups,
    groups
});

export const genStartFlowAction = ({
    uuid = 'start_flow-0',
    flow_name = 'Colors',
    flow_uuid = 'colors-0'
}: {
    uuid?: string;
    // tslint:disable-next-line:variable-name
    flow_name?: string;
    // tslint:disable-next-line:variable-name
    flow_uuid?: string;
} = {}): StartFlow => ({
    type: Types.start_flow,
    uuid: flow_uuid,
    flow_name: capitalize(flow_name.trim()),
    flow_uuid
});

export const genSetContactPropertyAction = ({
    uuid = 'set_contact_property-0',
    property = ContactProperties.Email,
    value = 'jane@example.com'
}: {
    uuid?: string;
    property?: string;
    value?: string;
} = {}): SetContactProperty => ({
    uuid,
    property,
    value,
    type: Types.set_contact_property
});

export const genSetContactFieldAction = ({
    uuid = 'set_contact_field-0',
    field = {
        key: 'age',
        name: 'Age'
    },
    value = '25'
}: { uuid?: string; field?: Field; value?: string } = {}): SetContactField => ({
    uuid,
    field,
    value,
    type: Types.set_contact_field
});

export const genSetRunResultAction = ({
    uuid = 'set_run_result-0',
    result_name = 'Name',
    value = 'Grace',
    category = ''
}: {
    uuid?: string;
    result_name?: string;
    value?: string;
    category?: string;
} = {}): SetRunResult => ({
    uuid,
    result_name,
    value,
    category,
    type: Types.set_run_result
});

// tslint:disable-next-line:variable-name
export const genCase = ({
    uuid,
    type,
    exit_uuid,
    args = []
}: {
    uuid: string;
    type: Operators;
    exit_uuid: string;
    args?: string[];
}) => ({
    uuid,
    type,
    exit_uuid,
    arguments: args
});

export const genExit = ({
    uuid = 'exit-0',
    name = null,
    destination_node_uuid = 'node-1'
}: {
    uuid?: string;
    name?: string;
    // tslint:disable-next-line:variable-name
    destination_node_uuid?: string;
} = {}) => ({
    uuid,
    name,
    destination_node_uuid
});

// tslint:disable-next-line:variable-name
export const genWait = (type: WaitTypes, flow_uuid?: string) => ({
    type,
    ...(flow_uuid ? { flow_uuid } : {})
});

// tslint:disable-next-line:variable-name
export const genRouter = (result_name?: string): Router => ({
    type: 'switch',
    ...(result_name ? { result_name } : {})
});

export const genSwitchRouter = (
    cases: Case[],
    operand: string,
    // tslint:disable-next-line:variable-name
    default_exit_uuid: string
) => ({
    ...genRouter(),
    cases,
    operand,
    default_exit_uuid
});

export const genFlowNode = ({
    actions,
    exits,
    uuid = 'node-0',
    router = null,
    wait = null
}: {
    actions: AnyAction[];
    exits: Exit[];
    uuid?: string;
    router?: Router | SwitchRouter;
    wait?: Wait;
}): FlowNode => ({
    actions,
    exits,
    uuid,
    ...(router ? { router } : ({} as any)),
    ...(wait ? { wait } : ({} as any))
});

export const genStartFlowNode = (
    startFlowAction: StartFlow,
    uuid: string = 'start_flow_node-0',
    // tslint:disable-next-line:variable-name
    flow_uuid?: string,
    exitUUIDs: string[] = ['exit1', 'exit2']
): FlowNode =>
    genFlowNode({
        actions: [startFlowAction],
        exits: [
            genExit({
                uuid: exitUUIDs[0],
                name: StartFlowExitNames.Complete,
                destination_node_uuid: 'destination-completed'
            }),
            genExit({
                uuid: exitUUIDs[1],
                name: StartFlowExitNames.Expired,
                destination_node_uuid: 'destination-expired'
            })
        ],
        uuid,
        router: genSwitchRouter(
            [
                genCase({
                    uuid: 'start_flow_case-0',
                    type: Operators.has_run_status,
                    exit_uuid: exitUUIDs[0],
                    args: [StartFlowArgs.Complete]
                }),
                genCase({
                    uuid: 'start_flow_case-1',
                    type: Operators.has_run_status,
                    exit_uuid: exitUUIDs[1],
                    args: [StartFlowArgs.Expired]
                })
            ],
            '@child',
            null
        ),
        wait: genWait(WaitTypes.flow, flow_uuid)
    });

export const genGroupsRouterNode = (
    groups: Group[] = groupsResults,
    uuid: string = 'split_by_groups-0'
): FlowNode =>
    genFlowNode({
        actions: [],
        exits: groups.map((group, idx) =>
            genExit({ uuid: group.uuid, name: group.name, destination_node_uuid: `node-${idx}` })
        ),
        uuid,
        router: genSwitchRouter(
            groups.map((group, idx) =>
                genCase({
                    uuid: `split_by_group-${idx}`,
                    type: Operators.has_group,
                    exit_uuid: group.uuid,
                    args: [group.uuid]
                })
            ),
            '@contact.groups',
            null
        ),
        wait: genWait(WaitTypes.group)
    });

export const getGroupOptions = (groups: Group[] = groupsResults): SearchResult[] =>
    groups.map(({ name, uuid }) => ({
        name,
        id: uuid
    }));

export const getGroups = (sliceAt: number, groups: Group[] = groupsResults) =>
    groups
        .map(({ name, uuid }) => ({
            name,
            id: uuid
        }))
        .slice(sliceAt);
