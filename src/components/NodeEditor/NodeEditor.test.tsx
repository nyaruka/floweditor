import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import CompMap from '../../services/ComponentMap';
import NodeEditor, { NodeEditorProps } from './index';
import context from '../../providers/ConfigProvider/configContext';

const {
    results: [{ definition }]
} = require('../../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const { nodes: [node], language: flowLanguage } = definition;

const { actions: [replyAction] } = node;

const ComponentMap = new CompMap(definition);

const props: NodeEditorProps = {
    language: flowLanguage,
    translating: false,
    show: true,
    definition,
    node,
    action: replyAction,
    onUpdateAction: jest.fn(),
    onUpdateRouter: jest.fn(),
    onUpdateLocalizations: jest.fn(),
    ComponentMap
};

describe('NodeEditor >', () => {
    describe('render >', () => {
        it('should render itself, modal', () => {
            const wrapper: ShallowWrapper = shallow(<NodeEditor {...props} />, {
                context
            });

            const modal: ShallowWrapper = wrapper.find('Modal');

            expect(wrapper.exists()).toBeTruthy();
            expect(modal.exists()).toBeTruthy();
            expect(modal.prop('__className')).toBe(replyAction.type);
            expect(modal.prop('title')).toEqual([
                <div key={'front'}>Send Message</div>,
                <div key={'advanced'}>
                    <div>Send Message</div>
                    <div className="advanced_title">Advanced Settings</div>
                </div>
            ]);
        });
    });
});
