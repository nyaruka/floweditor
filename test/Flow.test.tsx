import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Interfaces from '../src/interfaces';
import FlowComp from '../src/components/FlowComp';
import { ShallowWrapper, shallow, mount, render } from 'enzyme';

function dump(object: any) {
    console.log(JSON.stringify(object, null, 1));
}

describe('Flow', () => {

    beforeEach(() => {});
    afterEach(() => {});

    it('should render', () => {
        let wrapper = mount(<FlowComp flowURL='base/test_flows/two_questions.json' engineURL='' contactsURL='' fieldsURL=''/>);
        chai.assert.isNotNull(wrapper);

        // TODO: determine strategy for testing upon completed axios call in componentDidUpdate
    });

});