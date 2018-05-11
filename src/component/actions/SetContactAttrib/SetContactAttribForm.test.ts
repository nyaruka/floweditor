import { getTypeConfig } from '../../../config';
import { Types } from '../../../config/typeConfigs';
import { composeComponentTestUtils, setMock } from '../../../testUtils';
import {
    createSetContactFieldAction,
    createSetContactNameAction
} from '../../../testUtils/assetCreators';
import ConnectedTextInputElement from '../../form/TextInputElement';
import { propertyToAsset } from './helpers';
import { SetContactAttribForm, SetContactAttribFormProps } from './SetContactAttribForm';
import { SetContactAttribFormHelper } from './SetContactAttribFormHelper';

const setContactNameAction = createSetContactNameAction();
const setContactFieldAction = createSetContactFieldAction();

const formHelper = new SetContactAttribFormHelper();

// starting w/ Types.set_contact_field props
const baseProps: SetContactAttribFormProps = {
    action: setContactFieldAction,
    formHelper,
    typeConfig: getTypeConfig(Types.set_contact_field),
    form: formHelper.actionToState(setContactFieldAction, Types.set_contact_field),
    onBindWidget: jest.fn(),
    updateAction: jest.fn(),
    updateSetContactAttribForm: jest.fn()
};

const { setup } = composeComponentTestUtils(SetContactAttribForm, baseProps);

describe(SetContactAttribForm.name, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper, props } = setup();

            expect(wrapper).toMatchSnapshot();
            expect(wrapper.find(ConnectedTextInputElement).prop('value')).toBe(props.form.value);

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

            expect(wrapper.find(ConnectedTextInputElement).prop('value')).toBe(
                setContactNameForm.value
            );
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
                    updateSetContactAttribForm: setMock()
                });
                const attribute = propertyToAsset(setContactNameAction);

                instance.handleAttribChange(attribute);

                expect(props.updateSetContactAttribForm).toHaveBeenCalledTimes(1);
            });
        });

        describe('handleValueChange', () => {
            it('should call form-state-updater-thunk', () => {
                const { wrapper, instance, props } = setup(true, {
                    updateSetContactAttribForm: setMock()
                });
                const mockEvent = {
                    currentTarget: {
                        value: 26
                    }
                };

                instance.handleValueChange(mockEvent);

                expect(props.updateSetContactAttribForm).toHaveBeenCalledTimes(1);
                expect(props.updateSetContactAttribForm).toHaveBeenCalledWith(
                    null,
                    mockEvent.currentTarget.value
                );
            });
        });
    });
});
