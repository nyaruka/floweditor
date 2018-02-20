import * as React from 'react';
import { shallow } from 'enzyme';
import CompMap from '../services/ComponentMap';
import Plumber from '../services/Plumber';
import ActivityManager from '../services/ActivityManager';
import Node, { NodeProps, getLocalizations } from './Node';
import { getBaseLanguage } from '.';

const {
    results: [{ uuid: flowUUID, definition }]
} = require('../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const { endpoints, languages } = require('../../assets/config');

const { nodes: [, node], localization: locals, _ui: { nodes: uiNodes } } = definition;
const Activity = new ActivityManager(flowUUID, jest.fn());
const ComponentMap = new CompMap(definition);
const baseLanguage = getBaseLanguage(languages);
const props: NodeProps = {
    ComponentMap,
    language: baseLanguage,
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
    node,
    onUpdateAction: jest.fn(),
    onUpdateRouter: jest.fn(),
    onUpdateLocalizations: jest.fn(),
    openEditor: jest.fn(),
    onMoveActionUp: jest.fn(),
    ui: uiNodes[node.uuid],
    Activity,
    translations: null,
    plumberDraggable: jest.fn(),
    plumberMakeTarget: jest.fn(),
    plumberRemove: jest.fn(),
    plumberRecalculate: jest.fn(),
    plumberMakeSource: jest.fn(),
    plumberConnectExit: jest.fn()
};
const iso = 'spa';
const translations = locals[iso];

describe('Node', () => {
    describe('helpers >', () => {
        describe('getLocalizations', () => {
            it('should compose a list of localizations', () =>
                expect(getLocalizations(node, iso, languages, translations)).toMatchSnapshot());
        });
    });

    describe('render >', () => {
        it('should render', () => {
            const wrapper = shallow(<Node {...props} />, {
                context: {
                    endpoints,
                    languages
                }
            });

            expect(wrapper.exists()).toBeTruthy();
            expect(wrapper.state('dragging')).toBeFalsy();
        });
    });
});
