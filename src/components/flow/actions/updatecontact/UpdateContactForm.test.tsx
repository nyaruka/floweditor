import UpdateContactForm from 'components/flow/actions/updatecontact/UpdateContactForm';
import { mock } from 'testUtils';
import {
  createSetContactFieldAction,
  getActionFormProps,
  createSetContactChannelAction,
  createSetContactNameAction,
  createSetContactLanguageAction
} from 'testUtils/assetCreators';
import * as utils from 'utils';
import * as React from 'react';
import { render, fireEvent } from 'test/utils';

mock(utils, 'createUUID', utils.seededUUIDs());

// These are the RTL-based tests
describe(UpdateContactForm.name, () => {
  it('should render field', () => {
    const { baseElement } = render(
      <UpdateContactForm {...getActionFormProps(createSetContactFieldAction())} />
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('should render channel', () => {
    const { baseElement } = render(
      <UpdateContactForm {...getActionFormProps(createSetContactChannelAction())} />
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('should render name', () => {
    const { baseElement } = render(
      <UpdateContactForm {...getActionFormProps(createSetContactNameAction())} />
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('should render language', () => {
    const { baseElement } = render(
      <UpdateContactForm {...getActionFormProps(createSetContactLanguageAction())} />
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('shouldnt allow searching or expressions in language selection', () => {
    const { getByTestId } = render(
      <UpdateContactForm {...getActionFormProps(createSetContactLanguageAction())} />
    );

    // we don't support searching for languages
    const select = getByTestId('temba_select_language');
    expect(select.hasAttribute('searchable')).toBeFalsy();
  });
});
