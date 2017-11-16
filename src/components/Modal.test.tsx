import * as React from 'react';
import '../enzymeAdapter';
import { shallow } from 'enzyme';
import Modal, { ButtonSet, ModalProps } from './Modal';

const title: JSX.Element = <div>Send Message</div>;

const titleAdvanced: JSX.Element = (
    <div>
        <div>Send Message</div>
        <div className="advanced_title">Advanced Settings</div>
    </div>
);

const initialButtons: ButtonSet = {
    primary: { name: 'Save', onClick: jest.fn() },
    secondary: { name: 'Cancel', onClick: jest.fn() }
};

const modalProps: ModalProps = {
    show: true,
    title: [title, titleAdvanced],
    buttons: initialButtons
};

const ModalShallow = shallow(<Modal {...modalProps} />);

describe('Component: Modal', () => {
    it('should render', () => {
        expect(ModalShallow.exists()).toBeTruthy();
        expect(ModalShallow.state('flipped')).toBeFalsy();
    });
});
