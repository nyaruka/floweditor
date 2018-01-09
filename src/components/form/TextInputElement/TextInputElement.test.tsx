import * as React from 'react';
import { shallow } from 'enzyme';
import { getSpecWrapper } from '../../../helpers/utils';
import ComponentMap, { CompletionOption } from '../../../services/ComponentMap';
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
    getCharCount,
    getOptionsList,
    getCharCountStats
} from './TextInputElement';
import { OPTIONS } from './completionOptions';

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

const optionQueryMap = OPTIONS.reduce((argMap, { name }) => {
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
                expect(filterOptions(OPTIONS)).toEqual([]));

            Object.keys(optionQueryMap).forEach(query =>
                it(`should filter options for "${query}"`, () =>
                    expect(filterOptions(OPTIONS, query)).toMatchSnapshot())
            );
        });

        describe('getOptionsList >', () => {
            const hasResults = (optionsList: CompletionOption[]): boolean => {
                let results = false;
                for (const option of optionsList) {
                    if (
                        option.description.indexOf('Result for') > -1 ||
                        option.description.indexOf('Category for') > -1
                    ) {
                        results = true;
                        break;
                    }
                }
                return results;
            };

            it('should return options list + result names if passed a truthy autocomplete arg', () =>
                expect(hasResults(getOptionsList(true, CompMap))).toBeTruthy());

            it('should only return an options list if passed a falsy autocomplete arg', () =>
                expect(hasResults(getOptionsList(false, CompMap))).toBeFalsy());
        });

        describe('getCharCountStats >', () => {
            it('should return an object containing character count stats if passed Count.SMS enum', () =>
                expect(getCharCountStats(Count.SMS, msgs[0][0])).toMatchSnapshot());

            it('should return an empty object if not passed Count.SMS enum', () =>
                expect(getCharCountStats(undefined, msgs[0][0])).toEqual({}));
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
