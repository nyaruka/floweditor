import { SetContactField, SetContactProperty } from '../../../flowTypes';
import { composeComponentTestUtils, setMock } from '../../../testUtils';
import {
    createSetContactFieldAction,
    createSetContactPropertyAction
} from '../../../testUtils/assetCreators';
import { set } from '../../../utils';
import ConnectedAttribElement from '../../form/AttribElement';
import ConnectedTextInputElement from '../../form/TextInputElement';
import { newFieldAction, newPropertyAction, propertyToAsset, fieldToAsset } from './helpers';
import SetContactAttribForm, {
    ATTRIB_HELP_TEXT,
    SetContactAttribFormProps,
    TEXT_INPUT_HELP_TEXT
} from './SetContactAttribForm';

const setContactProperty = createSetContactPropertyAction();
const setContactField = createSetContactFieldAction();

const baseProps: SetContactAttribFormProps = {
    action: setContactProperty,
    onBindWidget: jest.fn(),
    updateAction: jest.fn()
};

const { setup } = composeComponentTestUtils(SetContactAttribForm, baseProps);

describe(SetContactAttribForm.name, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper, props, context: { endpoints } } = setup(false, {
                onBindWidget: setMock()
            });
            const initial = propertyToAsset(props.action as SetContactProperty);

            expect(props.onBindWidget).toHaveBeenCalledTimes(2);
            expect(props.onBindWidget).toHaveBeenCalledWith(expect.any(ConnectedAttribElement));
            expect(props.onBindWidget).toHaveBeenCalledWith(expect.any(ConnectedTextInputElement));
            expect(wrapper.find(ConnectedAttribElement).props()).toMatchSnapshot();

            expect(wrapper.find(ConnectedTextInputElement).props()).toEqual({
                name: 'Value',
                showLabel: true,
                value: props.action.value,
                helpText: TEXT_INPUT_HELP_TEXT,
                autocomplete: true
            });
        });
    });

    describe('instance methods', () => {
        describe('getInitial', () => {
            it('should return contact field SearchResult', () => {
                const { wrapper, props: { action }, instance } = setup(true, {
                    action: set(setContactField)
                });
                const expectedInitial = fieldToAsset(action as SetContactField);

                expect(instance.getInitial()).toEqual(expectedInitial);
            });

            it('should return contact property SearchResult', () => {
                const { wrapper, props: { action }, instance } = setup();
                const expectedInitial = propertyToAsset(action as SetContactProperty);

                expect(instance.getInitial()).toEqual(expectedInitial);
            });
        });

        describe('onValid', () => {
            it('should call updateAction prop with new SetContactField action', () => {
                const {
                    wrapper,
                    instance,
                    props: { action, updateAction: updateActionMock }
                } = setup(true, {
                    addContactField: setMock(),
                    updateAction: setMock(),
                    action: set(setContactField)
                });
                const attribute = fieldToAsset(action as SetContactField);
                const { value } = action;
                const widgets = {
                    Attribute: { wrappedInstance: { state: { attribute } } },
                    Value: { wrappedInstance: { state: { value } } }
                };

                instance.onValid(widgets);

                expect(updateActionMock).toHaveBeenCalledTimes(1);
                expect(updateActionMock).toHaveBeenCalledWith(
                    newFieldAction(action.uuid, value, attribute.name)
                );
            });

            it('should call updateAction prop with new SetContactProperty action', () => {
                const {
                    wrapper,
                    instance,
                    props: { action, updateAction: updateActionMock }
                } = setup(true, { updateAction: setMock() });
                const attribute = propertyToAsset(action as SetContactProperty);
                const { value } = action;
                const widgets = {
                    Attribute: { wrappedInstance: { state: { attribute } } },
                    Value: { wrappedInstance: { state: { value } } }
                };

                instance.onValid(widgets);

                expect(updateActionMock).toHaveBeenCalledTimes(1);
                expect(updateActionMock).toHaveBeenCalledWith(
                    newPropertyAction(action.uuid, value, attribute.name)
                );
            });
        });
    });
});
