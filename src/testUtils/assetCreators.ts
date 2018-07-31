import { languageToAsset } from '~/components/flow/actions/updatecontact/helpers';
import { Methods } from '~/components/flow/routers/webhook/helpers';
import { Operators } from '~/config/operatorConfigs';
import { Types } from '~/config/typeConfigs';
import {
    AnyAction,
    BroadcastMsg,
    CallWebhook,
    Case,
    ChangeGroups,
    Contact,
    Exit,
    Field,
    Flow,
    FlowNode,
    Group,
    Label,
    Router,
    RouterTypes,
    SendEmail,
    SendMsg,
    SetContactChannel,
    SetContactField,
    SetContactLanguage,
    SetContactProperty,
    SetRunResult,
    StartFlow,
    StartFlowArgs,
    StartFlowExitNames,
    StartSession,
    SwitchRouter,
    UINode,
    Wait,
    WaitTypes
} from '~/flowTypes';
import { AssetType } from '~/services/AssetService';
import { RenderNode } from '~/store/flowContext';
import { capitalize } from '~/utils';

const { assets: groupsResults } = require('~/test/assets/groups.json');
const languagesResults = require('~/test/assets/languages.json');

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

export const createStartSessionAction = ({
    uuid = 'start-session-0',
    groups = [{ uuid: 'group-0', name: 'Cat Fanciers' }, { uuid: 'group-1', name: 'Cat Facts' }],
    contacts = [
        { uuid: 'contact-0', name: 'Kellan Alexander' },
        { uuid: 'contact-1', name: 'Norbert Kwizera' },
        { uuid: 'contact-2', name: 'Rowan Seymour' }
    ],
    flow = {
        uuid: 'flow_uuid',
        name: 'Flow to Start'
    }
}: {
    uuid?: string;
    groups?: Group[];
    contacts?: Contact[];
    flow?: Flow;
} = {}): StartSession => ({
    uuid,
    groups,
    contacts,
    flow,
    type: Types.start_session
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

export const createSetContactNameAction = ({
    uuid = 'set_contact_name-0',
    name = 'Jane Goodall'
}: {
    uuid?: string;
    name?: string;
} = {}): SetContactProperty => ({
    uuid,
    name,
    type: Types.set_contact_name
});

export const createSetContactFieldAction = ({
    uuid = 'set_contact_field-0',
    field = {
        key: 'age',
        name: 'Age'
    },
    value = '25'
}: {
    uuid?: string;
    field?: Field;
    value?: string;
} = {}): SetContactField => ({
    uuid,
    field,
    value,
    type: Types.set_contact_field
});

export const createSetContactLanguageAction = ({
    uuid = 'set_contact_language-0',
    language = 'eng'
}: {
    uuid?: string;
    language?: string;
} = {}): SetContactLanguage => ({
    uuid,
    language,
    type: Types.set_contact_language
});

export const createSetContactChannelAction = ({
    uuid = 'set_contact_channel-0',
    channelName = 'Twilio Channel'
}: {
    uuid?: string;
    channelName?: string;
} = {}): SetContactChannel => ({
    uuid,
    channel: {
        uuid,
        name: channelName
    },
    type: Types.set_contact_channel
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
export const createWait = ({ type, timeout }: { type: WaitTypes; timeout?: number }) => ({
    type,
    ...(timeout ? { timeout } : {})
});

// tslint:disable-next-line:variable-name
export const createRouter = (result_name?: string): Router => ({
    type: RouterTypes.switch,
    ...(result_name ? { result_name } : {})
});

export const createSwitchRouter = ({
    cases,
    operand = '@input',
    default_exit_uuid = null
}: {
    cases: Case[];
    operand?: string;
    // tslint:disable-next-line:variable-name
    default_exit_uuid?: string;
}) => ({
    ...createRouter(),
    cases,
    operand,
    default_exit_uuid
});

export const createRenderNode = ({
    actions,
    exits,
    uuid = 'node-0',
    router = null,
    wait = null,
    ui = {
        position: { left: 0, top: 0 }
    }
}: {
    actions: AnyAction[];
    exits: Exit[];
    uuid?: string;
    router?: Router | SwitchRouter;
    wait?: Wait;
    ui?: UINode;
}): RenderNode => ({
    node: {
        actions,
        exits,
        uuid,
        ...(router ? { router } : ({} as any)),
        ...(wait ? { wait } : ({} as any))
    },
    ui,
    inboundConnections: null
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

export const createWaitRouterNode = ({
    exits,
    cases,
    uuid = 'wait-router',
    timeout
}: {
    exits: Exit[];
    cases: Case[];
    timeout?: number;
    uuid?: string;
}): RenderNode =>
    createRenderNode({
        actions: [],
        exits,
        uuid,
        router: createSwitchRouter({
            cases
        }),
        wait: createWait({ type: WaitTypes.msg, timeout })
    });

export const createStartFlowNode = (
    startFlowAction: StartFlow,
    uuid: string = 'start_flow_node-0',
    // tslint:disable-next-line:variable-name
    flow_uuid?: string,
    exitUUIDs: string[] = ['exit1', 'exit2']
): RenderNode =>
    createRenderNode({
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
        router: createSwitchRouter({
            cases: [
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
            operand: '@child',
            default_exit_uuid: null
        }),
        wait: createWait({ type: WaitTypes.flow })
    });

export const createGroupsRouterNode = (
    groups: Group[] = groupsResults,
    uuid: string = 'split_by_groups-0'
): RenderNode =>
    createRenderNode({
        actions: [],
        exits: groups.map((group, idx) =>
            createExit({ uuid: group.uuid, name: group.name, destination_node_uuid: `node-${idx}` })
        ),
        uuid,
        router: createSwitchRouter({
            cases: groups.map((group, idx) =>
                createCase({
                    uuid: `split_by_group-${idx}`,
                    type: Operators.has_group,
                    exit_uuid: group.uuid,
                    args: [group.uuid]
                })
            ),
            operand: '@contact.groups',
            default_exit_uuid: null
        }),
        wait: createWait({ type: WaitTypes.group })
    });

export const getGroupOptions = (groups: Group[] = groupsResults) =>
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

export const createAddLabelsAction = (labels: Label[]) => ({
    type: Types.add_input_labels,
    uuid: `labels-action-uuid-${labels.length}`,
    labels
});

export const English = { name: 'English', id: 'eng', type: AssetType.Language };

export const Spanish = { name: 'Spanish', id: 'spa', type: AssetType.Language };

export const SubscribersGroup = {
    name: 'Subscriber',
    id: 'subscribers_group',
    type: AssetType.Group
};

export const FeedbackLabel = { name: 'Feedback', id: 'feedback_label', type: AssetType.Label };

export const languages = languagesResults.assets.map((language: any) => languageToAsset(language));
