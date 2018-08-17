import { languageToAsset } from '~/components/flow/actions/updatecontact/helpers';
import { determineTypeConfig } from '~/components/flow/helpers';
import { ActionFormProps, RouterFormProps } from '~/components/flow/props';
import { Methods } from '~/components/flow/routers/webhook/helpers';
import { Operators } from '~/config/operatorConfigs';
import { getTypeConfig, Types } from '~/config/typeConfigs';
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
    RemoveFromGroups,
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
    WaitTypes,
    WebhookExitNames
} from '~/flowTypes';
import { AssetType } from '~/services/AssetService';
import { RenderNode } from '~/store/flowContext';
import { capitalize, createUUID } from '~/utils';

const { results: groupsResults } = require('~/test/assets/groups.json');
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
    uuid = '68b029c9-6400-4f46-947a-b61c619a7198',
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
    uuid = 'b4f00bdf-6268-4faa-b236-bf2af607526f',
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
    uuid = '35a6eff8-dd6e-4e07-b605-73da32c83c9c',
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
    uuid = createUUID(),
    groups = [
        { uuid: '4441fa19-8bbf-4894-8529-d04cc3b365d6', name: 'Cat Fanciers' },
        { uuid: '1e5aa7db-89c7-4dec-99b8-cd1194e1f46e', name: 'Cat Facts' }
    ],
    contacts = [
        { uuid: '1e5aa7db-89c7-4dec-99b8-cd1194e1f46e', name: 'Kellan Alexander' },
        { uuid: '575fe8e9-cb51-4f15-8df7-422290fdfc64', name: 'Norbert Kwizera' },
        { uuid: '82df72ae-d835-401b-b248-d0c5dcfdce5c', name: 'Rowan Seymour' }
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
    uuid = createUUID(),
    groups = [
        { uuid: '4441fa19-8bbf-4894-8529-d04cc3b365d6', name: 'Cat Fanciers' },
        { uuid: '1e5aa7db-89c7-4dec-99b8-cd1194e1f46e', name: 'Cat Facts' }
    ],
    contacts = [
        { uuid: '1e5aa7db-89c7-4dec-99b8-cd1194e1f46e', name: 'Kellan Alexander' },
        { uuid: '575fe8e9-cb51-4f15-8df7-422290fdfc64', name: 'Norbert Kwizera' },
        { uuid: '82df72ae-d835-401b-b248-d0c5dcfdce5c', name: 'Rowan Seymour' }
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
    uuid = '0d8abccd-ad6d-4776-a642-d310d6f15835',
    groups = groupsResults
}: { uuid?: string; groups?: Group[] } = {}): ChangeGroups => ({
    uuid,
    type: Types.add_contact_groups,
    groups
});

export const createRemoveGroupsAction = ({
    uuid = 'b230a96d-0448-4945-92b6-a53e583f3bd6',
    groups = groupsResults
}: { uuid?: string; groups?: Group[] } = {}): RemoveFromGroups => ({
    uuid,
    all_groups: false,
    type: Types.remove_contact_groups,
    groups
});

export const createStartFlowAction = ({
    uuid = 'da795777-db05-438c-a24a-1880b7f7a95f',
    flow = {
        name: 'Colors',
        uuid: 'd4a3a01c-1dee-4324-b107-4ac7a21d836f'
    }
}: {
    uuid?: string;
    flow?: {
        name: string;
        uuid: string;
    };
} = {}): StartFlow => ({
    type: Types.start_flow,
    uuid: 'd4a3a01c-1dee-4324-b107-4ac7a21d836f',
    flow: {
        name: capitalize(flow.name.trim()),
        uuid
    }
});

