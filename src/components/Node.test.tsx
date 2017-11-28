jest.mock('Config');

import * as React from 'react';
import '../enzymeAdapter';
import { shallow } from 'enzyme';
import CompMap from '../services/ComponentMap';
import Plumber from '../services/Plumber';
import ActivityManager from '../services/ActivityManager';
import EditorConfig from '../services/EditorConfig';
import { languages } from 'Config';
import Node, { NodeProps } from './Node';

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
const props: NodeProps = {
    ComponentMap,
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints,
    iso: 'eng',
    translating: false,
    definition,
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
    node: definition.nodes[0],
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
    translations: null,
    languages,
    plumberDraggable: jest.fn(),
    plumberMakeTarget: jest.fn(),
    plumberRemove: jest.fn(),
    plumberRecalculate: jest.fn(),
    plumberMakeSource: jest.fn(),
    plumberConnectExit: jest.fn()
};

const NodeShallow = shallow(<Node {...props} />);

describe('Component: NodeComp', () => {
    it('should render', () => {
        expect(NodeShallow.exists()).toBeTruthy();
        expect(NodeShallow.state('dragging')).toBeFalsy();
    });
});
