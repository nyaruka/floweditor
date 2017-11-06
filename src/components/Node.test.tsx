import * as React from 'react';
import '../enzymeAdapter';
import { shallow, mount } from 'enzyme';
import { languages } from '../flowEditorConfig';
import CompMap from '../services/ComponentMap';
import Plumber from '../services/Plumber';
import ActivityManager from '../services/ActivityManager';
import EditorConfig from '../services/EditorConfig';
import { NodeComp, INodeCompProps } from './Node';

const {
    results: [{ uuid: flowUUID, definition }]
} = require('../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const {
    typeConfigList,
    operatorConfigList,
    actionConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints
} = new EditorConfig();

const Activity = new ActivityManager(flowUUID, jest.fn());

const ComponentMap = new CompMap(definition);

const nodeCompProps: INodeCompProps = {
    ComponentMap,
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints,
    node: {
        uuid: '3b5964a4-58ca-4581-a4ba-8afc7d5838f9',
        exits: [{ uuid: '451f633d-d95b-4a54-8d7b-41778bf528d1' }],
        actions: [{ type: 'reply', uuid: '827c67cf-3acd-47b1-acae-37b71461549e' }]
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
    ui: {
        position: {
            x: 20,
            y: 20
        },
        dimensions: {
            width: 40,
            height: 30
        }
    },
    Activity,
    translations: {},
    language: 'spa',
    languages,
    plumberDraggable: jest.fn(),
    plumberMakeTarget: jest.fn(),
    plumberRemove: jest.fn(),
    plumberRecalculate: jest.fn(),
    plumberMakeSource: jest.fn(),
    plumberConnectExit: jest.fn()
};

const NodeCompShallow = shallow(<NodeComp {...nodeCompProps} />);

describe('Component: NodeComp', () => {
    it('should render', () => {
        expect(NodeCompShallow).toBePresent();
        expect(NodeCompShallow).toHaveState('dragging', false);
    });
});
