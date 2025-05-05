import {
  containerClasses,
  LanguageSelector,
  LanguageSelectorProps
} from 'components/languageselector/LanguageSelector';
import { composeComponentTestUtils, setMock, setupStore } from 'testUtils';
import { English, languages, Spanish } from 'testUtils/assetCreators';

const baseProps: LanguageSelectorProps = {
  language: English,
  languages,
  handleLanguageChange: jest.fn()
};

const { setup } = composeComponentTestUtils(LanguageSelector, baseProps);

describe(LanguageSelector.name, () => {
  it('renders', () => {
    setupStore({ languageCode: 'spa' });
    const { wrapper } = setup(true);
    expect(wrapper).toMatchSnapshot();
  });
});
