import { ResultType } from '../flowTypes';
import { handleLanguageChange } from '../store/thunks';
import { composeComponentTestUtils, getSpecWrapper, setMock } from '../testUtils';
import { English, languages, Spanish } from '../testUtils/assetCreators';
import {
    containerClasses,
    LanguageSelector,
    languageSelectorContainerSpecId,
    LanguageSelectorStoreProps
} from './LanguageSelector';

const baseProps: LanguageSelectorStoreProps = {
    language: English,
    languages,
    handleLanguageChange: jest.fn()
};

const { setup } = composeComponentTestUtils(LanguageSelector, baseProps);

describe(LanguageSelector.name, () => {
    describe('render', () => {
        it('should render select control', () => {
            const { wrapper, instance, props } = setup();

            expect(
                getSpecWrapper(wrapper, languageSelectorContainerSpecId).hasClass(containerClasses)
            ).toBeTruthy();
            expect(wrapper.find('SelectSearch').props()).toEqual(
                expect.objectContaining({
                    resultType: ResultType.language,
                    initial: [props.language],
                    localSearchOptions: props.languages,
                    onChange: instance.handleLanguageChange,
                    searchable: false,
                    multi: false,
                    name: 'Languages',
                    closeOnSelect: true
                })
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        describe('onChange', () => {
            it('should call action creators that update language, translating state', () => {
                const { wrapper, instance, props } = setup(true, {
                    handleLanguageChange: setMock()
                });

                instance.handleLanguageChange([Spanish]);

                expect(props.handleLanguageChange).toHaveBeenCalledTimes(1);
                expect(props.handleLanguageChange).toHaveBeenCalledWith(Spanish);

                instance.handleLanguageChange([English]);

                expect(props.handleLanguageChange).toHaveBeenCalledTimes(2);
                expect(props.handleLanguageChange).toHaveBeenCalledWith(English);
            });
        });
    });
});
