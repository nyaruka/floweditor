import ConnectedTextInputElement from '~/component/form/TextInputElement';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { composeComponentTestUtils, restoreSpies, setMock } from '~/testUtils';
import {
    createSetContactChannelAction,
    createSetContactFieldAction,
    createSetContactLanguageAction,
    createSetContactNameAction,
    English,
    languages,
    Spanish
} from '~/testUtils/assetCreators';

import { propertyToAsset } from './helpers';
import { SetContactAttribForm, SetContactAttribFormProps } from './SetContactAttribForm';
import { SetContactAttribFormHelper } from './SetContactAttribFormHelper';

const setContactNameAction = createSetContactNameAction();
const setContactFieldAction = createSetContactFieldAction();
const setContactLanguageAction = createSetContactLanguageAction();
const setContactChannelAction = createSetContactChannelAction();

const formHelper = new SetContactAttribFormHelper();

// starting w/ Types.set_contact_field props
const baseProps: SetContactAttribFormProps = {
    action: setContactFieldAction,
    formHelper,
    typeConfig: getTypeConfig(Types.set_contact_field),
    form: formHelper.initializeForm(
        {
            originalNode: null,
            originalAction: setContactFieldAction,
            languages
        },
        Types.set_contact_field
    ),
    languages,
    baseLanguage: English,
    updateAction: jest.fn(),
    updateSetContactAttribForm: jest.fn()
};

const { setup, spyOn } = composeComponentTestUtils(SetContactAttribForm, baseProps);

describe(SetContactAttribForm.name, () => {
    describe('render', () => {
        it('should render text input', () => {
            const { wrapper, props } = setup();

            expect(wrapper).toMatchSnapshot();
            expect(wrapper.find(ConnectedTextInputElement).prop('entry')).toEqual({
                value: props.form.value.value
            });

            const setContactNameForm = formHelper.initializeForm(
                { originalNode: null, originalAction: setContactNameAction, languages },
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
                $merge: {
                    action: setContactLanguageAction,
                    typeConfig: getTypeConfig(Types.set_contact_language),
                    form: formHelper.initializeForm(
                        {
                            originalNode: null,
                            originalAction: setContactLanguageAction,
                            languages
                        },
                        Types.set_contact_language
                    )
                }
            });

            expect(wrapper.find('LanguageDropDown').exists()).toBeTruthy();
            expect(wrapper).toMatchSnapshot();
        });

        it('should render channel dropdown', () => {
            const { wrapper } = setup(true, {
                $merge: {
                    action: setContactChannelAction,
                    typeConfig: getTypeConfig(Types.set_contact_channel),
                    form: formHelper.initializeForm(
                        {
                            originalNode: null,
                            originalAction: setContactChannelAction
                        },
                        Types.set_contact_channel
                    )
                }
            });

            expect(wrapper.find('ChannelDropDown').exists()).toBeTruthy();
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

        describe('handleDropDownChange', () => {
            it(`should update form: ${Types.set_contact_language}`, () => {
                const { wrapper, instance, props } = setup(true, {
                    $merge: {
                        action: setContactLanguageAction,
                        typeConfig: getTypeConfig(Types.set_contact_language),
                        form: formHelper.initializeForm(
                            {
                                originalNode: null,
                                originalAction: setContactLanguageAction,
                                languages
                            },
                            Types.set_contact_language
                        ),
                        updateSetContactAttribForm: jest.fn()
                    }
                });

                instance.handleDropDownChange([Spanish]);

                expect(props.updateSetContactAttribForm).toHaveBeenCalledTimes(1);
            });

            it(`should update form: ${Types.set_contact_channel}`, () => {
                const { wrapper, instance, props } = setup(true, {
                    $merge: {
                        action: setContactChannelAction,
                        typeConfig: getTypeConfig(Types.set_contact_channel),
                        form: formHelper.initializeForm(
                            {
                                originalNode: null,
                                originalAction: setContactChannelAction
                            },
                            Types.set_contact_channel
                        ),
                        updateSetContactAttribForm: jest.fn()
                    }
                });

                instance.handleDropDownChange([Spanish]);

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
