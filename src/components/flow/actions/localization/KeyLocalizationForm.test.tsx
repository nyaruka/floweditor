import * as React from 'react';
import { fireEvent, render } from 'test/utils';
import { createSendEmailAction, getLocalizationFormProps, Spanish } from 'testUtils/assetCreators';

import KeyLocalizationForm from './KeyLocalizationForm';

describe(KeyLocalizationForm.name, () => {
  it('renders send email', () => {
    const props = getLocalizationFormProps(createSendEmailAction());
    const { baseElement } = render(<KeyLocalizationForm {...props} />);
    expect(baseElement).toMatchSnapshot();
  });

  it('handles changes', () => {
    const props = getLocalizationFormProps(createSendEmailAction());
    const { getByTestId, getByText } = render(<KeyLocalizationForm {...props} />);

    // modify the subject
    fireEvent.change(getByTestId('input'), { target: { value: 'translated subject' } });

    // modify the body
    fireEvent.click(getByText('Body Translation'));
    fireEvent.change(getByTestId('input'), { target: { value: 'translated body' } });

    // save our translations
    fireEvent.click(getByText('Ok'));
    expect(props.updateLocalizations).toMatchCallSnapshot();
  });

  it('removes translations', () => {
    const action = createSendEmailAction();
    const props = getLocalizationFormProps(action, Spanish, {
      [action.uuid]: { subject: ['hola'] }
    });

    // show that we initialized with hola
    const { baseElement, getByTestId, getByText } = render(<KeyLocalizationForm {...props} />);
    expect(baseElement).toMatchSnapshot();

    // clear the translation
    fireEvent.change(getByTestId('input'), { target: { value: '' } });

    // save our translations, which should remove the key
    fireEvent.click(getByText('Ok'));
    expect(props.updateLocalizations).toMatchCallSnapshot();
  });
});
