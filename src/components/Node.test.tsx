import * as React from 'react';
import '../enzymeAdapter';
import { shallow, mount } from 'enzyme';
import { languages } from '../flowEditorConfig';
import CompMap from '../services/ComponentMap';
import Plumber from '../services/Plumber';
import ActivityManager from '../services/ActivityManager';
import EditorConfig from '../services/EditorConfig';
import Node, { INodeCompProps } from './Node';

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
    isMutable: jest.fn(() => true),
    onNodeMounted: jest.fn(),
    onUpdateDimensions: jest.fn(),
    onNodeMoved: jest.fn(),
    onNodeDragStart: jest.fn(),
    onNodeBeforeDrag: jest.fn(),
    onDisconnectExit: jest.fn(),
    onNodeDragStop: jest.fn(),
    onAddAction: jest.fn(),
    onRemoveAction: jest.fn(),
    onRemoveNode: jest.fn(),
    baseLanguage: { name: 'Spanish', iso: 'spa' },
    node: {
        uuid: '3b5964a4-58ca-4581-a4ba-8afc7d5838f9',
        exits: [{ uuid: '451f633d-d95b-4a54-8d7b-41778bf528d1' }],
        actions: [{ type: 'reply', uuid: '827c67cf-3acd-47b1-acae-37b71461549e' }]
    },
    onUpdateAction: jest.fn(),
    onUpdateRouter: jest.fn(),
    onUpdateLocalizations: jest.fn(),
    openEditor: jest.fn(),
    onMoveActionUp: jest.fn(),
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
    iso: 'spa',
    languages,
    plumberDraggable: jest.fn(),
    plumberMakeTarget: jest.fn(),
    plumberRemove: jest.fn(),
    plumberRecalculate: jest.fn(),
    plumberMakeSource: jest.fn(),
    plumberConnectExit: jest.fn()
};

const NodeShallow = shallow(<Node {...nodeCompProps} />);

describe('Component: NodeComp', () => {
    it('should render', () => {
        expect(NodeShallow.exists()).toBeTruthy();
        expect(NodeShallow.state('dragging')).toBeFalsy();
    });
});
