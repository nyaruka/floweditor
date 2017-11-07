import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow } from 'enzyme';
import { IWithActionProps } from '../../enhancers/withAction';
import { getSpecWrapper } from '../../../helpers/utils';
import EditorConfig from '../../../services/EditorConfig';
import CompMap from '../../../services/ComponentMap';
import LocalizationService, { LocalizedObject } from '../../../services/Localization';
import { languages } from '../../../flowEditorConfig';
import TitleBar from '../../TitleBar';
import SaveToContactCompEnhanced, { SaveToContactCompBase } from './SaveToContactComp';

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
                    destination: null,
                    destination_node_uuid: '82bd47ed-44c9-4946-a035-ca0232d3b920'
                }
            ]
        },
        {
            uuid: '82bd47ed-44c9-4946-a035-ca0232d3b920',
            router: {
                type: 'switch',
                default_exit_uuid: '200b3957-12a4-4be1-a361-5628a6dc4ee5',
                cases: [],
                operand: '@input',
                result_name: 'Name'
            },
            exits: [
                {
                    uuid: '200b3957-12a4-4be1-a361-5628a6dc4ee5',
                    name: 'All Responses',
                    destination_node_uuid: 'b60337f6-d595-44bb-83f0-7d1ce1d6aa9a'
                }
            ],
            wait: {
                type: 'msg'
            }
        },
        {
            uuid: 'b60337f6-d595-44bb-83f0-7d1ce1d6aa9a',
            actions: [
                {
                    uuid: '37c8ee53-bbbf-445a-8aee-fd6e7b7c7de8',
                    type: 'update_contact',
                    field_name: 'name',
                    value: '@run.results.name '
                },
                {
                    uuid: 'ae9e157f-71b4-49d9-8a76-aaf80fee53bd',
                    type: 'reply',
                    text: 'Thanks @contact.name! '
                }
            ],
            exits: [
                {
                    name: null,
                    uuid: '59a3f38c-89d5-4e10-80b4-880f602a2619',
                    destination_node_uuid: null
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
            },
            '82bd47ed-44c9-4946-a035-ca0232d3b920': {
                position: {
                    x: 284,
                    y: 201
                },
                type: 'wait_for_response'
            },
            'b60337f6-d595-44bb-83f0-7d1ce1d6aa9a': {
                position: {
                    x: 22,
                    y: 341
                }
            }
        }
    }
};

const { language: flowLanguage } = definition;

const node = definition.nodes[2];

const { actions: [saveToContactAction] } = node;

const { uuid, type, field_name, value } = saveToContactAction;

const {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints
} = new EditorConfig();

const ComponentMap = new CompMap(definition as any);

const Localization: LocalizedObject = LocalizationService.translate(
    saveToContactAction,
    flowLanguage,
    languages
);

const saveToContactProps = {
    field_name,
    value
};

const actionProps = {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints,
    ComponentMap,
    node,
    action: saveToContactAction,
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

const saveToContactCompProps: IWithActionProps = {
    ...saveToContactProps,
    ...actionProps
};

describe('Component: SaveToContactComp', () => {
    it('should render enhanced SaveToContactComp and pass it appropriate props', () => {
        const SaveToContactEnhancedShallow = shallow(<SaveToContactCompEnhanced {...saveToContactCompProps} />);
        const SaveToContactShallow = SaveToContactEnhancedShallow.find({ type });

        expect(SaveToContactShallow).toBePresent();
        expect(SaveToContactShallow).toHaveProp('field_name', field_name);
        expect(SaveToContactShallow).toHaveProp('value', value);
    });

    it("should render base SaveToContactComp with 'update...' div when value prop passed", () => {
        const SaveToContactCompBaseShallow = shallow(<SaveToContactCompBase {...saveToContactProps} />);

        expect(SaveToContactCompBaseShallow).toHaveText(`Update ${field_name} to ${value}`);
    });

    it("should render base SaveToContactComp with 'clear...' div when value prop isn't passed", () => {
        const SaveToContactCompBaseShallow = shallow(<SaveToContactCompBase field_name={field_name} />);

        expect(SaveToContactCompBaseShallow).toHaveText(`Clear value for ${field_name}`);
    });
});
