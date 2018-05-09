import { SetContactField, SetContactName, SetContactProperty } from '../../../flowTypes';
import { composeComponentTestUtils } from '../../../testUtils';
import {
    createSetContactFieldAction,
    createSetContactNameAction
} from '../../../testUtils/assetCreators';
import { name } from '../SendBroadcast/SendBroadcast.scss';
import SetContactAttribComp, { getAttribNameMarkup } from './SetContactAttrib';

const setContactName = createSetContactNameAction();
const setContactField = createSetContactFieldAction();

const { setup } = composeComponentTestUtils<SetContactProperty | SetContactField>(
    SetContactAttribComp,
    setContactName as SetContactProperty
);

describe(SetContactAttribComp.name, () => {
    describe('render', () => {
        describe('helpers', () => {
            describe('getAttribNameMarkup', () => {
                it('should return emphasized name property', () => {
                    expect(getAttribNameMarkup(setContactName as SetContactName)).toMatchSnapshot();
                });

                it('should return emphasized field name', () => {
                    expect(
                        getAttribNameMarkup(setContactField as SetContactField)
                    ).toMatchSnapshot();
                });
            });
        });

        it("should render with 'update...' div when passed set_contact_name action", () => {
            const { wrapper, props } = setup();

            expect(wrapper.text()).toBe(`Update Name to ${(props as SetContactName).name}`);
            expect(wrapper).toMatchSnapshot();
        });

        it("should render with 'update...' div when passed set_contact_field action", () => {
            const { wrapper, props } = setup(true, {
                $set: setContactField
            });

            expect(wrapper.text()).toBe(
                `Update ${(props as SetContactField).field.name} to ${
                    (props as SetContactField).value
                }`
            );
            expect(wrapper).toMatchSnapshot();
        });

        it("should render with 'clear...' div when name prop isn't passed", () => {
            const { wrapper, props } = setup(true, {
                name: { $set: '' }
            });

            expect(wrapper.text()).toBe('Clear value for Name');
            expect(wrapper).toMatchSnapshot();
        });

        it("should render with 'clear...' div when value prop isn't passed", () => {
            const { wrapper, props } = setup(true, {
                $set: { ...setContactField, value: '' }
            });

            expect(wrapper.text()).toBe(`Clear value for ${(props as SetContactField).field.name}`);
            expect(wrapper).toMatchSnapshot();
        });
    });
});
