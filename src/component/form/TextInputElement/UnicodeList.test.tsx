import * as React from 'react';
import { shallow } from 'enzyme';
import UnicodeList from './UnicodeList';
import { utfWarning } from './UnicodeList';

describe('UnicodeList >', () => {
    describe('helpers >', () => {
        describe('utfWarning >', () => {
            it('should pluralize "character" if passed a number other than 1', () => {
                expect(utfWarning(2).indexOf('characters') > -1).toBeTruthy();
            });

            it("shouldn't pluralize 'character' if passed the number 1", () => {
                expect(utfWarning(1).indexOf('character') > -1).toBeTruthy();
            });
        });
    });

    describe('render >', () => {
        it("shouldn't render markup if passed an empty UnicodeCharMap", () => {
            const unicodeChars = {};

            const wrapper = shallow(<UnicodeList unicodeChars={unicodeChars} />);

            expect(wrapper.find('div').exists()).toBeFalsy();
        });

        it('should render warning, list of chars if passed substantive UnicodeCharMap', () => {
            const unicodeChars = {
                '😎': true,
                '👍': true
            };

            const wrapper = shallow(<UnicodeList unicodeChars={unicodeChars} />);

            expect(
                wrapper.text().indexOf(utfWarning(Object.keys(unicodeChars).length)) > -1
            ).toBeTruthy();
        });
    });
});
