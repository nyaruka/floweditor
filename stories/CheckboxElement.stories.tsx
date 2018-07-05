import '~/global.scss';

import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import CheckboxElement, { CheckboxElementProps } from '~/component/form/CheckboxElement';
import { ellipsize } from '~/component/form/TimeoutControl';

import * as styles from './CheckboxElement.stories.scss';

const checkboxDecorator = (storyFn: Function): JSX.Element => (
    <div
        style={{
            borderRadius: '5px',
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

const handleCheck = action('checked');
const baseProps: CheckboxElementProps = {
    name: 'Checkbox',
    checked: false,
    checkboxClassName: styles.checkbox,
    onChange: handleCheck
};

storiesOf(CheckboxElement.name, module)
    .addDecorator(checkboxDecorator)
    .add('Bare', () => <CheckboxElement {...baseProps} />)
    .add('With Title', () => (
        <CheckboxElement
            {...baseProps}
            title="All Destinations"
            description="Send a message to all destinations known for this contact."
        />
    ))
    .add('Without Title', () => (
        <CheckboxElement
            {...baseProps}
            description={ellipsize('Continue when there is no response')}
        />
    ));
