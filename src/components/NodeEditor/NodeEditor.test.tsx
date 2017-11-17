import * as React from 'react';
import '../../enzymeAdapter';
import { shallow } from 'enzyme';
import EditorConfig from '../../services/EditorConfig';
import CompMap from '../../services/ComponentMap';
import NodeEditor, { NodeEditorProps } from './index';

const {
    results: [{ definition }]
} = require('../../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const { nodes: [node], language: flowLanguage } = definition;

const { actions: [replyAction] } = node;

const {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints
} = new EditorConfig();

const ComponentMap = new CompMap(definition as any);

const nodeEditorProps: NodeEditorProps = {
    iso: 'eng',
    translating: false,
    show: true,
    definition,
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints,
    node,
    action: replyAction,
    onUpdateAction: jest.fn(),
    onUpdateRouter: jest.fn(),
    onUpdateLocalizations: jest.fn(),
    ComponentMap
};

const NodeEditorShallow = shallow(<NodeEditor {...nodeEditorProps} />);
const ModalShallow = NodeEditorShallow.find('Modal');

describe('Component: NodeEditor', () => {
    it('should render itself, Modal', () => {
        expect(NodeEditorShallow.exists()).toBeTruthy();
        expect(ModalShallow.exists()).toBeTruthy();
        expect(ModalShallow.hasClass(replyAction.type)).toBeTruthy();
        expect(ModalShallow.prop('title')).toEqual([
            <div>Send Message</div>,
            <div>
                <div>Send Message</div>
                <div className="advanced_title">Advanced Settings</div>
            </div>
        ]);
    });
});
