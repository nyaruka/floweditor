import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Interfaces from '../src/interfaces';
import FlowLoaderComp from '../src/components/FlowLoaderComp';
import { ShallowWrapper, mount, render } from 'enzyme';

function dump(object: any) {
    console.log(JSON.stringify(object, null, 1));
}

describe('Flow', () => {

    var flow;
    beforeEach(() => {});
    afterEach(() => {});

    it('should render', () => {
        let wrapper = mount(<FlowLoaderComp flowURL='base/test_flows/two_questions.json' engineURL='' contactsURL='' fieldsURL=''/>);
        wrapper.update();
        chai.assert.isNotNull(wrapper);
        // console.log(wrapper.html());
        //console.log(JSON.stringify(wrapper, null, 2));
        // TODO: determine strategy for testing upon completed axios call in componentDidUpdate

        console.log("COMPLETE");
    });

});