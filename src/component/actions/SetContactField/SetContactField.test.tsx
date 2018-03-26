import * as React from 'react';
import { SetContactField, FlowDefinition } from '../../../flowTypes';
import { createSetup } from '../../../testUtils';
import SetContactFieldComp, { getFieldNameMarkup, getClearPlaceholder } from './SetContactField';
import { getUpdatePlaceholder } from './SetContactField';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { language: flowLanguage, nodes: [, , node] } = definition as FlowDefinition;
const { actions: [setContactFieldAction] } = node;

const setup = createSetup<SetContactField>(
    SetContactFieldComp,
    setContactFieldAction as SetContactField
);

const COMPONENT_TO_TEST = SetContactFieldComp.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it(`should render ${COMPONENT_TO_TEST} with update placeholder when value prop passed`, () => {
            const { wrapper, props: { field_name, value } } = setup({}, true);

            expect(wrapper.find('div').length).toBe(1);
            expect(
                wrapper.containsMatchingElement(
                    getUpdatePlaceholder(getFieldNameMarkup(field_name), value)
                )
            ).toBeTruthy();
        });

        it(`should render ${COMPONENT_TO_TEST} with clear placeholder when value prop isn't passed`, () => {
            const { wrapper, props: { field_name } } = setup({ value: '' }, true);

            expect(wrapper.find('div').length).toBe(1);
            expect(wrapper.containsMatchingElement(getClearPlaceholder(getFieldNameMarkup(field_name))).toBeTruthy
    });
});
