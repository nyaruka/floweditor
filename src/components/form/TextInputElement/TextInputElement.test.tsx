import * as React from 'react';
import { shallow } from 'enzyme';
import { getSpecWrapper } from '../../../helpers/utils';
import ComponentMap from '../../../services/ComponentMap';
import TextInputElement, {
    Count,
    CharacterSet,
    MAX_GSM_SINGLE,
    MAX_GSM_MULTI,
    MAX_UNICODE_SINGLE,
    MAX_UNICODE_MULTI
} from './TextInputElement';

const {
    results: [{ definition }]
} = require('../../../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const CompMap = new ComponentMap(definition);
const props = {
    name: 'Message',
    count: Count.SMS,
    showLabel: false,
    placeholder: '',
    autocomplete: true,
    required: true,
    textarea: true,
    ComponentMap: CompMap
};

describe('Component: TextInputElement', () => {
    it('should recognize GSM 7-bit characters and maintain count accordingly', () => {
        let TextInputGSM = shallow(
            <TextInputElement
                {...{
                    ...props,
                    value:
                        "What's your favorite color, (r)ed, (o)range, (y)ellow, (g)reen, (b)lue, (i)ndigo or (v)iolet?"
                }}
            />
        );

        expect(TextInputGSM.state('maxLength')).toBe(MAX_GSM_SINGLE);
        expect(TextInputGSM.state('parts').length).toBe(1);
        expect(TextInputGSM.state('characterSet')).toBe(CharacterSet.GSM);
        expect(TextInputGSM.state('remainingInPart')).toBe(67);
        expect(TextInputGSM.state('characterCount')).toBe(93);
        expect(
            getSpecWrapper(TextInputGSM, 'counter')
                .text()
                .indexOf('67/1 ?')
        ).toBe(0);

        TextInputGSM = shallow(
            <TextInputElement
                {...{
                    ...props,
                    value:
                        "What's your favorite color, (r)ed, (o)range, (y)ellow, (g)reen, (b)lue, (i)ndigo or (v)iolet? { Fun fact: Approximately seven million different colors can be seen by the human eye. }"
                }}
            />
        );

        expect(TextInputGSM.state('maxLength')).toBe(MAX_GSM_MULTI);
        expect(TextInputGSM.state('parts').length).toBe(2);
        expect(TextInputGSM.state('characterSet')).toBe(CharacterSet.GSM);
        expect(TextInputGSM.state('characterCount')).toBe(182);
        expect(TextInputGSM.state('remainingInPart')).toBe(122);
        expect(
            getSpecWrapper(TextInputGSM, 'counter')
                .text()
                .indexOf('122/2 ?')
        ).toBe(0);
    });

    it('should recognize unicode characters and maintain count accordingly', () => {
        let TextInputUni = shallow(
            <TextInputElement
                {...{
                    ...props,
                    value: "👋 Hi, what's your name?"
                }}
            />
        );

        expect(TextInputUni.state('maxLength')).toBe(MAX_UNICODE_SINGLE);
        expect(TextInputUni.state('parts').length).toBe(1);
        expect(TextInputUni.state('characterSet')).toBe(CharacterSet.UNICODE);
        expect(TextInputUni.state('characterCount')).toBe(23);
        expect(TextInputUni.state('remainingInPart')).toBe(46);
        expect(
            getSpecWrapper(TextInputUni, 'counter')
                .text()
                .indexOf('46/1 ?')
        ).toBe(0);

        TextInputUni = shallow(
            <TextInputElement
                {...{
                    ...props,
                    value:
                        "👋 Hi, what's your name? We're doing a survey in your local community and would appreciate your help!"
                }}
            />
        );

        expect(TextInputUni.state('maxLength')).toBe(MAX_UNICODE_MULTI);
        expect(TextInputUni.state('parts').length).toBe(2);
        expect(TextInputUni.state('characterSet')).toBe(CharacterSet.UNICODE);
        expect(TextInputUni.state('remainingInPart')).toBe(33);
        expect(TextInputUni.state('characterCount')).toBe(100);
        expect(
            getSpecWrapper(TextInputUni, 'counter')
                .text()
                .indexOf('33/2 ?')
        ).toBe(0);
    });
});
