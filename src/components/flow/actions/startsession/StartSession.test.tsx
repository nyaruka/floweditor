import StartSessionComp from 'components/flow/actions/startsession/StartSession';
import { StartSession } from 'flowTypes';
import React from 'react';
import { render } from 'test/utils';
import { createStartSessionAction } from 'testUtils/assetCreators';

describe('StartSessionComp', () => {
  const baseProps: StartSession = createStartSessionAction();

  describe('render', () => {
    it('should render all props', () => {
      const { baseElement } = render(<StartSessionComp {...baseProps} />);
      expect(baseElement).toMatchSnapshot();
    });

    it('should render a long list of both contacts and proups', () => {
      const { baseElement, getByText } = render(
        <StartSessionComp
          {...baseProps}
          contacts={[
            { uuid: 'contact-1', name: 'Norbert Kwizera' },
            { uuid: 'contact-2', name: 'Kellan Alexander' },
            { uuid: 'contact-3', name: 'Rowan Seymour' },
            { uuid: 'contact-4', name: 'Leah Burgerbuns' },
            { uuid: 'contact-5', name: 'Nic Pottier' }
          ]}
        />
      );

      expect(baseElement).toMatchSnapshot();
      getByText('+2 more');
    });

    it('should render creating a new contact', () => {
      const { baseElement, getByText } = render(
        <StartSessionComp {...baseProps} contacts={[]} groups={[]} create_contact={true} />
      );
      expect(baseElement).toMatchSnapshot();
      getByText('Create a new contact');
    });
  });
});
