import { SetContactField, SetContactProperty } from '../../../flowTypes';
import {
    composeComponentTestUtils,
    genSetContactFieldAction,
    genSetContactPropertyAction,
    setMock
} from '../../../testUtils';
import { set } from '../../../utils';
import ConnectedAttribElement from '../../form/AttribElement';
import ConnectedTextInputElement from '../../form/TextInputElement';
import {
    fieldToSearchResult,
    newFieldAction,
    newPropertyAction,
    propertyToSearchResult
} from './helpers';
import SetContactAttribForm, {
    ATTRIB_HELP_TEXT,
    SetContactAttribFormProps,
    TEXT_INPUT_HELP_TEXT
} from './SetContactAttribForm';

const setContactProperty = genSetContactPropertyAction();
const setContactField = genSetContactFieldAction();

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
            const initial = propertyToSearchResult(props.action as SetContactProperty);

            expect(props.onBindWidget).toHaveBeenCalledTimes(2);
            expect(props.onBindWidget).toHaveBeenCalledWith(expect.any(ConnectedAttribElement));
            expect(props.onBindWidget).toHaveBeenCalledWith(expect.any(ConnectedTextInputElement));
            expect(wrapper.find(ConnectedAttribElement).props()).toEqual({
                name: 'Attribute',
                showLabel: true,
                endpoint: endpoints.fields,
                helpText: ATTRIB_HELP_TEXT,
                initial,
                add: true,
                required: true
            });
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
                const expectedInitial = fieldToSearchResult(action as SetContactField);

                expect(instance.getInitial()).toEqual(expectedInitial);
            });

            it('should return contact property SearchResult', () => {
                const { wrapper, props: { action }, instance } = setup();
                const expectedInitial = propertyToSearchResult(action as SetContactProperty);

                expect(instance.getInitial()).toEqual(expectedInitial);
            });
        });

        describe('onValid', () => {
            it('should call updateAction prop with new SetContactField action', () => {
                const {
                    wrapper,
                    instance,
                    props: { action, updateAction: updateActionMock }
                } = setup(true, { updateAction: setMock(), action: set(setContactField) });
                const attribute = fieldToSearchResult(action as SetContactField);
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
                const attribute = propertyToSearchResult(action as SetContactProperty);
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
