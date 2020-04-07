import * as React from 'react';
import { render } from 'test/utils';
import { TranslatorTab, TranslatorTabProps } from './TranslatorTab';
import { Spanish } from 'testUtils/assetCreators';

const translatorProps: TranslatorTabProps = {
  localization: {},
  nodes: {},
  languages: {},
  popped: null,

  // callbacks
  onToggled: jest.fn(),
  onTranslationClicked: jest.fn(),
  onTranslationOpened: jest.fn(),

  // translation
  language: Spanish
};

describe(TranslatorTab.name, () => {
  it('renders', () => {
    const { baseElement, getByText } = render(<TranslatorTab {...translatorProps} />);
    getByText('Spanish Translations');
    expect(baseElement).toMatchSnapshot();
  });
});
