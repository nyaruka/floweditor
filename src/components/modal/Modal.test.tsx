import * as React from 'react';
import Modal, { ModalProps } from '~/components/modal/Modal';
import { composeComponentTestUtils } from '~/testUtils';

const waitForRespTitle = <div key={'front'}>Wait for Response</div>;

const baseProps: ModalProps = {
    show: true,
    __className: 'waitForResponse',
    width: '600px'
};

const { setup, spyOn } = composeComponentTestUtils(Modal, baseProps);

describe(Modal.name, () => {
    describe('render', () => {
        it('should render timeout control', () => {
            const { wrapper } = setup(false);
            expect(wrapper).toMatchSnapshot();
        });
    });
});
