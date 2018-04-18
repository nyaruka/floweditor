import Localization from './Localization';
import { configProviderContext } from '../testUtils/index';

const {
    nodes: [{ actions: [replyAction] }],
    localization
} = require('../../__test__/flows/customer_service.json');

const translations = localization.spa;

describe('Localization', () => {
    describe('instance methods', () =>
        describe('translate', () => {
            it('should return an untranslated LocalizedObject if not passed translations', () => {
                expect(
                    Localization.translate(
                        replyAction,
                        'eng',
                        configProviderContext.languages
                    ).isLocalized()
                ).toBeFalsy();

                expect(
                    Localization.translate(
                        replyAction,
                        'spa',
                        configProviderContext.languages
                    ).isLocalized()
                ).toBeFalsy();
            });

            it('should return a translated LocalizedObject if passed translations', () => {
                expect(
                    Localization.translate(
                        replyAction,
                        'eng',
                        configProviderContext.languages,
                        translations
                    ).isLocalized()
                ).toBeTruthy();

                expect(
                    Localization.translate(
                        replyAction,
                        'eng',
                        configProviderContext.languages,
                        translations
                    ).hasTranslation('text')
                ).toBeTruthy();

                expect(
                    Localization.translate(
                        replyAction,
                        'spa',
                        configProviderContext.languages,
                        translations
                    ).isLocalized()
                ).toBeTruthy();

                expect(
                    Localization.translate(
                        replyAction,
                        'spa',
                        configProviderContext.languages,
                        translations
                    ).hasTranslation('text')
                ).toBeTruthy();
            });
        }));
});
