import { getTypeConfig } from '../../../config';
import { Types } from '../../../config/typeConfigs';
import { composeComponentTestUtils, restoreSpies, setMock } from '../../../testUtils';
import {
    createSetContactFieldAction,
    createSetContactNameAction,
    English,
    languages,
    createSetContactLanguageAction,
    Spanish
} from '../../../testUtils/assetCreators';
import ConnectedTextInputElement from '../../form/TextInputElement';
import { propertyToAsset } from './helpers';
import { SetContactAttribForm, SetContactAttribFormProps } from './SetContactAttribForm';
import { SetContactAttribFormHelper } from './SetContactAttribFormHelper';

const setContactNameAction = createSetContactNameAction();
const setContactFieldAction = createSetContactFieldAction();
const setContactLanguageAction = createSetContactLanguageAction();

const formHelper = new SetContactAttribFormHelper();

// starting w/ Types.set_contact_field props
const baseProps: SetContactAttribFormProps = {
    action: setContactFieldAction,
    formHelper,
    typeConfig: getTypeConfig(Types.set_contact_field),
    form: formHelper.actionToState(setContactFieldAction, Types.set_contact_field),
    languages,
    baseLanguage: English,
    updateAction: jest.fn(),
    updateSetContactAttribForm: jest.fn()
};

const { setup, spyOn } = composeComponentTestUtils(SetContactAttribForm, baseProps);

describe(SetContactAttribForm.name, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper, props } = setup();

            expect(wrapper).toMatchSnapshot();
            expect(wrapper.find(ConnectedTextInputElement).prop('entry')).toEqual({
                value: props.form.value.value
            });

            const setContactNameForm = formHelper.actionToState(
                setContactNameAction,
                Types.set_contact_name
            );

            // User changes attribute to Name
            wrapper.setProps({
                action: setContactNameAction,
                form: setContactNameForm,
                typeConfig: getTypeConfig(Types.set_contact_name)
            });

            expect(wrapper.find(ConnectedTextInputElement).prop('entry')).toEqual(
                setContactNameForm.value
            );
        });

        it('should render language dropdown', () => {
            const { wrapper } = setup(true, {
                action: { $set: setContactLanguageAction },
                typeConfig: { $set: getTypeConfig(Types.set_contact_language) },
                form: {
                    $set: formHelper.actionToState(
                        setContactLanguageAction,
                        Types.set_contact_language
                    )
                }
            });

            expect(wrapper.find('FormElement').exists()).toBeTruthy();
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        describe('onValid', () => {
            it('should call updateAction prop with new set_contact_field action', () => {
                const { wrapper, instance, props } = setup(true, {
                    updateAction: setMock()
                });

                instance.onValid();

                expect(props.updateAction).toHaveBeenCalledTimes(1);
                expect(props.updateAction).toHaveBeenCalledWith(
                    props.formHelper.stateToAction(
                        props.action.uuid,
                        props.form,
                        props.typeConfig.type
                    )
                );
            });
        });

        describe('handleAttribChange', () => {
            it('should call form-state-updater-thunk', () => {
                const { wrapper, instance, props } = setup(true, {
                    updateSetContactAttribForm: { $set: jest.fn().mockReturnValue(true) }
                });
                const attribute = propertyToAsset(setContactNameAction.type);

                instance.handleAttribChange(attribute);

                expect(props.updateSetContactAttribForm).toHaveBeenCalledTimes(1);
            });
        });

        describe('handleValueChange', () => {
            it('should call form-state-updater-thunk', () => {
                const { wrapper, instance, props } = setup(true, {
                    updateSetContactAttribForm: { $set: jest.fn().mockReturnValue(true) }
                });
                instance.handleValueChange('26');
                expect(props.updateSetContactAttribForm).toHaveBeenCalledTimes(1);
                expect(props.updateSetContactAttribForm).toHaveBeenCalledWith(null, {
                    value: '26'
                });
            });
        });

        describe('handleLanguageChange', () => {
            it('should update form', () => {
                const { wrapper, instance, props } = setup(true, {
                    action: { $set: setContactLanguageAction },
                    typeConfig: { $set: getTypeConfig(Types.set_contact_language) },
                    form: {
                        $set: formHelper.actionToState(
                            setContactLanguageAction,
                            Types.set_contact_language
                        )
                    },
                    updateSetContactAttribForm: setMock()
                });

                instance.handleLanguageChange([Spanish]);

                expect(props.updateSetContactAttribForm).toHaveBeenCalledTimes(1);
            });
        });

        describe('validate', () => {
            it('should validate Attribute input', () => {
                const handleAttribChangeSpy = spyOn('handleAttribChange');
                const getAttributeEntrySpy = spyOn('getAttributeEntry');
                const { wrapper, instance, props } = setup(true, {
                    updateSetContactAttribForm: setMock(() => ({
                        valid: true
                    }))
                });

                const valid = instance.validate();

                expect(valid).toBeTruthy();
                expect(getAttributeEntrySpy).toHaveBeenCalled();
                expect(handleAttribChangeSpy).toHaveBeenCalledTimes(1);

                restoreSpies(handleAttribChangeSpy, getAttributeEntrySpy);
            });
        });
    });
});
