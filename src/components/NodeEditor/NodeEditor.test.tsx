import * as React from 'react';
import '../../enzymeAdapter';
import { shallow } from 'enzyme';
import EditorConfig from '../../services/EditorConfig';
import CompMap from '../../services/ComponentMap';
import Modal from '../Modal';
import NodeEditor, { INodeEditorProps } from './index';

const definition = {
    name: 'Lots of Action',
    language: 'eng',
    uuid: 'a4f64f1b-85bc-477e-b706-de313a022979',
    localization: {
        spa: {
            '24afc61e-e528-4ac0-b887-78cebd39f12b': {
                text: 'Como te llamas?'
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
                },
                {
                    uuid: 'd5293394-c6d4-407c-97da-8149faea24cf',
                    type: 'add_to_group',
                    groups: [
                        {
                            uuid: 'afaba971-8943-4dd8-860b-3561ed4f1fe1',
                            name: 'Testers'
                        }
                    ]
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

const { actions: [replyAction] } = node;

const {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints
} = new EditorConfig();

const ComponentMap = new CompMap(definition as any);

const nodeEditorProps: INodeEditorProps = {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints,
    node,
    action: replyAction,
    onUpdateAction: jest.fn(),
    onUpdateRouter: jest.fn(),
    onUpdateLocalizations: jest.fn(),
    ComponentMap
};

const NodeEditorShallow = shallow(<NodeEditor {...nodeEditorProps} />);
const ModalShallow = NodeEditorShallow.find(Modal);

describe('Component: NodeEditor', () => {
    it('should render itself, Modal', () => {
        expect(NodeEditorShallow).toBePresent();
        expect(ModalShallow).toBePresent();
        expect(ModalShallow).toHaveClassName(replyAction.type);
        expect(ModalShallow).toHaveProp('title', [<div>Send Message</div>]);
    });
});
