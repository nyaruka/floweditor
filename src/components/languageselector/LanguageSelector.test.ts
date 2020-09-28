import {
  containerClasses,
  LanguageSelector,
  LanguageSelectorProps
} from 'components/languageselector/LanguageSelector';
import { composeComponentTestUtils, getSpecWrapper, setMock } from 'testUtils';
import { English, languages, Spanish } from 'testUtils/assetCreators';

const baseProps: LanguageSelectorProps = {
  language: English,
  languages,
  handleLanguageChange: jest.fn()
};

const { setup } = composeComponentTestUtils(LanguageSelector, baseProps);

describe(LanguageSelector.name, () => {
  describe('instance methods', () => {
    describe('onChange', () => {
      it('should call action creators that update language, translating state', () => {
        const component = setup(true, {
          handleLanguageChanged: setMock()
        });

        const instance: LanguageSelector = component.instance;
        const props: Partial<LanguageSelectorProps> = component.props;

        instance.handleLanguageChanged(Spanish);
        expect(props.handleLanguageChange).toHaveBeenCalledTimes(1);
        expect(props.handleLanguageChange).toHaveBeenCalledWith(Spanish);

        instance.handleLanguageChanged(English);
        expect(props.handleLanguageChange).toHaveBeenCalledTimes(2);
        expect(props.handleLanguageChange).toHaveBeenCalledWith(English);
      });
    });
  });
});
