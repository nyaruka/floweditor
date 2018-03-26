import { createSetup } from '../../../testUtils';
import { ActionWrapper, ActionWrapperProps } from './Action';
import Localization from '../../../services/Localization';
import { getTranslations } from '../../../store';
import { getLanguage } from '../../../utils';

const config = require('../../../../assets/config');
const colorsFlowResp = require('../../../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const { results: [{ nodes: [sendMsgNode] }] } = colorsFlowResp;
const { actions: [replyAction] } = sendMsgNode;

const context = {
    languages: config.languages
};

const localized = Localization.translate(
    colorsFlowResp.results[0].definition.nodes[0],
    'spa',
    config.languages,
    getTranslations(colorsFlowResp.results[0].definition, 'spa')
);

const english = getLanguage(config.languages, 'eng');
const spanish = getLanguage(config.languages, 'spa');

const baseProps = {
    thisNodeDragging: false,
    localization: localized,
    first: true,
    action: replyAction,
    render: jest.fn(),
    node: sendMsgNode,
    language: english,
    translating: false,
    onOpenNodeEditor: jest.fn(),
    removeAction: jest.fn(),
    moveActionUp: jest.fn()
};

const setup = createSetup<ActionWrapperProps>(ActionWrapper, baseProps, context);

describe('ActionWrapper', () => {
    describe('render', () => {

    })
})
