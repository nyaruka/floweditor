import Localization from './Localization';
import context from '../providers/ConfigProvider/configContext';

const {
    results: [{ uuid: flowUUID, definition }]
} = require('../../test_flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');

const { nodes: [{ actions: [replyAction] }], localization } = definition;

const translations = localization.spa;

const { languages } = context;

describe('Localization >', () => {
    describe('instance methods >', () =>
        describe('translate >', () => {
            it('should return an untranslated LocalizedObject if not passed translations', () => {
                expect(
                    Localization.translate(
                        replyAction,
                        'eng',
                        languages
                    ).isLocalized()
                ).toBeFalsy();

                expect(
                    Localization.translate(
                        replyAction,
                        'spa',
                        languages
                    ).isLocalized()
                ).toBeFalsy();
            });

            it('should return a translated LocalizedObject if passed translations', () => {
                expect(
                    Localization.translate(
                        replyAction,
                        'eng',
                        languages,
                        translations
                    ).isLocalized()
                ).toBeTruthy();

                expect(
                    Localization.translate(
                        replyAction,
                        'eng',
                        languages,
                        translations
                    ).hasTranslation('text')
                ).toBeTruthy();

                expect(
                    Localization.translate(
                        replyAction,
                        'spa',
                        languages,
                        translations
                    ).isLocalized()
                ).toBeTruthy();

                expect(
                    Localization.translate(
                        replyAction,
                        'spa',
                        languages,
                        translations
                    ).hasTranslation('text')
                ).toBeTruthy();
            });
        }));
});
