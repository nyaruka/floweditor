import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {NodeComp, NodeState} from '../src/components/Node';
import * as Interfaces from '../src/interfaces';

import { ShallowWrapper, shallow, mount, render } from 'enzyme';

function dump(object: any) {
    console.log(JSON.stringify(object, null, 1));
}

describe('Nodes', () => {

    describe('Router Node', ()=>{
        let wrapper: ShallowWrapper<Interfaces.NodeProps, NodeState>;
        
        beforeEach(() => {
            var testProps = {
                _ui: {
                    location: { x: 100, y: 200}
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
            chai.assert.equal(node.length, 1);
            chai.assert.isTrue(node.hasClass('node'));
            chai.assert.isTrue(node.hasClass('z-depth-1'));
            chai.assert.deepEqual(node.props().style, {left: 100, top: 200});

            // check we got the split title
            chai.assert.equal(node.find('.split-title').text(), 'Split');
        });
    });

    describe('Action Node', ()=>{

        var testProps: Interfaces.NodeProps;

        beforeEach(() => {
            testProps = {
                _ui: {
                    location: { x: 100, y: 200}
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
            let wrapper = shallow(<NodeComp {...testProps} />);
            chai.assert.isNotNull(wrapper.find('#abcd-1234'));
        });

        it('should render with proper html', () => {
            var rendered = render(<NodeComp {...testProps} />);
            var node = rendered.find('#abcd-1234');
            
            chai.assert.isTrue(node.hasClass('node'));
            chai.assert.isTrue(node.hasClass('z-depth-1'));
            chai.expect(node.attr('style')).to.contain('left:100px;top:200px');
            
            var action = node.find('.action').first()
            chai.assert.isNotNull(action);
            chai.assert.equal('Send Message', action.find('.action-title').text());
        });
    });
});