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
  // button?: boolean;
  // handleButtonClicked?: (value: string, name?: string) => void;
  onChange?: (value: string, name?: string) => void;
}

export default class ComposeElement extends React.Component<ComposeProps> {
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
      include: [
        /^on/,
        /^handle/,
        /handleChatboxChange/,
        /addCurrentAttachment/,
        /removeCurrentAttachment/
      ]
    });
  }

  public componentDidMount(): void {
    // todo
  }

  // public handleButtonClicked({ currentTarget: { value } }: any): void {
  //   if (this.props.handleButtonClicked) {
  //     this.props.handleButtonClicked(value, this.props.name);
  //   }
  // }

  public handleChange({ currentTarget: { value } }: any): void {
    console.log('handleChange value', value);
    console.log('handleChange entry', this.props.entry);
    console.log('handleChange value', value);
    console.log('handleChange entry', this.props.entry.value);
    if (this.props.onChange) {
      this.props.onChange(value, this.props.name);
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
    // if (this.props.button) {
    //   optional['button'] = this.props.button;
    // }
    // todo
    // if (this.props.handleButtonClicked) {
    //   optional['@temba-button-clicked'] = this.props.handleButtonClicked;
    // }

    return (
      <FormElement
        __className={this.props.__className}
        name={this.props.name}
        entry={this.props.entry}
      >
        <temba-compose
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
