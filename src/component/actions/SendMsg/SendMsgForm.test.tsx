import * as React from 'react';
import { shallow, mount, ShallowWrapper, ReactWrapper } from 'enzyme';
import { getSpecWrapper } from '../../../utils';
import ComponentMap from '../../../services/ComponentMap';
import { Count } from '../../form/TextInputElement';
import SendMsgForm, { SendMsgFormProps } from './SendMsgForm';
import { getTypeConfig } from '../../../config';
import { getBaseLanguage } from '../../';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { languages, endpoints } = require('../../../../assets/config');

const CompMap = new ComponentMap(definition);
const { nodes: [{ actions: [action] }] } = definition;
const baseLanguage = getBaseLanguage(languages);
const config = getTypeConfig('send_msg');
const props: Partial<SendMsgFormProps> = {
    action,
    config,
    language: baseLanguage,
    translating: false,
    updateAction: jest.fn(),
    onBindWidget: jest.fn(),
    onBindAdvancedWidget: jest.fn(),
    getLocalizedObject: jest.fn(),
    updateLocalizations: jest.fn(),
    ComponentMap: CompMap
};

const localizedText: string = '¿Hola, como te llamas?';

const createReplyForm = (
    newProps: any,
    mountIt: boolean = false
): ShallowWrapper<{}, {}> | ReactWrapper<{}, {}> => {
    const Component = (
        <SendMsgForm
            {...{
                ...props,
                ...newProps
            }}
        />
    );
    return mountIt ? mount(Component) : shallow(Component);
};

describe('SendMsgForm', () => {
    describe('render >', () => {
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
                ComponentMap: props.ComponentMap,
                config
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
            const ReplyFormBaseLocalized = createReplyForm({
                translating: true,
                language: { name: 'Spanish', iso: 'spa' },
                showAdvanced: false,
                getLocalizedObject: jest.fn(() => ({
                    getLanguage: () => ({ name: 'Spanish' }),
                    getObject: () => ({
                        text: localizedText
                    }),
                    isLocalized: () => true
                }))
            });

            it('Renders translation container, text to be translated', () => {
                expect(
                    getSpecWrapper(ReplyFormBaseLocalized, 'translation-container').exists()
                ).toBeTruthy();

                expect(getSpecWrapper(ReplyFormBaseLocalized, 'text-to-translate').text()).toBe(
                    props.action.text
                );
            });

            it('Renders localization form with localized input when action is localized', () => {
                expect(ReplyFormBaseLocalized.find('TextInputElement').props()).toEqual({
                    name: 'Message',
                    count: Count.SMS,
                    showLabel: false,
                    value: localizedText,
                    placeholder: 'Spanish Translation',
                    autocomplete: true,
                    focus: true,
                    required: false,
                    textarea: true,
                    ComponentMap: props.ComponentMap,
                    config
                });
            });

            it('Renders localization form without localized input when action is not localized', () => {
                const ReplyFormBase = createReplyForm({
                    translating: true,
                    language: { name: 'Spanish', iso: 'spa' },
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
                    ComponentMap: props.ComponentMap,
                    config
                });
            });
        });
    });
});
