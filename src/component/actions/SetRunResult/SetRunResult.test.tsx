import * as React from 'react';
import { shallow } from 'enzyme';
import SetRunResult from './SetRunResult';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { language: flowLanguage, nodes: [, , , , node] } = definition;
const { actions: [setRunResultAction] } = node;
const { uuid, type, value, result_name } = setRunResultAction;

describe('SetRunResult >', () => {
    it("should render SetRunResult with 'save...' div when value prop passed", () => {
        const SaveFlowResultDiv = shallow(<SetRunResult {...setRunResultAction} />);

        expect(SaveFlowResultDiv.text()).toBe(`Save ${value} as ${result_name}`);
    });

    it("should render SetRunResult with 'clear...' div when value prop isn't passed", () => {
        const SaveFlowResultDiv = shallow(
            <SetRunResult {...{ ...setRunResultAction, value: '' }} />
        );

        expect(SaveFlowResultDiv.text()).toBe(`Clear value for ${result_name}`);
    });
});
