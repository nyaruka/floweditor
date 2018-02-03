import * as React from 'react';
import { shallow } from 'enzyme';
import { Reply } from '../../flowTypes';
import ActionComp, { ActionProps } from './Action';
import { getSpecWrapper } from '../../helpers/utils';
import CompMap from '../../services/ComponentMap';
import LocalizationService, {
    LocalizedObject
} from '../../services/Localization';
import ReplyComp from '../actions/Reply/Reply';
import context from '../../providers/ConfigProvider/configContext';

const { languages } = context;

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
                    type: 'reply',
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

const Localization: LocalizedObject = LocalizationService.translate(
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
    Localization
};

const ReplyActionShallow = shallow(
    <ActionComp {...actionProps}>
        {(actionDivProps: Reply) => <ReplyComp {...actionDivProps} />}
    </ActionComp>,
    {
        context
    }
);

describe('Component: Reply', () => {
    it('should render action div', () => {
        const ActionContainerShallow = ReplyActionShallow.find(
            `#action-${replyAction.uuid}`
        );
        const OverLayContainerShallow = ReplyActionShallow.find('.overlay');
        const InteractiveContainerShallow = getSpecWrapper(
            ReplyActionShallow,
            'interactive-div'
        );

        expect(ActionContainerShallow.exists()).toBeTruthy();

        expect(OverLayContainerShallow.exists()).toBeTruthy();

        expect(InteractiveContainerShallow.exists()).toBeTruthy();
        expect(InteractiveContainerShallow.prop('onMouseDown')).toBeTruthy();
        expect(InteractiveContainerShallow.prop('onMouseUp')).toBeTruthy();
    });

    it('should render TitleBar & pass it appropriate props', () => {
        const TitleBarShallow = ReplyActionShallow.find('TitleBar');

        expect(TitleBarShallow.exists()).toBeTruthy();
        expect(TitleBarShallow.hasClass('reply')).toBeTruthy();
        expect(TitleBarShallow.prop('title')).toBe('Send Message');
    });

    it('should render Reply action and pass it appropriate props', () => {
        const ReplyDiv = ReplyActionShallow.find({ type });

        expect(ReplyDiv.exists()).toBeTruthy();
        expect(ReplyDiv.prop('uuid')).toBe(uuid);
        expect(ReplyDiv.prop('text')).toBe(text);
    });
});
