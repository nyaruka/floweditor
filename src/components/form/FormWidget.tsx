import * as React from "react";

import { IFormElementProps } from './FormElement';

var styles = require('./FormElement.scss');

export interface IFormValueState {
    value?: any;
    errors: string[];
}

export abstract class FormWidget<P extends IFormElementProps, S extends IFormValueState> extends React.PureComponent<P, S> {
    abstract validate(): boolean;
}
