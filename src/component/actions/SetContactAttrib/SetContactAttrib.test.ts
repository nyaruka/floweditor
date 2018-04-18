import { SetContactField, SetContactProperty } from '../../../flowTypes';
import { composeComponentTestUtils } from '../../../testUtils';
import {
    createSetContactFieldAction,
    createSetContactPropertyAction
} from '../../../testUtils/assetCreators';
import { setEmpty, titleCase } from '../../../utils';
import SetContactAttribComp, { getFieldNameMarkup } from './SetContactAttrib';

const setContactProperty = createSetContactPropertyAction();
const setContactField = createSetContactFieldAction();

const { setup } = composeComponentTestUtils<SetContactProperty | SetContactField>(
    SetContactAttribComp,
    setContactProperty as SetContactProperty
);

describe(SetContactAttribComp.name, () => {
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

        it("should render with 'update...' div when value prop passed", () => {
            const { wrapper, props } = setup();

            expect(wrapper.text()).toBe(
                `Update ${titleCase((props as SetContactProperty).property)} to ${props.value}`
            );
            expect(wrapper).toMatchSnapshot();
        });

        it("should render with 'clear...' div when value prop isn't passed", () => {
            const { wrapper, props } = setup(true, {
                value: setEmpty()
            });

            expect(wrapper.text()).toBe(
                `Clear value for ${titleCase((props as SetContactProperty).property)}`
            );
            expect(wrapper).toMatchSnapshot();
        });
    });
});
