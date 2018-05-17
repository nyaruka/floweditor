import { SetContactField, SetContactLanguage, SetContactName, SetContactProperty } from '../../../flowTypes';
import { composeComponentTestUtils } from '../../../testUtils';
import {
    createSetContactFieldAction,
    createSetContactLanguageAction,
    createSetContactNameAction,
} from '../../../testUtils/assetCreators';
import { getLanguage } from '../../../utils/languageMap';
import { name } from '../SendBroadcast/SendBroadcast.scss';
import SetContactAttribComp, { getAttribNameMarkup } from './SetContactAttrib';

const setContactNameAction = createSetContactNameAction();
const setContactFieldAction = createSetContactFieldAction();
const setContactLanguageAction = createSetContactLanguageAction();

const { setup } = composeComponentTestUtils<SetContactProperty | SetContactField>(
    SetContactAttribComp,
    setContactNameAction as SetContactProperty
);

describe(SetContactAttribComp.name, () => {
    describe('render', () => {
        describe('helpers', () => {
            describe('getAttribNameMarkup', () => {
                it('should return emphasized name property', () => {
                    expect(
                        getAttribNameMarkup(setContactNameAction as SetContactName)
                    ).toMatchSnapshot();
                });

                it('should return emphasized field name', () => {
                    expect(
                        getAttribNameMarkup(setContactFieldAction as SetContactField)
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
                $set: setContactFieldAction
            });

            expect(wrapper.text()).toBe(
                `Update ${(props as SetContactField).field.name} to ${
                    (props as SetContactField).value
                }`
            );
            expect(wrapper).toMatchSnapshot();
        });

        it("should render with 'update...' div when passed set_contact_language action", () => {
            const { wrapper, props } = setup(true, {
                $set: setContactLanguageAction
            });

            const { name: language } = getLanguage((props as SetContactLanguage).language);

            expect(wrapper.text()).toBe(`Update Language to ${language}`);
            expect(wrapper).toMatchSnapshot();
        });

        it("should render with 'clear...' div when name prop isn't passed: set_contact_name", () => {
            const { wrapper, props } = setup(true, {
                name: { $set: '' }
            });

            expect(wrapper.text()).toBe('Clear value for Name');
            expect(wrapper).toMatchSnapshot();
        });

        it("should render with 'clear...' div when value prop isn't passed: set_contact_field", () => {
            const { wrapper, props } = setup(true, {
                $set: { ...setContactFieldAction, value: '' }
            });

            expect(wrapper.text()).toBe(`Clear value for ${(props as SetContactField).field.name}`);
            expect(wrapper).toMatchSnapshot();
        });

        it("should render with 'clear...' div when value prop isn't passed: set_contact_language", () => {
            const { wrapper, props } = setup(true, {
                $set: { ...setContactLanguageAction, language: '' }
            });

            expect(wrapper.text()).toBe(`Clear value for Language`);
            expect(wrapper).toMatchSnapshot();
        });
    });
    });
});
