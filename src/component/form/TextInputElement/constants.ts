import { CompletionOption } from '../../../store';

// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
export enum KeyValues {
    KEY_AT = '@',
    KEY_SPACE = ' ',
    KEY_ENTER = 'Enter',
    KEY_UP = 'ArrowUp',
    KEY_DOWN = 'ArrowDown',
    KEY_TAB = 'Tab',
    KEY_ESC = 'Escape',
    KEY_BACKSPACE = 'Backspace',
    KEY_N = 'n',
    KEY_P = 'p'
}

export enum TopLevelVariables {
    contact = 'contact',
    input = 'input',
    run = 'run',
    parent = 'parent',
    child = 'child',
    trigger = 'trigger'
}

export const MAX_GSM_SINGLE = 160;
export const MAX_GSM_MULTI = 153;
export const MAX_UNICODE_SINGLE = 70;
export const MAX_UNICODE_MULTI = 67;

export const COMPLETION_HELP = 'Tab to complete, enter to select';

export const getFlowOptions = (accessor?: string) => {
    const prefix = accessor ? accessor : TopLevelVariables.run;
    return [
        { name: `${prefix}.flow`, description: `The flow in which a ${accessor} run takes place` },
        {
            name: `${prefix}.flow.uuid`,
            description: `The UUID of the flow in which a ${accessor} run takes place`
        },
        {
            name: `${prefix}.flow.name`,
            description: `The name of the flow in which a ${accessor} run takes place`
        },
        {
            name: `${prefix}.flow.revision`,
            description: `The revision number of the flow in which a ${accessor} run takes place`
        }
    ];
};

export const getWebhookOptions = (accessor?: string) => {
    const prefix = accessor ? accessor : TopLevelVariables.run;
    return [
        {
            name: `${prefix}.webhook`,
            description: `The body of the response to the last webhook request made in a ${accessor} run`
        },
        {
            name: `${prefix}.webhook.status`,
            description: `The status of the last webhook request made in a ${accessor} run`
        },
        {
            name: `${prefix}.webhook.status_code`,
            description: `The status code returned from the last webhook request made in a ${accessor} run`
        },
        {
            name: `${prefix}.webhook.url`,
            description: `The URL that was called by the last webhook request in a ${accessor} run`
        },
        {
            name: `${prefix}.webhook.body`,
            description: `The body of the last webhook request made in a ${accessor} run`
        },
        {
            name: `${prefix}.webhook.json`,
            description: `The JSON parsed body of the response to the last webhook request in a ${accessor} run, can access subelements`
        },
        {
            name: `${prefix}.webhook.request`,
            description: `The raw request last made in a ${accessor} run, including headers`
        },
        {
            name: `${prefix}.webhook.response`,
            description: `The raw response last received in a ${accessor} run, including headers`
        },
        { name: `${prefix}.results`, description: `Results collected in a ${accessor} run` }
    ];
};

export const getInputOptions = (accessor?: string) => {
    const prefix = accessor ? accessor : TopLevelVariables.run;
    return [
        { name: `${prefix}.input`, description: `A ${accessor} run's last input` },
        { name: `${prefix}.input.uuid`, description: `The UUID of a ${accessor} run's last input` },
        { name: `${prefix}.input.type`, description: `The type of a ${accessor} run's last input` },
        {
            name: `${prefix}.input.channel`,
            description: `The channel a ${accessor} run's last input was received on`
        },
        {
            name: `${prefix}.input.created_on`,
            description: `The time a ${accessor} run's last input was created`
        },
        {
            name: `${prefix}.input.text`,
            description: `The text of a ${accessor} run's last message`
        },
        {
            name: `${prefix}.input.attachments`,
            description: `The attachments on a ${accessor} run's last message`
        },
        {
            name: `${prefix}.input.urn`,
            description: `The URN a ${accessor} run's last input was received on`
        }
    ];
};

export const getContactOptions = (accessor?: string) => {
    const prefix = accessor ? `${accessor}.` : '';
    const descriptor = accessor
        ? accessor === TopLevelVariables.run ? `${accessor}'s` : `${accessor} run's`
        : '';
    return [
        { name: `${prefix}contact`, description: `The name of the ${descriptor} contact` },
        { name: `${prefix}contact.name`, description: `The name of the ${descriptor} contact` },
        {
            name: `${prefix}contact.first_name`,
            description: `The first name of the ${descriptor} contact`
        },
        {
            name: `${prefix}contact.language`,
            description: `The language code for the ${descriptor} contact`
        },
        {
            name: `${prefix}contact.fields`,
            description: `Custom fields on the ${descriptor} contact`
        },
        {
            name: `${prefix}contact.groups`,
            description: `The groups the ${descriptor} contact is a member of`
        },
        { name: `${prefix}contact.urns`, description: `URNs on the ${descriptor} contact` },
        {
            name: `${prefix}contact.urns.tel`,
            description: `The preferred telephone number for the ${descriptor} contact`
        },
        {
            name: `${prefix}contact.urns.telegram`,
            description: `The preferred telegram id for the ${descriptor} contact`
        },
        {
            name: `${prefix}contact.channel`,
            description: `The ${descriptor} contact's preferred channel`
        },
        {
            name: `${prefix}contact.channel.uuid`,
            description: `The UUID of the ${descriptor} contact's preferred channel`
        },
        {
            name: `${prefix}contact.channel.name`,
            description: `The name of the ${descriptor} contact's preferred channel`
        },
        {
            name: `${prefix}contact.channel.address`,
            description: `The address of the ${descriptor} contact's preferred channel`
        }
    ];
};

