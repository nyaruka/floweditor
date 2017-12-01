import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow, mount } from 'enzyme';
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
const props = {
    action,
    config,
    endpoints,
    translating: false,
    updateAction: jest.fn(),
    onBindWidget: jest.fn(),
    onBindAdvancedWidget: jest.fn(),
    getActionUUID: jest.fn(() => action.uuid),
    getLocalizedObject: jest.fn(),
    updateLocalizations: jest.fn(),
    ComponentMap: CompMap
};

describe('Component: ReplyForm', () => {
    it('Renders base form', () => {
        const ReplyFormBase = mount(<ReplyForm {...{ ...props, showAdvanced: false }} />);

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
        const ReplyFormBase = mount(<ReplyForm {...{ ...props, showAdvanced: true }} />);

        expect(props.onBindAdvancedWidget).toBeCalled();
        expect(ReplyFormBase.find('CheckboxElement').props()).toEqual({
            name: 'All Destinations',
            defaultValue: action.all_urns && action.all_urns,
            description: 'Send a message to all destinations known for this contact.'
        });
    });

    describe('Localization', () => {
        it('Renders localization form with localized input when action is localized', () => {
            const localizedText = '¿Como te llamas?';
            const ReplyFormBase = shallow(
                <ReplyForm
                    {...{
                        ...props,
                        translating: true,
                        showAdvanced: false,
                        getLocalizedObject: () => ({
                            hasTranslation: () => true,
                            getLanguage: () => ({ name: 'Spanish' }),
                            localized: true,
                            getObject: () => ({
                                text: localizedText
                            })
                        })
                    }}
                />
            );

            expect(getSpecWrapper(ReplyFormBase, 'translation-container').exists()).toBeTruthy();
            expect(getSpecWrapper(ReplyFormBase, 'text-to-translate').text()).toBe(
                props.action.text
            );
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
            const ReplyFormBase = shallow(
                <ReplyForm
                    {...{
                        ...props,
                        translating: true,
                        showAdvanced: false,
                        getLocalizedObject: () => ({
                            hasTranslation: () => true,
                            getLanguage: () => ({ name: 'Spanish' }),
                            localized: false,
                            getObject: () => ({
                                text: 'Como to llanmas'
                            })
                        })
                    }}
                />
            );

            expect(getSpecWrapper(ReplyFormBase, 'translation-container').exists()).toBeTruthy();
            expect(getSpecWrapper(ReplyFormBase, 'text-to-translate').text()).toBe(
                props.action.text
            );
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
