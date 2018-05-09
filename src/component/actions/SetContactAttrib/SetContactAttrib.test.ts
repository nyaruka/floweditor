import { SetContactField, SetContactProperty, SetContactName } from '../../../flowTypes';
import { composeComponentTestUtils } from '../../../testUtils';
import {
    createSetContactFieldAction,
    createSetContactNameAction
} from '../../../testUtils/assetCreators';
import { setEmpty, titleCase } from '../../../utils';
import SetContactAttribComp, { getAttribNameMarkup } from './SetContactAttrib';
import { name } from '../SendBroadcast/SendBroadcast.scss';

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
                it('should return emphasized property', () => {
                    expect(
                        getAttribNameMarkup(setContactName as SetContactProperty)
                    ).toMatchSnapshot();
                });

                it('should return emphasized field name', () => {
                    expect(
                        getAttribNameMarkup(setContactField as SetContactField)
                    ).toMatchSnapshot();
                });
            });
        });

        it("should render with 'update...' div when value prop passed", () => {
            const { wrapper, props } = setup();

            expect(wrapper.text()).toBe(`Update Name to ${(props as SetContactName).name}`);
            expect(wrapper).toMatchSnapshot();
        });

        it("should render with 'clear...' div when value prop isn't passed", () => {
            const { wrapper, props } = setup(true, {
                name: { $set: '' }
            });

            expect(wrapper.text()).toBe('Clear value for Name');
            expect(wrapper).toMatchSnapshot();
        });
    });
});