export const RUN_OPTIONS: CompletionOption[] = [
    { name: TopLevelVariables.run, description: 'A run in this flow' },
    ...getFlowOptions(),
    ...getContactOptions(TopLevelVariables.run),
    ...getInputOptions(),
    ...getWebhookOptions()
];

export const CHILD_OPTIONS: CompletionOption[] = [
    { name: TopLevelVariables.child, description: 'Run details collected in a child flow, if any' },
    ...getFlowOptions(TopLevelVariables.child),
    ...getContactOptions(TopLevelVariables.child),
    ...getInputOptions(TopLevelVariables.child),
    ...getWebhookOptions(TopLevelVariables.child)
];

export const PARENT_OPTIONS: CompletionOption[] = [
    {
        name: TopLevelVariables.parent,
        description: 'Run details collected by a parent flow, if any'
    },
    ...getFlowOptions(TopLevelVariables.parent),
    ...getContactOptions(TopLevelVariables.parent),
    ...getInputOptions(TopLevelVariables.parent),
    ...getWebhookOptions(TopLevelVariables.parent)
];

export const TRIGGER_OPTIONS: CompletionOption[] = [
    { name: 'trigger', description: 'The trigger that initiated the session' },
    { name: 'trigger.type', description: 'The type of the trigger, one of “manual” or “flow”' },
    { name: 'trigger.params', description: 'The parameters passed to the trigger' }
];

export const OPTIONS: CompletionOption[] = [
    ...getContactOptions(),
    ...RUN_OPTIONS,
    ...CHILD_OPTIONS,
    ...PARENT_OPTIONS,
    ...TRIGGER_OPTIONS
];

export const TOP_LEVEL_OPTIONS = OPTIONS.filter(
    ({ name }) =>
        name === TopLevelVariables.contact ||
        name === TopLevelVariables.input ||
        name === TopLevelVariables.run ||
        name === TopLevelVariables.parent ||
        name === TopLevelVariables.child ||
        name === TopLevelVariables.trigger
);

export const GSM: { [key: string]: number } = {
    // char: charCode
    0: 48,
    1: 49,
    2: 50,
    3: 51,
    4: 52,
    5: 53,
    6: 54,
    7: 55,
    8: 56,
    9: 57,
    '\n': 10,
    '\f': 12,
    '\r': 13,
    ' ': 32,
    '!': 33,
    '"': 34,
    '#': 35,
    $: 36,
    '%': 37,
    '&': 38,
    "'": 39,
    '(': 40,
    ')': 41,
    '*': 42,
    '+': 43,
    ',': 44,
    '-': 45,
    '.': 46,
    '/': 47,
    ':': 58,
    ';': 59,
    '<': 60,
    '=': 61,
    '>': 62,
    '?': 63,
    '@': 64,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    '[': 91,
    '\\': 92,
    ']': 93,
    '^': 94,
    _: 95,
    a: 97,
    b: 98,
    c: 99,
    d: 100,
    e: 101,
    f: 102,
    g: 103,
    h: 104,
    i: 105,
    j: 106,
    k: 107,
    l: 108,
    m: 109,
    n: 110,
    o: 111,
    p: 112,
    q: 113,
    r: 114,
    s: 115,
    t: 116,
    u: 117,
    v: 118,
    w: 119,
    x: 120,
    y: 121,
    z: 122,
    '{': 123,
    '|': 124,
    '}': 125,
    '~': 126,
    '¡': 161,
    '£': 163,
    '¤': 164,
    '¥': 165,
    '§': 167,
    '¿': 191,
    Ä: 196,
    Å: 197,
    Æ: 198,
    Ç: 199,
    É: 201,
    Ñ: 209,
    Ö: 214,
    Ø: 216,
    Ü: 220,
    ß: 223,
    à: 224,
    ä: 228,
    å: 229,
    æ: 230,
    è: 232,
    é: 233,
    ì: 236,
    ñ: 241,
    ò: 242,
    ö: 246,
    ø: 248,
    ù: 249,
    ü: 252,
    Γ: 915,
    Δ: 916,
    Θ: 920,
    Λ: 923,
    Ξ: 926,
    Π: 928,
    Σ: 931,
    Φ: 934,
    Ψ: 936,
    Ω: 937,
    '€': 8364
};
