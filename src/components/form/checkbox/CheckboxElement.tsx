import { react as bindCallbacks } from 'auto-bind';
import { FormElementProps } from 'components/form/FormElement';
import * as React from 'react';

export interface CheckboxElementProps extends FormElementProps {
  checked: boolean;
  title?: string;
  description?: string;
  onChange?(checked: boolean): void;
}

interface CheckboxState {
  checked: boolean;
}

export const boxIco = 'fe-square';
export const checkedBoxIco = 'fe-check-square';

export const checkboxSpecId = 'checkbox';
export const titleSpecId = 'title';
export const descSpecId = 'description';

export default class CheckboxElement extends React.Component<CheckboxElementProps, CheckboxState> {
  private checkbox: HTMLElement;
  constructor(props: any) {
    super(props);

    this.state = {
      checked: this.props.checked
    };

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public handleChange(event: any) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.checkbox) {
      const checked = (this.checkbox as any).checked;
      if (checked !== this.state.checked && checked !== undefined) {
        this.setState({ checked }, () => {
          if (this.props.onChange) {
            this.props.onChange(checked);
          }
        });
      }
    }
  }

  public componentDidMount(): void {
    if (this.props.checked) {
      this.setState({ checked: this.props.checked });
    }
    if (this.checkbox) {
      this.checkbox.addEventListener('change', this.handleChange);
    }
  }

  public componentWillUnmount(): void {
    this.checkbox.removeEventListener('change', this.handleChange);
  }

  /* istanbul ignore next */
  public validate(): boolean {
    return true;
  }

  public render(): JSX.Element {
    const optional: any = {};
    if (this.state.checked) {
      optional['checked'] = true;
    }
    return (
      <temba-checkbox
        ref={(ele: any) => {
          this.checkbox = ele;
        }}
        {...optional}
        label={this.props.title}
        help_text={this.props.description}
      ></temba-checkbox>
    );
  }
}
