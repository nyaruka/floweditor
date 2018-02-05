import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { getSpecWrapper } from '../../../utils';
import ComponentMap from '../../../services/ComponentMap';
import { Count } from '../../form/TextInputElement';
import ReplyForm, { ReplyFormProps } from './ReplyForm';
import { getTypeConfig } from '../../../config';
import { getBaseLanguage } from '../../FlowEditor';

const config = require('../../../../../assets/config.json');
const {
    results: [{ definition }]
} = require('../../../../test_flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');

const CompMap = new ComponentMap(definition);
const { nodes: [{ actions: [action] }] } = definition;
const { endpoints } = config;
const replyConfig = getTypeConfig('reply');
const baseLanguage = getBaseLanguage(config.languages);
const props: Partial<ReplyFormProps> = {
    action,
    config: replyConfig,
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

const createReplyForm = (newProps: any, mountIt: boolean = false) => {
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

describe('ReplyForm >', () => {
    describe('render >', () => {
        it('should render base form', () => {
            const wrapper = createReplyForm(
                { showAdvanced: false },
                true
            );

            expect(props.onBindWidget).toBeCalled();

            expect(wrapper.find('TextInputElement').props()).toEqual({
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

        it('should render advanced form', () => {
            const wrapper = createReplyForm({ showAdvanced: true }, true);

            expect(props.onBindAdvancedWidget).toBeCalled();

            expect(wrapper.find('CheckboxElement').props()).toEqual({
                name: 'All Destinations',
                defaultValue: action.all_urns && action.all_urns,
                description:
                    'Send a message to all destinations known for this contact.'
            });
        });

        describe('localization', () => {
            it('should render translation container, text to be translated', () => {
                const wrapper = createReplyForm({
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

                expect(
                    getSpecWrapper(
                        wrapper,
                        'translation-container'
                    ).exists()
                ).toBeTruthy();

                expect(
                    getSpecWrapper(
                        wrapper,
                        'text-to-translate'
                    ).text()
                ).toBe(props.action.text);
            });

            it('should render localization form with localized input when action is localized', () => {
                const wrapper = createReplyForm({
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

                expect(
                    wrapper.find('TextInputElement').props()
                ).toEqual({
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

            it('should render localization form without localized input when action is not localized', () => {
                const wrapper = createReplyForm({
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

                expect(wrapper.find('TextInputElement').props()).toEqual({
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
