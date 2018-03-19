import * as React from 'react';
import { shallow } from 'enzyme';
import { SendMsg } from '../../../flowTypes';
import CompMap from '../../../services/ComponentMap';
import LocalizationService, { LocalizedObject } from '../../../services/Localization';
import { getSpecWrapper } from '../../../utils';
import SendMsgComp from '../../actions/SendMsg/SendMsg';
import ActionComp, { ActionProps } from './Action';

const { languages } = require('../../../../assets/config');

const definition = {
    name: 'Lots of Action',
    language: 'eng',
    uuid: 'a4f64f1b-85bc-477e-b706-de313a022979',
    localization: {
        spa: {
            '24afc61e-e528-4ac0-b887-78cebd39f12b': {
                text: ['Como te llamas?']
            }
        }
    },
    nodes: [
        {
            uuid: '24afc61e-e528-4ac0-b887-78cebd39f12b',
            actions: [
                {
                    type: 'send_msg',
                    uuid: '360a28a1-6741-4f16-9421-f6f313cf753e',
                    text: 'Hi there, what is your name?'
                }
            ],
            exits: [
                {
                    uuid: '445fc64c-2a18-47cc-89d0-15172826bfcc',
                    destination: null
                }
            ]
        }
    ],
    _ui: {
        languages,
        nodes: {
            '24afc61e-e528-4ac0-b887-78cebd39f12b': {
                position: {
                    x: 20,
                    y: 20
                }
            }
        }
    }
};

const { nodes: [node], language: flowLanguage } = definition;

const { actions: [replyAction] } = node;

const { uuid, type, text } = replyAction;

const ComponentMap = new CompMap(definition);

const localization: LocalizedObject = LocalizationService.translate(
    replyAction,
    flowLanguage,
    languages
);

const actionProps: ActionProps = {
    ComponentMap,
    node,
    action: replyAction,
    onUpdateAction: jest.fn(),
    onUpdateRouter: jest.fn(),
    onUpdateLocalizations: jest.fn(),
    openEditor: jest.fn(),
    onMoveActionUp: jest.fn(),
    onRemoveAction: jest.fn(),
    dragging: false,
    hasRouter: false,
    first: true,
    localization
};

const wrapper = shallow(
    <ActionComp {...actionProps}>
        {(actionDivProps: SendMsg) => <SendMsgComp {...actionDivProps} />}
    </ActionComp>,
    {
        context: {
            languages
        }
    }
);

describe('Component: SendMsg', () => {
    it('should render action div', () => {
        const ActionContainerShallow = wrapper.find(`#action-${replyAction.uuid}`);
        const OverLayContainerShallow = wrapper.find('.overlay');
        const InteractiveContainerShallow = getSpecWrapper(wrapper, 'interactive-div');

        expect(ActionContainerShallow.exists()).toBeTruthy();

        expect(OverLayContainerShallow.exists()).toBeTruthy();

        expect(InteractiveContainerShallow.exists()).toBeTruthy();
    });

    it('should render TitleBar & pass it appropriate props', () => {
        const TitleBarShallow = wrapper.find('TitleBar');

        expect(TitleBarShallow.exists()).toBeTruthy();
        expect(TitleBarShallow.hasClass('send_msg')).toBeTruthy();
        expect(TitleBarShallow.prop('title')).toBe('Send Message');
    });

    it('should render SendMsg action and pass it appropriate props', () => {
        const ReplyDiv = wrapper.find({ type });

        expect(ReplyDiv.exists()).toBeTruthy();
        expect(ReplyDiv.prop('uuid')).toBe(uuid);
        expect(ReplyDiv.prop('text')).toBe(text);
    });
});
