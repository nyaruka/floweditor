import * as React from 'react';
import Dialog, { DialogProps, HeaderStyle } from '~/components/dialog/Dialog';
import { composeComponentTestUtils } from '~/testUtils';

const baseProps: DialogProps = {
    title: 'My Dialog',
    subtitle: 'Subtitlf',
    headerIcon: 'fe-icon',
    headerClass: 'header-class',
    headerStyle: HeaderStyle.BARBER,
    buttons: {
        primary: { name: 'Ok', onClick: jest.fn() },
        secondary: { name: 'Cancel', onClick: jest.fn() },
        tertiary: { name: 'Other', onClick: jest.fn() }
    },
    gutter: <div>The Gutter</div>
};

const { setup } = composeComponentTestUtils<DialogProps>(Dialog, baseProps);

describe(Dialog.name, () => {
    it('should render', () => {
        const { wrapper } = setup(true);
        expect(wrapper).toMatchSnapshot();
    });
});
