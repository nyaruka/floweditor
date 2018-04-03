import { v4 as generateUUID } from 'uuid';
import { FlowDefinition, SetContactField, SetContactProperty } from '../../../flowTypes';
import { createSetup } from '../../../testUtils';
import { titleCase } from '../../../utils';
import SetContactAttribComp, { getFieldNameMarkup } from './SetContactAttrib';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { language: flowLanguage, nodes: [, , node] } = definition as FlowDefinition;
const { actions: [setContactProperty] } = node;

const setContactField: SetContactField = {
    uuid: generateUUID(),
    field: {
        key: 'age',
        name: 'Age'
    },
    value: '32',
    type: 'set_contact_field'
};

const setup = createSetup<SetContactProperty>(
    setContactProperty as SetContactProperty,
    null,
    SetContactAttribComp
);

const COMPONENT_TO_TEST = SetContactAttribComp.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        describe('helpers', () => {
            describe('getFieldNameMarkup', () => {
                it('should return emphasized property', () => {
                    expect(
                        getFieldNameMarkup(setContactProperty as SetContactProperty)
                    ).toMatchSnapshot();
                });

                it('should return emphasized field name', () => {
                    expect(
                        getFieldNameMarkup(setContactField as SetContactField)
                    ).toMatchSnapshot();
                });
            });
        });

        it(`should render ${COMPONENT_TO_TEST} with 'update...' div when value prop passed`, () => {
            const { wrapper, props: { property, value } } = setup();

            expect(wrapper.text()).toBe(`Update ${titleCase(property)} to ${value}`);
            expect(wrapper).toMatchSnapshot();
        });

        it(`should render ${COMPONENT_TO_TEST} with 'clear...' div when value prop isn't passed`, () => {
            const { wrapper, props: { property } } = setup({ value: '' });

            expect(wrapper.text()).toBe(`Clear value for ${titleCase(property)}`);
            expect(wrapper).toMatchSnapshot();
        });
    });
});
