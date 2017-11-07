import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow } from 'enzyme';
import { IReply } from '../../../flowTypes';
import { IWithActionExternalProps } from '../../enhancers/withAction';
import EditorConfig from '../../../services/EditorConfig';
import CompMap from '../../../services/ComponentMap';
import LocalizationService, { LocalizedObject } from '../../../services/Localization';
import { languages } from '../../../flowEditorConfig';
import ReplyCompEnhanced, { ReplyCompBase } from './ReplyComp';

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
        languages: [
            {
                eng: 'English'
            },
            {
                spa: 'Spanish'
            }
        ],
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

const replyAction = node.actions[0] as IReply;

const { uuid, text } = replyAction;

const {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints
} = new EditorConfig();

const ComponentMap = new CompMap(definition as any);

const Localization: LocalizedObject = LocalizationService.translate(
    replyAction,
    flowLanguage,
    languages
);

const actionProps: IWithActionExternalProps = {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints,
    ComponentMap,
    node,
    action: replyAction,
    context: {
        eventHandler: {
            onUpdateAction: jest.fn(),
            onUpdateRouter: jest.fn(),
            onUpdateLocalizations: jest.fn(),
            onUpdateDimensions: jest.fn(),
            onNodeBeforeDrag: jest.fn(),
            onNodeDragStart: jest.fn(),
            onNodeDragStop: jest.fn(),
            onRemoveAction: jest.fn(),
            onMoveActionUp: jest.fn(),
            onDisconnectExit: jest.fn(),
            onNodeMoved: jest.fn(),
            onAddAction: jest.fn(),
            onRemoveNode: jest.fn(),
            openEditor: jest.fn(),
            onNodeMounted: jest.fn()
        }
    },
    dragging: false,
    hasRouter: false,
    first: true,
    Localization
};

describe('Component: ReplyComp', () => {
    it('should render enhanced ReplyComp and pass it appropriate props', () => {
        const ReplyCompEnhancedShallow = shallow(<ReplyCompEnhanced {...actionProps} />);
        const ReplyCompShallow = ReplyCompEnhancedShallow.find({ type: 'reply' });

        expect(ReplyCompShallow).toBePresent();
        expect(ReplyCompShallow).toHaveProp('uuid', uuid);
        expect(ReplyCompShallow).toHaveProp('text', text);
    });

    it('should render base ReplyComp with text prop when passed', () => {
        const ReplyCompBaseShallow = shallow(<ReplyCompBase {...replyAction} />);

        expect(ReplyCompBaseShallow).toHaveText(text);
    });

    it("should render base ReplyComp with placeholder when text prop isn't passed", () => {
        const ReplyCompBaseShallow = shallow(<ReplyCompBase {...{...replyAction, text: ''}} />);

        expect(ReplyCompBaseShallow).toHaveText('Send a message to the contact');
    });
});
