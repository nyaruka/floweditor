import Localization from '~/services/Localization';
import { Spanish } from '~/testUtils/assetCreators';

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
    describe('instance methods', () => {
        describe('translate', () => {
            it('should return an untranslated LocalizedObject if not passed translations', () => {
                expect(Localization.translate(replyAction, Spanish).isLocalized()).toBeFalsy();

                expect(Localization.translate(replyAction, Spanish).isLocalized()).toBeFalsy();
            });

            it('should return a translated LocalizedObject if passed translations', () => {
                expect(
                    Localization.translate(replyAction, Spanish, translations).isLocalized()
                ).toBeTruthy();

                expect(
                    Localization.translate(replyAction, Spanish, translations).hasTranslation(
                        'text'
                    )
                ).toBeTruthy();

                expect(
                    Localization.translate(replyAction, Spanish, translations).isLocalized()
                ).toBeTruthy();

                expect(
                    Localization.translate(replyAction, Spanish, translations).hasTranslation(
                        'text'
                    )
                ).toBeTruthy();
            });
        });
    });
});
