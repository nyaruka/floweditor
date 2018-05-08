import { Operators } from '../config/operatorConfigs';
import { Types } from '../config/typeConfigs';
import {
    AnyAction,
    BroadcastMsg,
    CallWebhook,
    Case,
    ChangeGroups,
    Contact,
    ContactProperties,
    Exit,
    Field,
    FlowNode,
    Group,
    Methods,
    Router,
    SendEmail,
    SendMsg,
    SetContactField,
    SetContactProperty,
    SetRunResult,
    StartFlow,
    StartFlowArgs,
    StartFlowExitNames,
    SwitchRouter,
    Wait,
    WaitTypes
} from '../flowTypes';
import { capitalize } from '../utils';

const { assets: groupsResults } = require('../../__test__/assets/groups.json');

/**
 * Create a select control option
 */
export const createSelectOption = ({ label }: { label: string }) => ({
    label: capitalize(label.trim()),
    labelKey: 'name',
    valueKey: 'id'
});

export const createSendMsgAction = ({
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

export const createSendEmailAction = ({
    uuid = 'send_email-0',
    subject = 'New Sign Up',
    body = '@run.results.name just signed up.',
    addresses = ['jane@example.com']
}: {
    uuid?: string;
    subject?: string;
    body?: string;
    addresses?: string[];
} = {}): SendEmail => ({
    uuid,
    type: Types.send_email,
    subject,
    body,
    addresses
});

export const createCallWebhookAction = ({
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

export const createBroadcastMsgAction = ({
    uuid = 'send_broadcast-0',
    groups = [{ uuid: 'group-0', name: 'Cat Fanciers' }, { uuid: 'group-1', name: 'Cat Facts' }],
    contacts = [
        { uuid: 'contact-0', name: 'Kellan Alexander' },
        { uuid: 'contact-1', name: 'Norbert Kwizera' },
        { uuid: 'contact-2', name: 'Rowan Seymour' }
    ],
    text = 'Hello World'
}: {
    uuid?: string;
    groups?: Group[];
    contacts?: Contact[];
    text?: string;
} = {}): BroadcastMsg => ({
    uuid,
    groups,
    contacts,
    text,
    type: Types.send_broadcast
});

export const createAddGroupsAction = ({
    uuid = 'add_contact_groups-0',
    groups = groupsResults
}: { uuid?: string; groups?: Group[] } = {}): ChangeGroups => ({
    uuid,
    type: Types.add_contact_groups,
    groups
});

export const createStartFlowAction = ({
    uuid = 'start_flow-0',
    flow = {
        name: 'Colors',
        uuid: 'colors-0'
    }
}: {
    uuid?: string;
    flow?: {
        name: string;
        uuid: string;
    };
} = {}): StartFlow => ({
    type: Types.start_flow,
    uuid: 'start-flow-0',
    flow: {
        name: capitalize(flow.name.trim()),
        uuid
    }
});

export const createSetContactPropertyAction = ({
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

export const createSetContactFieldAction = ({
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

export const createSetRunResultAction = ({
    uuid = 'set_run_result-0',
    name = 'Name',
    value = 'Grace',
    category = ''
}: {
    uuid?: string;
    name?: string;
    value?: string;
    category?: string;
} = {}): SetRunResult => ({
    uuid,
    name,
    value,
    category,
    type: Types.set_run_result
});

// tslint:disable-next-line:variable-name
export const createCase = ({
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

export const createExit = ({
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
export const createWait = (type: WaitTypes, flow_uuid?: string) => ({
    type,
    ...(flow_uuid ? { flow_uuid } : {})
});

// tslint:disable-next-line:variable-name
export const createRouter = (result_name?: string): Router => ({
    type: 'switch',
    ...(result_name ? { result_name } : {})
});

export const createSwitchRouter = (
    cases: Case[],
    operand: string,
    // tslint:disable-next-line:variable-name
    default_exit_uuid: string
) => ({
    ...createRouter(),
    cases,
    operand,
    default_exit_uuid
});

export const createFlowNode = ({
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

export const createStartFlowNode = (
    startFlowAction: StartFlow,
    uuid: string = 'start_flow_node-0',
    // tslint:disable-next-line:variable-name
    flow_uuid?: string,
    exitUUIDs: string[] = ['exit1', 'exit2']
): FlowNode =>
    createFlowNode({
        actions: [startFlowAction],
        exits: [
            createExit({
                uuid: exitUUIDs[0],
                name: StartFlowExitNames.Complete,
                destination_node_uuid: 'destination-completed'
            }),
            createExit({
                uuid: exitUUIDs[1],
                name: StartFlowExitNames.Expired,
                destination_node_uuid: 'destination-expired'
            })
        ],
        uuid,
        router: createSwitchRouter(
            [
                createCase({
                    uuid: 'start_flow_case-0',
                    type: Operators.has_run_status,
                    exit_uuid: exitUUIDs[0],
                    args: [StartFlowArgs.Complete]
                }),
                createCase({
                    uuid: 'start_flow_case-1',
                    type: Operators.has_run_status,
                    exit_uuid: exitUUIDs[1],
                    args: [StartFlowArgs.Expired]
                })
            ],
            '@child',
            null
        ),
        wait: createWait(WaitTypes.flow, flow_uuid)
    });

export const createGroupsRouterNode = (
    groups: Group[] = groupsResults,
    uuid: string = 'split_by_groups-0'
): FlowNode =>
    createFlowNode({
        actions: [],
        exits: groups.map((group, idx) =>
            createExit({ uuid: group.uuid, name: group.name, destination_node_uuid: `node-${idx}` })
        ),
        uuid,
        router: createSwitchRouter(
            groups.map((group, idx) =>
                createCase({
                    uuid: `split_by_group-${idx}`,
                    type: Operators.has_group,
                    exit_uuid: group.uuid,
                    args: [group.uuid]
                })
            ),
            '@contact.groups',
            null
        ),
        wait: createWait(WaitTypes.group)
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
