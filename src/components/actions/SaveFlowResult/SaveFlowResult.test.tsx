import * as React from 'react';
import { shallow } from 'enzyme';
import SaveFlowResult from './SaveFlowResult';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { language: flowLanguage, nodes: [, , , , node] } = definition;
const { actions: [saveFlowResultAction] } = node;
const { uuid, type, value, result_name } = saveFlowResultAction;

describe('Component: SaveFlowResult', () => {
    it("should render SaveFlowResult with 'save...' div when value prop passed", () => {
        const SaveFlowResultDiv = shallow(<SaveFlowResult {...saveFlowResultAction} />);

        expect(SaveFlowResultDiv.text()).toBe(`Save ${value} as ${result_name}`);
    });

    it("should render SaveFlowResult with 'clear...' div when value prop isn't passed", () => {
        const SaveFlowResultDiv = shallow(
            <SaveFlowResult {...{ ...saveFlowResultAction, value: '' }} />
        );

        expect(SaveFlowResultDiv.text()).toBe(`Clear value for ${result_name}`);
    });
});
