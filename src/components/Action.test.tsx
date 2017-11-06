import * as React from 'react';
import '../enzymeAdapter';
import { shallow } from 'enzyme';
import EditorConfig from '../services/EditorConfig';
import CompMap from '../services/ComponentMap';
import { LocalizedObject } from '../services/Localization';
import { languages } from '../flowEditorConfig';
import { ActionComp, IActionProps } from './Action';

const {
    results: [{ definition }]
} = require('../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints
} = new EditorConfig();

const ComponentMap = new CompMap(definition);

const Localization: LocalizedObject = new LocalizedObject(
    {
        uuid: '10e2b6f4-8587-463e-9248-a6069d4897d6'
    },
    'spa',
    languages
);

const actionProps: IActionProps = {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints,
    ComponentMap,
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
    dragging: false,
    hasRouter: false,
    first: true,
    action: { type: 'reply', uuid: '827c67cf-3acd-47b1-acae-37b71461549e' },
    Localization
};

const ActionCompShallow = shallow(<ActionComp {...actionProps} />);

describe('Component: ActionComp', () => {
    it('should mount', () => {
        expect(ActionCompShallow).toBePresent();
    });
});
