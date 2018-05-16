import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';

import '../src/global.scss';
import Button, { ButtonTypes, ButtonProps } from '../src/component/Button';

const buttonDecorator = (storyFn: Function): JSX.Element => (
    <div
        style={{
            fontFamily: 'Roboto, sans-serif',
            background: '#f1f1f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '50vh',
            margin: '25vh'
        }}
    >
        {storyFn()}
    </div>
);

const primaryBtnProps: ButtonProps = {
    onClick: action('clicked'),
    name: 'Save',
    type: ButtonTypes.primary
};

const secondaryBtnProps: ButtonProps = {
    onClick: action('clicked'),
    name: 'Cancel',
    type: ButtonTypes.secondary
};

storiesOf('Button', module)
    .addDecorator(buttonDecorator)
    .add('Save', () => <Button {...primaryBtnProps} />)
    .add('Cancel', () => <Button {...secondaryBtnProps} />);
