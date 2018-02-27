import * as React from 'react';
import { shallow } from 'enzyme';
import { getSpecWrapper } from '../../../utils';
import CharCount from './CharCount';

describe('CharCount >', () => {
    describe('render >', () => {
        it('should display count', () => {
            const count = 67;
            const parts = 2;
            const unicodeChars = {};
            const wrapper = shallow(
                <CharCount count={count} parts={parts} unicodeChars={unicodeChars} />
            );

            expect(wrapper).toMatchSnapshot();
        });

        it("should render UnicodeLIst if 'unicodeChars' prop is substantive", () => {
            const count = 67;
            const parts = 2;
            const unicodeChars = {
                '💩': true,
                '🚨': true
            };
            const wrapper = shallow(
                <CharCount count={count} parts={parts} unicodeChars={unicodeChars} />
            );

            expect(wrapper.find('UnicodeList').props()).toEqual({
                unicodeChars
            });
        });

        it("shouldn't render UnicodeList if 'unicodeChars' prop isn't substantive", () => {
            const count = 67;
            const parts = 2;
            const unicodeChars = {};
            const wrapper = shallow(
                <CharCount count={count} parts={parts} unicodeChars={unicodeChars} />
            );

            expect(wrapper.find('UnicodeList').exists()).toBeFalsy();
        });
    });
});
