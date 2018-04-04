import { FlowEditorConfig } from '../flowTypes';
import { createSetup, getSpecWrapper } from '../testUtils';
import { getLanguage } from '../utils';
import {
    containerClass,
    LanguageSelector,
    languageSelectorContainerSpecId,
    LanguageSelectorStoreProps,
    mapOptions
} from './LanguageSelector';

const config = require('../../assets/config') as FlowEditorConfig;

const context = {
    languages: config.languages
};

const baseProps = {
    language: getLanguage(config.languages, 'eng'),
    updateLanguage: jest.fn(),
    updateTranslating: jest.fn()
};

const setup = createSetup<LanguageSelectorStoreProps>(LanguageSelector, baseProps, context);

const COMPONENT_TO_TEST = LanguageSelector.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('helpers', () => {
        describe('mapOptions', () => {
            it('should return a list of Language maps', () => {
                mapOptions(config.languages).forEach((languageMap, idx) => {
                    const keys = Object.keys(config.languages);

                    expect(languageMap.name).toBe(config.languages[keys[idx]]);
                    expect(languageMap.iso).toBe(keys[idx]);
                    expect(languageMap).toMatchSnapshot();
                });
            });
        });
    });

    describe('render', () => {
        it('should render select control', () => {
            const { wrapper, instance, props: { language }, context: { languages } } = setup(
                {},
                true
            );

            expect(
                getSpecWrapper(wrapper, languageSelectorContainerSpecId).hasClass(containerClass)
            ).toBeTruthy();
            expect(wrapper.find('Select').props()).toEqual(
                expect.objectContaining({
                    value: language.iso,
                    onChange: instance.onChange,
                    valueKey: 'iso',
                    labelKey: 'name',
                    searchable: false,
                    clearable: false,
                    options: mapOptions(languages)
                })
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should not render if language prop is falsy', () => {
            const { wrapper } = setup({ language: null }, true);

            expect(getSpecWrapper(wrapper, languageSelectorContainerSpecId).exists()).toBeFalsy();
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        describe('onChange', () => {
            it('should call action creators that update language, translating state', () => {
                const {
                    wrapper,
                    instance,
                    props: {
                        updateTranslating: updateTranslatingMock,
                        updateLanguage: updateLanguageMock
                    }
                } = setup(
                    {
                        updateLanguage: jest.fn(),
                        updateTranslating: jest.fn()
                    },
                    true
                );
                const spanish = getLanguage(config.languages, 'spa');
                const english = getLanguage(config.languages, 'eng');

                instance.onChange(spanish);

                expect(updateLanguageMock).toHaveBeenCalledTimes(1);
                expect(updateLanguageMock).toHaveBeenCalledWith(spanish);
                expect(updateTranslatingMock).toHaveBeenCalledTimes(1);
                expect(updateTranslatingMock).toHaveBeenCalledWith(true);

                instance.onChange(english);

                expect(updateLanguageMock).toHaveBeenCalledTimes(2);
                expect(updateLanguageMock).toHaveBeenCalledWith(english);
                expect(updateTranslatingMock).toHaveBeenCalledTimes(2);
                expect(updateTranslatingMock).toHaveBeenCalledWith(false);
            });
        });
    });
});
