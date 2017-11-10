import * as React from 'react';
import { FormElementProps } from '../form/FormElement';
import { FormWidget, FormValueState } from '../form/FormWidget';

abstract class Widget extends FormWidget<FormElementProps, FormValueState> {}

export default Widget;
