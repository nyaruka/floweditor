import * as React from 'react';
import { shallow, mount, ShallowWrapper, ReactWrapper } from 'enzyme';
import { getSpecWrapper } from '../../../helpers/utils';
import ComponentMap from '../../../services/ComponentMap';
import { Count } from '../../form/TextInputElement';
import ReplyForm, { ReplyFormProps } from './ReplyForm';
import configContext from '../../../providers/ConfigProvider/configContext';

const {
    results: [{ definition }]
} = require('../../../../test_flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');

const CompMap = new ComponentMap(definition);
const { nodes: [{ actions: [action] }] } = definition;
const { endpoints, getTypeConfig } = configContext;
const config = getTypeConfig('reply');
const props: Partial<ReplyFormProps> = {
    action,
    config,
    translating: false,
    updateAction: jest.fn(),
    onBindWidget: jest.fn(),
    onBindAdvancedWidget: jest.fn(),
    getActionUUID: jest.fn(() => action.uuid),
    getLocalizedObject: jest.fn(),
    updateLocalizations: jest.fn(),
    ComponentMap: CompMap
};

const localizedText: string = '¿Hola, como te llamas?';

const createReplyForm = (
    newProps: any,
    mountIt: boolean = false
): ShallowWrapper | ReactWrapper => {
    const Component = (
        <ReplyForm
            {...{
                ...props,
                ...newProps
            }}
        />
    );
    return mountIt ? mount(Component) : shallow(Component);
};

describe('Component: ReplyForm', () => {
    it('Renders base form', () => {
        const ReplyFormBase = createReplyForm({ showAdvanced: false }, true);

        expect(ReplyFormBase.find('div').exists()).toBeTruthy();
        expect(props.onBindWidget).toBeCalled();
        expect(ReplyFormBase.find('TextInputElement').props()).toEqual({
            name: 'Message',
            count: Count.SMS,
            showLabel: false,
            value: props.action.text,
            placeholder: '',
            autocomplete: true,
            focus: true,
            required: true,
            textarea: true,
            ComponentMap: props.ComponentMap
        });
    });

    it('Renders advanced form', () => {
        const ReplyFormBase = createReplyForm({ showAdvanced: true }, true);

        expect(props.onBindAdvancedWidget).toBeCalled();
        expect(ReplyFormBase.find('CheckboxElement').props()).toEqual({
            name: 'All Destinations',
            defaultValue: action.all_urns && action.all_urns,
            description: 'Send a message to all destinations known for this contact.'
        });
    });

    describe('Localization', () => {
        it('Renders translation container, text to be translated', () => {
            const ReplyFormBase = createReplyForm({
                translating: true,
                showAdvanced: false,
                getLocalizedObject: jest.fn(() => ({
                    getLanguage: () => ({ name: 'Spanish' }),
                    getObject: () => ({
                        text: localizedText
                    }),
                    isLocalized: () => true
                }))
            });

            expect(getSpecWrapper(ReplyFormBase, 'translation-container').exists()).toBeTruthy();
            expect(getSpecWrapper(ReplyFormBase, 'text-to-translate').text()).toBe(
                props.action.text
            );
        });

        it('Renders localization form with localized input when action is localized', () => {
            const ReplyFormBase = createReplyForm({
                translating: true,
                showAdvanced: false,
                getLocalizedObject: jest.fn(() => ({
                    getLanguage: () => ({ name: 'Spanish' }),
                    getObject: () => ({
                        text: localizedText
                    }),
                    isLocalized: () => true
                }))
            });

            expect(ReplyFormBase.find('TextInputElement').props()).toEqual({
                name: 'Message',
                count: Count.SMS,
                showLabel: false,
                value: localizedText,
                placeholder: 'Spanish Translation',
                autocomplete: true,
                focus: true,
                required: false,
                textarea: true,
                ComponentMap: props.ComponentMap
            });
        });

        it('Renders localization form without localized input when action is not localized', () => {
            const ReplyFormBase = createReplyForm({
                translating: true,
                showAdvanced: false,
                getLocalizedObject: jest.fn(() => ({
                    getLanguage: () => ({ name: 'Spanish' }),
                    getObject: () => ({
                        text: props.action.text
                    }),
                    isLocalized: () => false
                }))
            });

            expect(ReplyFormBase.find('TextInputElement').props()).toEqual({
                name: 'Message',
                count: Count.SMS,
                showLabel: false,
                value: '',
                placeholder: 'Spanish Translation',
                autocomplete: true,
                focus: true,
                required: false,
                textarea: true,
                ComponentMap: props.ComponentMap
            });
        });
    });
});
