import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow, mount, render } from 'enzyme';
import { IChangeGroup } from '../../../flowTypes';
import { IWithActionProps } from '../../enhancers/withAction';
import { getSpecWrapper } from '../../../helpers/utils';
import EditorConfig from '../../../services/EditorConfig';
import CompMap from '../../../services/ComponentMap';
import LocalizationService, { LocalizedObject } from '../../../services/Localization';
import { languages } from '../../../flowEditorConfig';
import TitleBar from '../../TitleBar';
import ChangeGroupCompEnhanced, { ChangeGroupCompBase } from './ChangeGroupComp';

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

const addToGroupAction = node.actions[1] as IChangeGroup;

const { uuid, groups } = addToGroupAction;

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

const changeGroupProps = {
    groups
};

const actionProps = {
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
    Localization
};

const changeGroupCompProps: IWithActionProps = {
    ...changeGroupProps,
    ...actionProps
};

const ChangeGroupCompEnhancedShallow = shallow(<ChangeGroupCompEnhanced {...changeGroupCompProps} />);

describe('Component: ChangeGroup', () => {
    it('should render enhanced ChangeGroupComp & pass it appropriate props', () => {
        const ChangeGroupCompShallow = ChangeGroupCompEnhancedShallow.find({ type: 'add_to_group' });

        expect(ChangeGroupCompShallow).toBePresent()
        expect(ChangeGroupCompShallow).toHaveProp('groups', groups);
        expect(ChangeGroupCompShallow).toHaveProp('uuid', uuid);
    });

    it('should render base ChangeGroupComp with group name', () => {
        const ChangeGroupCompBaseShallow = shallow(<ChangeGroupCompBase{...changeGroupCompProps} />);

        expect(ChangeGroupCompBaseShallow).toHaveText(groups[0].name);
    });
});
