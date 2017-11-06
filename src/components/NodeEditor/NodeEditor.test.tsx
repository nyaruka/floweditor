import * as React from 'react';
import '../../enzymeAdapter';
import { shallow } from 'enzyme';
import EditorConfig from '../../services/EditorConfig';
import CompMap from '../../services/ComponentMap';
import NodeEditor, { INodeEditorProps } from './index';

const {
    results: [{ definition }]
} = require('../../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const {
    typeConfigList,
    operatorConfigList,
    actionConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints
} = new EditorConfig();

const ComponentMap = new CompMap(definition);

const nodeEditorProps: INodeEditorProps = {
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
    ComponentMap,
};

const NodeEditorShallow = shallow(<NodeEditor {...nodeEditorProps} />);

xdescribe('Component: NodeEditor', () => {
    it('should render', () => {
        expect(NodeEditorShallow).toBePresent();
    });
});
