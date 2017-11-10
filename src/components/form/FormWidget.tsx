import * as React from 'react';

import { FormElementProps } from './FormElement';

var styles = require('./FormElement.scss');

export interface FormValueState {
    value?: any;
    errors: string[];
}

export abstract class FormWidget<
    P extends FormElementProps,
    S extends FormValueState
> extends React.PureComponent<P, S> {
    abstract validate(): boolean;
}
