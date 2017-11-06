import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow, mount, render } from 'enzyme';
import { IChangeGroup } from '../../../flowTypes';
import { IActionProps } from '../../Action';
import { getSpecWrapper } from '../../../helpers/utils';
import EditorConfig from '../../../services/EditorConfig';
import CompMap from '../../../services/ComponentMap';
import LocalizationService, { LocalizedObject } from '../../../services/Localization';
import { languages } from '../../../flowEditorConfig';
import ChangeGroupComp from './ChangeGroupComp';

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

const addToGroupAction = node.actions[1];

const { groups } = addToGroupAction;

const {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints
} = new EditorConfig();

const ComponentMap = new CompMap(definition as any);

const Localization: LocalizedObject = LocalizationService.translate(
    addToGroupAction,
    flowLanguage,
    languages
);

const changeGroupCompProps: IActionProps & IChangeGroup = {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints,
    ComponentMap,
    node,
    action: addToGroupAction,
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
    Localization,
    groups
};

const ChangeGroupCompShallow = shallow(<ChangeGroupComp {...changeGroupCompProps} />);

xdescribe('Component: ChangeGroup', () => {
    it('ChangeGroupComp should render', () => {
        const [{ name: groupName }] = groups;
        expect(ChangeGroupCompShallow).toBePresent();
    });
});
