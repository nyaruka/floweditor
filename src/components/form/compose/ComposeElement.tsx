import { react as bindCallbacks } from 'auto-bind';
import FormElement, { FormElementProps } from 'components/form/FormElement';
import * as React from 'react';
import { StringEntry } from 'store/nodeEditor';

export interface ComposeProps extends FormElementProps {
  name: string;
  entry?: StringEntry;
  errors?: string[];
  chatbox?: boolean;
  attachments?: boolean;
  counter?: boolean;
  onChange?: (composeValue: string) => void;
}

export default class ComposeElement extends React.Component<ComposeProps> {
  ele: HTMLElement;

  constructor(props: ComposeProps) {
    super(props);

    let initial = '';
    if (this.props.entry && this.props.entry.value) {
      initial = this.props.entry.value;
    }

    this.state = {
      value: initial
    };

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  public handleEventListenerRegistration(ref: any): void {
    if (!this.ele && ref) {
      this.ele = ref;
    }
  }

  public componentDidMount(): void {
    if (this.ele) {
      this.ele.addEventListener('temba-content-changed', this.handleChange);
    }
  }

  public handleChange(event: any): void {
    if (this.props.onChange) {
      this.props.onChange(event.detail);
    }
  }

  public render(): JSX.Element {
    const optional: any = {};
    if (this.props.chatbox) {
      optional['chatbox'] = this.props.chatbox;
    }
    if (this.props.attachments) {
      optional['attachments'] = this.props.attachments;
    }
    if (this.props.counter) {
      optional['counter'] = this.props.counter;
    }

    return (
      <FormElement
        __className={this.props.__className}
        name={this.props.name}
        entry={this.props.entry}
      >
        <temba-compose
          ref={this.handleEventListenerRegistration}
          name={this.props.name}
          {...optional}
          value={this.props.entry.value}
          errors={this.props.errors}
          onChange={this.handleChange}
        ></temba-compose>
      </FormElement>
    );
  }
}
