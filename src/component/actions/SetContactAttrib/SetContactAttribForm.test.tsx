import { object } from 'prop-types';
import * as React from 'react';
import { SetContactField, SetContactProperty } from '../../../flowTypes';
import { createStore } from '../../../store';
import { createSetup } from '../../../testUtils';
import ConnectedAttribElement from '../../form/AttribElement';
import ConnectedTextInputElement from '../../form/TextInputElement';
import { setContactField, setContactProperty } from './__test__';
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

const config = require('../../../../assets/config');

const store = createStore();

const context = {
    endpoints: config.endpoints,
    store
};

const childContextTypes = {
    store: object
};

const baseProps: SetContactAttribFormProps = {
    action: setContactProperty,
    onBindWidget: jest.fn(),
    updateAction: jest.fn()
};

const setup = createSetup<SetContactAttribFormProps>(
    SetContactAttribForm,
    baseProps,
    context,
    childContextTypes
);

const COMPONENT_TO_TEST = SetContactAttribForm.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const {
                wrapper,
                props: { onBindWidget: onBindWidgetMock, action },
                context: { endpoints }
            } = setup({
                onBindWidget: jest.fn()
            });
            const initial = propertyToSearchResult(action as SetContactProperty);

            expect(onBindWidgetMock).toHaveBeenCalledTimes(2);
            expect(onBindWidgetMock).toHaveBeenCalledWith(expect.any(ConnectedAttribElement));
            expect(onBindWidgetMock).toHaveBeenCalledWith(expect.any(ConnectedTextInputElement));
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
                value: action.value,
                helpText: TEXT_INPUT_HELP_TEXT,
                autocomplete: true
            });
        });
    });

    describe('instance methods', () => {
        describe('getInitial', () => {
            it('should return contact field SearchResult', () => {
                const { wrapper, props: { action }, instance } = setup(
                    { action: setContactField },
                    true
                );
                const expectedInitial = fieldToSearchResult(action as SetContactField);

                expect(instance.getInitial()).toEqual(expectedInitial);
            });

            it('should return contact property SearchResult', () => {
                const { wrapper, props: { action }, instance } = setup({}, true);
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
                } = setup({ updateAction: jest.fn(), action: setContactField }, true);
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
                } = setup({ updateAction: jest.fn() }, true);
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
