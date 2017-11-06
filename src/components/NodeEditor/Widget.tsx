import * as React from 'react';
import { IFormElementProps } from '../form/FormElement';
import { FormWidget, IFormValueState } from '../form/FormWidget';

abstract class Widget extends FormWidget<IFormElementProps, IFormValueState> {}

export default Widget;
