import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { NodeComp, NodeState } from '../components/Node';
import { FlowLoader, FlowLoaderProps } from '../components/FlowLoader';
import { ShallowWrapper, shallow, mount, render } from 'enzyme';

xdescribe('Nodes', () => {

    describe('Router Node', ()=>{
        let wrapper: ShallowWrapper<Interfaces.NodeProps, NodeState>;

        beforeEach(() => {
            var testProps = {
                _ui: {
                    position: { x: 100, y: 200}
                },
                uuid: 'abcd-1234'
            } as Interfaces.NodeProps;

            wrapper = shallow(<NodeComp {...testProps} />);
        });

        it('should render', () => {
            var node = wrapper.find('#abcd-1234');
            chai.assert.isNotNull(node);
        });

        it('should have correct prop values', () => {
            var node = wrapper.find('#abcd-1234');
            chai.assert.isTrue(node.hasClass('node'), "Missing node class");
            chai.assert.isTrue(node.hasClass('z-depth-1'), "Not z-depth-1: " + node.debug());
            chai.assert.deepEqual(node.props().style, {left: 100, top: 200});

            // check we got the split title
            chai.assert.equal(node.find('.split-title').text(), 'Split');
        });
    });

    describe('Action Node', ()=>{

        var testProps: Interfaces.NodeProps;
        var mockContext: Interfaces.FlowContext;

        class MockFlow extends Flow {
            constructor() {
                super({flowURL:null, engineURL:null, contactsURL:null, fieldsURL:null})
            }
        }

        beforeEach(() => {

            mockContext = {
                flow: new MockFlow()
            }

            testProps = {
                _ui: {
                    position: { x: 100, y: 200}
                },
                actions: [{
                    uuid: 'action-1234',
                    type: 'msg',
                    text: 'Hi @contact.name. How are you?'
                } as Interfaces.SendMessageProps ],
                uuid: 'abcd-1234',
                exits: [{
                        uuid: 'exit1',
                        destination: null
                } as Interfaces.ExitProps ]

            } as Interfaces.NodeProps;
        });

        it('should render', () => {
            let wrapper = shallow(<NodeComp {...testProps}/>, { context: mockContext });
            chai.assert.isNotNull(wrapper.find('#abcd-1234'));
            chai.expect(wrapper.instance().props.uuid).to.equal("abcd-1234")
        });

        it('should render with proper html', () => {
            var rendered = render(<NodeComp {...testProps} />);
            var node = rendered.find('#abcd-1234');

            chai.assert.isTrue(node.hasClass('node'), "Missing node class: " + node.html());
            chai.assert.isTrue(node.hasClass('z-depth-1'), "Not z-depth-1: " + node.attr("class"));
            chai.expect(node.attr('style')).to.contain('left:100px;top:200px');

            var action = node.find('.action').first()
            chai.assert.isNotNull(action, "First action is missing" + node.html());
            chai.assert.equal('Send Message', action.find('.action-title').text());
        });
    });
});
