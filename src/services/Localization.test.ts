import { languages } from '~/testUtils/assetCreators';

import Localization from './Localization';

const {
    nodes: [
        {
            actions: [replyAction]
        }
    ],
    localization
} = require('~/test/flows/customer_service.json');

const translations = localization.spa;

describe('Localization', () => {
    describe('instance methods', () =>
        describe('translate', () => {
            it('should return an untranslated LocalizedObject if not passed translations', () => {
                expect(Localization.translate(replyAction, languages).isLocalized()).toBeFalsy();

                expect(Localization.translate(replyAction, languages).isLocalized()).toBeFalsy();
            });

            it('should return a translated LocalizedObject if passed translations', () => {
                expect(
                    Localization.translate(replyAction, languages, translations).isLocalized()
                ).toBeTruthy();

                expect(
                    Localization.translate(replyAction, languages, translations).hasTranslation(
                        'text'
                    )
                ).toBeTruthy();

                expect(
                    Localization.translate(replyAction, languages, translations).isLocalized()
                ).toBeTruthy();

                expect(
                    Localization.translate(replyAction, languages, translations).hasTranslation(
                        'text'
                    )
                ).toBeTruthy();
            });
        }));
});
