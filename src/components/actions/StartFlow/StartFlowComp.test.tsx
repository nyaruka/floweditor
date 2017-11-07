import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow } from 'enzyme';
import { IWithActionProps } from '../../enhancers/withAction';
import EditorConfig from '../../../services/EditorConfig';
import CompMap from '../../../services/ComponentMap';
import LocalizationService, { LocalizedObject } from '../../../services/Localization';
import { languages } from '../../../flowEditorConfig';
import StartFlowCompEnhanced, { StartFlowCompBase } from './StartFlowComp';

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
            uuid: 'f1f9320e-4b7c-4b3a-baa2-88dfe08f5491',
            router: {
                type: 'switch',
                operand: '@child',
                cases: [
                    {
                        uuid: '776cc8fc-1312-4321-8ac9-8d6c8629f27d',
                        type: 'has_run_status',
                        arguments: ['C'],
                        exit_uuid: '97065e15-f793-4ff2-8ae6-80bbc4df4566'
                    }
                ],
                default_exit_uuid: null
            },
            exits: [
                {
                    uuid: '97065e15-f793-4ff2-8ae6-80bbc4df4566',
                    name: 'Complete'
                }
            ],
            actions: [
                {
                    uuid: '81736952-436a-476e-ac4f-604cbfe3a004',
                    type: 'start_flow',
                    flow_name: 'Collect Child Details',
                    flow_uuid: '23ff7152-b588-43e4-90de-fda77aeaf7c0'
                }
            ],
            wait: {
                type: 'flow',
                flow_uuid: '23ff7152-b588-43e4-90de-fda77aeaf7c0'
            }
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
            'f1f9320e-4b7c-4b3a-baa2-88dfe08f5491': {
                position: {
                    x: 526,
                    y: 199
                },
                type: 'subflow'
            }
        }
    }
};

const { nodes: [node], language: flowLanguage } = definition;

const { actions: [startFlowAction]} = node;

const { uuid, type, flow_name, flow_uuid } = startFlowAction;

const {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints
} = new EditorConfig();

const ComponentMap = new CompMap(definition as any);

const Localization: LocalizedObject = LocalizationService.translate(
    startFlowAction,
    flowLanguage,
    languages
);

const startFlowProps = {
    flow_name
};

const actionProps = {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints,
    ComponentMap,
    node,
    action: startFlowAction,
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

const startFlowCompProps: IWithActionProps = {
    ...startFlowProps,
    ...actionProps
};

describe('Component: StartFlowComp', () => {
    it('should render enhanced StartFlowComp & pass it appropriate props', () => {
        const StartFlowCompEnhancedShallow = shallow(<StartFlowCompEnhanced {...startFlowCompProps} />);
        const StartFlowCompShallow = StartFlowCompEnhancedShallow.find({ type });

        expect(StartFlowCompShallow).toBePresent();
        expect(StartFlowCompShallow).toHaveProp('uuid', uuid);
        expect(StartFlowCompShallow).toHaveProp('flow_uuid', flow_uuid);
        expect(StartFlowCompShallow).toHaveProp('flow_name', flow_name);
    });

    it('should render base StartFlowComp with flow name', () => {
        const ChangeGroupCompBaseShallow = shallow(<StartFlowCompBase{...startFlowCompProps} />);

        expect(ChangeGroupCompBaseShallow).toHaveText(flow_name);
    });
});
