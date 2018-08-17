import {
    containerClasses,
    LanguageSelector,
    languageSelectorContainerSpecId,
    LanguageSelectorProps
} from '~/components/languageselector/LanguageSelector';
import { composeComponentTestUtils, getSpecWrapper, setMock } from '~/testUtils';
import { English, Spanish } from '~/testUtils/assetCreators';

const baseProps: LanguageSelectorProps = {
    editorState: null,
    flowState: null
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
                    initial: [props.editorState.language],
                    localSearchOptions: props.flowState.languages,
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

                expect(props.editorState.mutator.mergeEditorState).toHaveBeenCalledTimes(1);
                expect(props.editorState.mutator.mergeEditorState).toHaveBeenCalledWith(Spanish);

                instance.handleLanguageChange([English]);

                expect(props.editorState.mutator.mergeEditorState).toHaveBeenCalledTimes(2);
                expect(props.editorState.mutator.mergeEditorState).toHaveBeenCalledWith(English);
            });
        });
    });
});
