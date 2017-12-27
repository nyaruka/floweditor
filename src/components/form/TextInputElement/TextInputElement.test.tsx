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
    MAX_UNICODE_MULTI,
    toCharSetEnum,
    cleanMsg,
    filterOptions,
    renderOption,
    getCharCount,
    getOptions,
    getCharCountEle
} from './TextInputElement';
import { OPTION_LIST } from './completionOptions';

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

const msgs = [
    ['GSM, regular 7-bit chars', 'GSM: 7-bit'],
    ['GSM, escape chars: |^€{}[]~', 'GSM: escape'],
    ['Unicode 💩', 'Unicode'],
    ['Unicode 💩 w/ GSM escape chars |^€{}[]~', 'Unicode + GSM escape']
];

const optionQueryMap = OPTION_LIST.reduce((argMap, { name }) => {
    const lastIndex = name.lastIndexOf('.');

    if (lastIndex > -1) {
        argMap[name.slice(0, lastIndex + 2)] = true;
        argMap[name.slice(0, lastIndex + 3)] = true;
        argMap[name] = true;
    } else {
        argMap[name.slice(0, 1)] = true;
        argMap[name.slice(0, 2)] = true;
        argMap[name] = true;
        argMap[`${name}.`] = true;
    }

    return argMap;
}, {});

describe('TextInputElement >', () => {
    describe('helpers >', () => {
        describe('toCharSetEnum()', () =>
            it('should return the CharacterSet enum value that matches its argument', () => {
                expect(toCharSetEnum('GSM')).toBe(CharacterSet.GSM);
                expect(toCharSetEnum('Unicode')).toBe(CharacterSet.UNICODE);
            }));

        describe('cleanMsg >', () => {
            it('should replace specified unicode characters with their GSM counterparts', () =>
                expect(cleanMsg('“”‘’— …–')).toBe(`""''- ...-`));
        });

        describe('getCharCount >', () =>
            msgs.forEach(msg =>
                it(`should generate character count stats for msg of type "${msg[1]}"`, () =>
                    expect(getCharCount(msg[0])).toMatchSnapshot())
            ));

        describe('filterOptions >', () => {
            it('should return an empty array if not passed a query', () =>
                expect(filterOptions(OPTION_LIST)).toEqual([]));

            Object.keys(optionQueryMap).forEach(query =>
                it(`should filter options for "${query}"`, () =>
                    expect(filterOptions(OPTION_LIST, query)).toMatchSnapshot())
            );
        });

        describe('renderOption >', () => {
            it('should render option w/ selected style if passed "selected" arg', () =>
                expect(shallow(renderOption(OPTION_LIST[0], true))).toMatchSnapshot());

            it('should render option w/o selected style if not passed "selected" arg', () =>
                expect(shallow(renderOption(OPTION_LIST[0], false))).toMatchSnapshot());
        });

        describe('getOptions >', () => {
            const { selectedElRef } = shallow(
                <TextInputElement
                    {...{
                        ...props,
                        value: ''
                    }}
                />
            ).instance() as any;
            const query = 'contact';
            const matches = filterOptions(OPTION_LIST, query);

            it(`should render a list of completion options for query "${query}"`, () =>
                expect(getOptions(matches, 0, selectedElRef)).toMatchSnapshot());
        });

        describe('getCharCountEle >', () => {
            const charCountStats = getCharCount(msgs[0][0]);

            it('should return a charCount element when passed a truthy "count" arg', () =>
                expect(getCharCountEle(charCountStats, true)).toMatchSnapshot());
        });
    });

    describe('render >', () => {
        it('should display count', () => {
            const TextInput = shallow(
                <TextInputElement
                    {...{
                        ...props,
                        value: msgs[0][0]
                    }}
                />
            );

            const { onBlur, onChange, onKeyDown } = TextInput.instance() as any;

            expect(getSpecWrapper(TextInput, 'input').props()).toEqual(
                expect.objectContaining({
                    className: 'textinput false',
                    placeholder: '',
                    type: undefined,
                    value: msgs[0][0],
                    onBlur,
                    onChange,
                    onKeyDown
                })
            );
        });
    });
});
