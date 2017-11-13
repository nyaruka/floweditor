import * as React from 'react';
import { FormElementProps } from './FormElement';

export interface FormWidgetChildProps {

}

export interface FormWidgetProps {
    children(childProps: FormWidgetChildProps): JSX.Element;
}

export interface FormWidgetState {
    value?: any;
    errors: string[];
}

// Do something similar to nodeEditor form here, where you consume the child component's Validate() callback
export default class FormWidget extends React.PureComponent<FormWidgetProps, FormWidgetState> {
    private validate: Function;

    constructor(props: FormWidgetProps) {
        super(props);

        this.validateCallback = this.validateCallback.bind(this);
    }

    private validateCallback(callback: Function) {
        return (this.validate = callback);
    }

    render(): JSX.Element {
        const injectedProps = {

        };
        return this.props.children(injectedProps);
    }
}
