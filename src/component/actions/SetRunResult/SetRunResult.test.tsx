import * as React from 'react';
import { FlowDefinition, SetRunResult } from '../../../flowTypes';
import { createSetup, Resp } from '../../../testUtils';
import SetRunResultComp, {
    getClearPlaceholder,
    getResultNameMarkup,
    getSavePlaceholder
} from './SetRunResult';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json') as Resp;
const { language: flowLanguage, nodes: [, , , , node] } = definition as FlowDefinition;
const { actions: [setRunResultAction] } = node;

const setup = createSetup<SetRunResult>(SetRunResultComp, setRunResultAction as SetRunResult);

const COMPONENT_TO_TEST = SetRunResultComp.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    it(`should render ${COMPONENT_TO_TEST} with save placeholder when value prop passed`, () => {
        const { wrapper, props: { value, result_name } } = setup({}, true);

        expect(
            wrapper.containsMatchingElement(
                getSavePlaceholder(value, getResultNameMarkup(result_name))
            )
        ).toBeTruthy();
        expect(wrapper).toMatchSnapshot();
    });

    it(`should render ${COMPONENT_TO_TEST} with clear placholder when value prop isn't passed`, () => {
        const { wrapper, props: { result_name } } = setup({ value: '' }, true);

        expect(
            wrapper.containsMatchingElement(getClearPlaceholder(getResultNameMarkup(result_name)))
        ).toBeTruthy();
        expect(wrapper).toMatchSnapshot();
    });
});
