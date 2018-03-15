import * as React from 'react';
import { shallow } from 'enzyme';
import { getSpecWrapper } from '../../../utils';
import ComponentMap, { CompletionOption } from '../../../services/ComponentMap';
import TextInputElement, { Count } from './TextInputElement';
import { getTypeConfig } from '../../../config';
import { OPTIONS, COMPLETION_HELP } from './constants';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const CompMap = new ComponentMap(definition);

const props = {
    name: 'Message',
    count: Count.SMS,
    showLabel: false,
    placeholder: '',
    autocomplete: true,
    required: true,
    textarea: true,
    ComponentMap: CompMap,
    config: getTypeConfig('send_msg')
};

const msgs = [
    ['GSM, regular 7-bit chars', 'GSM: 7-bit'],
    ['GSM, escape chars: |^€{}[]~', 'GSM: escape'],
    ['Unicode 💩', 'Unicode'],
    ['Unicode 💩 w/ GSM escape chars |^€{}[]~', 'Unicode + GSM escape']
];

describe('TextInputElement >', () => {
    describe('render >', () => {
        it('should render FormElement', () => {
            const wrapper = shallow(
                <TextInputElement
                    {...{
                        ...props,
                        value: msgs[0][0]
                    }}
                />
            );

            expect(wrapper.find('FormElement').props()).toEqual(
                expect.objectContaining({
                    name: props.name,
                    showLabel: props.showLabel,
                    errors: [],
                    sendMsgError: false
                })
            );
        });

        it('should render input', () => {
            const wrapper = shallow(
                <TextInputElement
                    {...{
                        ...props,
                        value: msgs[0][0]
                    }}
                />
            );

            expect(getSpecWrapper(wrapper, 'input').props()).toEqual(
                expect.objectContaining({
                    className: 'textinput',
                    placeholder: '',
                    type: undefined,
                    value: msgs[0][0]
                })
            );
        });

        it('should render completion list', () => {
            const wrapper = shallow(
                <TextInputElement
                    {...{
                        ...props,
                        value: msgs[0][0]
                    }}
                />
            );

            expect(wrapper.find('ul').exists()).toBeTruthy();
            expect(getSpecWrapper(wrapper, 'completion-help').text()).toBe(COMPLETION_HELP);
        });

        it('should render CharCount', () => {
            const wrapper = shallow(
                <TextInputElement
                    {...{
                        ...props,
                        value: msgs[0][0]
                    }}
                />
            );

            expect(wrapper.find('CharCount').props()).toEqual({
                count: wrapper.state('characterCount'),
                parts: wrapper.state('parts').length,
                unicodeChars: wrapper.state('unicodeChars')
            });
        });
    });
});
