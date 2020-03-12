import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

export interface TembaTextInputProps {}

interface TembaTextInputState {}

export default class Button extends React.Component<TembaTextInputProps, TembaTextInputState> {
  constructor(props: TembaTextInputProps) {
    super(props);
    this.state = {};

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public render(): JSX.Element {
    return <div></div>;
  }
}
