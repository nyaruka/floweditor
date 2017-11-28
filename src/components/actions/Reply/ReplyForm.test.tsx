import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow, mount } from 'enzyme';
import { getSpecWrapper } from '../../../helpers/utils';
import EditorConfig from '../../../services/EditorConfig';
import ComponentMap from '../../../services/ComponentMap';
import { Count } from '../../form/TextInputElement';
import ReplyForm, { ReplyFormProps } from './ReplyForm';

jest.mock('Config');

const {
    results: [{ definition }]
} = require('../../../../test_flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');

const Config = new EditorConfig();
const CompMap = new ComponentMap(definition);
const { nodes: [{ actions: [action] }] } = definition;
const { endpoints } = Config;
const typeConfig = Config.getTypeConfig('reply');
const props = {
    action,
    config: typeConfig,
    endpoints,
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

    it('Renders localization form', () => {
        const ReplyFormBase = shallow(
            <ReplyForm
                {...{
                    ...props,
                    showAdvanced: false,
                    getLocalizedObject: () => ({
                        hasTranslation: () => true,
                        getLanguage: () => ({ name: 'Spanish' }),
                        getObject: () => ({
                            text: 'Como te llamas?'
                        })
                    })
                }}
            />
        );

        expect(getSpecWrapper(ReplyFormBase, 'translation-container').exists()).toBeTruthy();
        expect(getSpecWrapper(ReplyFormBase, 'text-to-translate').text()).toBe(props.action.text);
        expect(ReplyFormBase.find('TextInputElement').props()).toEqual({
            name: 'Message',
            count: Count.SMS,
            showLabel: false,
            value: 'Como te llamas?',
            placeholder: 'Spanish Translation',
            autocomplete: true,
            focus: true,
            required: false,
            textarea: true,
            ComponentMap: props.ComponentMap
        });
    });
});
