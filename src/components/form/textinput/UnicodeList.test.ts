import { composeComponentTestUtils, getSpecWrapper } from '~/testUtils';
import UnicodeList, {
    unicodeListContainerSpecId,
    UnicodeListProps,
    unicodeListSpecId,
    utfWarning
} from './UnicodeList';

const baseProps: UnicodeListProps = {
    unicodeChars: {
        '😎': true,
        '👍': true
    }
};

const { setup } = composeComponentTestUtils<UnicodeListProps>(UnicodeList, baseProps);

describe('UnicodeList', () => {
    describe('helpers', () => {
        describe('utfWarning', () => {
            it('should pluralize "character" if passed a number other than 1', () => {
                expect(utfWarning(2).indexOf('characters') > -1).toBeTruthy();
            });

            it("shouldn't pluralize 'character' if passed the number 1", () => {
                expect(utfWarning(1).indexOf('character') > -1).toBeTruthy();
            });
        });
    });

    describe('render', () => {
        it('should render self, children with base props', () => {
            const {
                wrapper,
                props: { unicodeChars }
            } = setup();
            const unicodeList = getSpecWrapper(wrapper, unicodeListSpecId);

            expect(
                getSpecWrapper(wrapper, unicodeListContainerSpecId)
                    .text()
                    .indexOf(utfWarning(Object.keys(unicodeChars).length))
            ).toBeGreaterThan(-1);
            expect(unicodeList.hasClass('unicodeList')).toBeTruthy();
            expect(unicodeList.childAt(0).key()).toBe(Object.keys(unicodeChars)[0]);
            expect(unicodeList.childAt(0).hasClass('unicodeChar')).toBeTruthy();
            expect(unicodeList.childAt(0).text()).toBe(Object.keys(unicodeChars)[0]);
            expect(unicodeList.childAt(1).key()).toBe(Object.keys(unicodeChars)[1]);
            expect(unicodeList.childAt(1).hasClass('unicodeChar')).toBeTruthy();
            expect(unicodeList.childAt(1).text()).toBe(Object.keys(unicodeChars)[1]);
            expect(wrapper).toMatchSnapshot();
        });
    });
});