export const createSetContactNameAction = ({
    uuid = '1212cb51-83d8-443f-a962-7ef89ea238cb',
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
    uuid = '80b54854-ac33-4488-a260-e9a9026d2152',
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
    uuid = '0dce545b-e743-44e4-a940-9767f0c508ea',
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
    uuid = '9fd8cf85-dd81-401a-b543-f44cc6574d93',
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
    uuid = 'efe2a1c2-f189-488a-b431-0197def63cc4',
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

export const createWebhookRouterNode = (): FlowNode => ({
    uuid: 'c6f278d5-2741-4c0a-880c-52a07dea91a5',
    actions: [
        {
            uuid: 'a564374c-ee42-4f13-8fc3-cda99f43b6ae',
            headers: {},
            type: Types.call_webhook,
            url: 'http://www.google.com',
            method: 'GET'
        } as CallWebhook
    ],
    router: {
        type: RouterTypes.switch,
        operand: '@run.webhook.status',
        cases: [
            {
                uuid: '89f9a8c0-e399-4c49-8409-43e37c318423',
                type: Operators.is_text_eq,
                arguments: ['success'],
                exit_uuid: '34bab8f0-4efa-40b7-a3c1-39ce856ea740'
            },
            {
                uuid: '62e70441-a846-461d-8d57-4538d726b209',
                type: Operators.is_text_eq,
                arguments: ['response_error'],
                exit_uuid: 'ca80b96d-5178-4c0c-b98f-8f42e5fcc4f5'
            },
            {
                uuid: 'eeb6ae86-f2ac-4ed2-a3b0-b211e0e5d4b3',
                type: Operators.is_text_eq,
                arguments: ['connection_error'],
                exit_uuid: '023db634-a097-4351-8662-8447d971ff74'
            }
        ],
        default_exit_uuid: 'ca80b96d-5178-4c0c-b98f-8f42e5fcc4f5'
    } as SwitchRouter,
    exits: [
        {
            uuid: '34bab8f0-4efa-40b7-a3c1-39ce856ea740',
            name: WebhookExitNames.Success,
            destination_node_uuid: null
        },
        {
            uuid: 'ca80b96d-5178-4c0c-b98f-8f42e5fcc4f5',
            name: WebhookExitNames.Failure,
            destination_node_uuid: null
        },
        {
            uuid: '023db634-a097-4351-8662-8447d971ff74',
            name: WebhookExitNames.Unreachable,
            destination_node_uuid: null
        }
    ]
});

export const getActionFormProps = (action: AnyAction): ActionFormProps => ({
    updateAction: jest.fn(),
    onClose: jest.fn(),
    onTypeChange: jest.fn(),
    typeConfig: getTypeConfig(action.type),
    nodeSettings: {
        originalNode: null,
        originalAction: action
    }
});

export const getRouterFormProps = (renderNode: RenderNode): RouterFormProps => ({
    updateRouter: jest.fn(),
    onClose: jest.fn(),
    onTypeChange: jest.fn(),
    typeConfig: determineTypeConfig({ originalNode: renderNode }),
    nodeSettings: {
        originalNode: renderNode,
        originalAction: null
    },
    flowState: null
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
    uuid = 'd41215f1-4822-44ed-b6f5-419213bf6a15',
    name = null,
    destination_node_uuid = null
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
    uuid = '48e0a64d-3b3c-4e3e-9d95-7844093edc90',
    router = null,
    wait = null,
    ui = {
        position: { left: 0, top: 0 },
        type: Types.split_by_expression
    }
}: {
    actions: AnyAction[];
    exits: Exit[];
    uuid?: string;
    router?: Router | SwitchRouter;
    wait?: Wait;
    ui?: UINode;
}): RenderNode => {
    const renderNode: RenderNode = {
        node: {
            actions,
            exits,
            uuid,
            ...(router ? { router } : ({} as any)),
            ...(wait ? { wait } : ({} as any))
        },
        ui,
        inboundConnections: null
    };
    return renderNode;
};

export const createFlowNode = ({
    actions,
    exits,
    uuid = '48e0a64d-3b3c-4e3e-9d95-7844093edc90',
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
    uuid = '2b023cef-9ef7-4425-a9b5-a1a032a69b92',
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

export const createSubflowNode = (
    startFlowAction: StartFlow,
    uuid: string = 'e4e66707-8798-4760-ba10-ab25c3da767c',
    exitUUIDs: string[] = [
        '054be440-a819-4bcf-898e-d18084ab7f4e',
        '70dbfd3f-a501-42cb-b53d-3c4290ab8d58'
    ]
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
                    uuid: '0d377671-c887-46df-a08a-22589cd50554',
                    type: Operators.has_run_status,
                    exit_uuid: exitUUIDs[0],
                    args: [StartFlowArgs.Complete]
                }),
                createCase({
                    uuid: '4be01054-1592-4193-8abd-b673e9ae8dcc',
                    type: Operators.has_run_status,
                    exit_uuid: exitUUIDs[1],
                    args: [StartFlowArgs.Expired]
                })
            ],
            operand: '@child',
            default_exit_uuid: null
        }),
        wait: createWait({ type: WaitTypes.flow }),
        ui: { position: { left: 0, top: 0 }, type: Types.split_by_subflow }
    });

export const createGroupsRouterNode = (
    groups: Group[] = groupsResults,
    uuid: string = 'c51231fa-5efd-416a-abe9-d5aedbfe33e4'
): RenderNode =>
    createRenderNode({
        actions: [],
        exits: groups.map((group, idx) =>
            createExit({
                uuid: group.uuid,
                name: group.name,
                destination_node_uuid: 'ab4b7a93-c794-4a04-b4c7-00fa68c7bf1c'
            })
        ),
        uuid,
        router: createSwitchRouter({
            cases: groups.map((group, idx) =>
                createCase({
                    uuid: createUUID(),
                    type: Operators.has_group,
                    exit_uuid: group.uuid,
                    args: [group.uuid]
                })
            ),
            operand: '@contact.groups',
            default_exit_uuid: null
        }),
        wait: createWait({ type: WaitTypes.group }),
        ui: {
            type: Types.split_by_groups,
            position: { left: 0, top: 0 }
        }
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
    uuid: 'aa15ef19-da81-43d0-b6e5-84b47216aeb8',
    labels
});

export const English = { name: 'English', id: 'eng', type: AssetType.Language };

export const Spanish = { name: 'Spanish', id: 'spa', type: AssetType.Language };

export const SubscribersGroup = {
    name: 'Subscriber',
    id: '68223118-109f-442a-aed3-7bb3e1eab687',
    type: AssetType.Group
};

export const ColorFlowAsset = {
    name: 'Favorite Color',
    uuid: '9a93ede6-078f-44c9-ad0a-133793be5d56'
};

export const FeedbackLabel = { name: 'Feedback', id: 'feedback_label', type: AssetType.Label };

export const languages = languagesResults.results.map((language: any) => languageToAsset(language));
