import { FlowEditorConfig } from '../flowTypes';
import {
    composeComponentTestUtils,
    configProviderContext,
    getSpecWrapper,
    setMock
} from '../testUtils';
import { getLanguage, setNull } from '../utils';
import {
    containerClass,
    LanguageSelector,
    languageSelectorContainerSpecId,
    LanguageSelectorStoreProps,
    mapOptions
} from './LanguageSelector';

const baseProps: LanguageSelectorStoreProps = {
    language: getLanguage(configProviderContext.languages, 'eng'),
    updateLanguage: jest.fn(),
    updateTranslating: jest.fn()
};

const { setup } = composeComponentTestUtils(LanguageSelector, baseProps);

describe(LanguageSelector.name, () => {
    describe('helpers', () => {
        describe('mapOptions', () => {
            it('should return a list of Language maps', () => {
                mapOptions(configProviderContext.languages).forEach((languageMap, idx) => {
                    const keys = Object.keys(configProviderContext.languages);

                    expect(languageMap.name).toBe(configProviderContext.languages[keys[idx]]);
                    expect(languageMap.iso).toBe(keys[idx]);
                    expect(languageMap).toMatchSnapshot();
                });
            });
        });
    });

    describe('render', () => {
        it('should render select control', () => {
            const { wrapper, instance, props, context } = setup();

            expect(
                getSpecWrapper(wrapper, languageSelectorContainerSpecId).hasClass(containerClass)
            ).toBeTruthy();
            expect(wrapper.find('Select').props()).toEqual(
                expect.objectContaining({
                    value: props.language.iso,
                    onChange: instance.onChange,
                    valueKey: 'iso',
                    labelKey: 'name',
                    searchable: false,
                    clearable: false,
                    options: mapOptions(context.languages)
                })
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should not render if language prop is falsy', () => {
            const { wrapper } = setup(true, { language: setNull() });

            expect(getSpecWrapper(wrapper, languageSelectorContainerSpecId).exists()).toBeFalsy();
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        describe('onChange', () => {
            it('should call action creators that update language, translating state', () => {
                const { wrapper, instance, props } = setup(true, {
                    updateLanguage: setMock(),
                    updateTranslating: setMock()
                });
                const spanish = getLanguage(configProviderContext.languages, 'spa');
                const english = getLanguage(configProviderContext.languages, 'eng');

                instance.onChange(spanish);

                expect(props.updateLanguage).toHaveBeenCalledTimes(1);
                expect(props.updateLanguage).toHaveBeenCalledWith(spanish);
                expect(props.updateTranslating).toHaveBeenCalledTimes(1);
                expect(props.updateTranslating).toHaveBeenCalledWith(true);

                instance.onChange(english);

                expect(props.updateLanguage).toHaveBeenCalledTimes(2);
                expect(props.updateLanguage).toHaveBeenCalledWith(english);
                expect(props.updateTranslating).toHaveBeenCalledTimes(2);
                expect(props.updateTranslating).toHaveBeenCalledWith(false);
            });
        });
    });
});
