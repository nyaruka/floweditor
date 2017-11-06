import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow } from 'enzyme';
import { IChangeGroup } from '../../../flowTypes';
import { IActionProps } from '../../Action';
import EditorConfig from '../../../services/EditorConfig';
import CompMap from '../../../services/ComponentMap';
import { LocalizedObject } from '../../../services/Localization';
import { languages } from '../../../flowEditorConfig';
import ChangeGroupComp from './ChangeGroupComp';

const { results: groups } = require('../../../../assets/groups.json');

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

const {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints
} = new EditorConfig();

const ComponentMap = new CompMap(definition as any);

const Localization: LocalizedObject = new LocalizedObject(
    {
        uuid: '10e2b6f4-8587-463e-9248-a6069d4897d6'
    },
    'spa',
    languages
);

const changeGroupCompProps: IActionProps & IChangeGroup = {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints,
    ComponentMap,
    node: {
        uuid: 'd5293394-c6d4-407c-97da-8149faea24cf',
        type: 'add_to_group',
        groups: [
            {
                uuid: 'afaba971-8943-4dd8-860b-3561ed4f1fe1',
                name: 'Testers'
            }
        ]
    },
    action: {
        uuid: 'd5293394-c6d4-407c-97da-8149faea24cf',
        type: 'add_to_group',
        groups: [
            {
                uuid: 'afaba971-8943-4dd8-860b-3561ed4f1fe1',
                name: 'Testers'
            }
        ]
    },
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
        expect(ChangeGroupCompShallow).toBePresent();
    });
});
