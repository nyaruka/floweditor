import { react as bindCallbacks } from 'auto-bind';
import { getAllErrors } from 'components/flow/actions/helpers';
import { HeaderEntry } from 'components/flow/routers/webhook/WebhookRouterForm';
import styles from 'components/flow/routers/webhook/WebhookRouterForm.module.scss';
import FormElement from 'components/form/FormElement';
import TextInputElement from 'components/form/textinput/TextInputElement';
import * as React from 'react';
import { StringEntry, ValidationFailure } from 'store/nodeEditor';
import { HeaderName, validate } from 'store/validators';

// TODO: move this into webhook router component
export interface Header {
  uuid: string;
  name: string;
  value: string;
}

export interface HeaderElementProps {
  entry: HeaderEntry;
  index: number;
  onRemove: (header: Header) => void;
  onChange: (header: Header, validationFailures: ValidationFailure[]) => void;
  empty?: boolean;
}

interface HeaderElementState {
  name: StringEntry;
  value: StringEntry;
}

export const headerContainerSpecId = 'header-container';
export const nameContainerSpecId = 'name-container';
export const valueConatainerSpecId = 'value-container';
export const removeIcoSpecId = 'remove-icon';

export const HEADER_NAME_ERROR = 'HTTP headers must have a name';
export const NAME_PLACEHOLDER = 'Header Name';
export const VALUE_PLACEHOLDER = 'Value';

export default class HeaderElement extends React.Component<HeaderElementProps, HeaderElementState> {
  constructor(props: HeaderElementProps) {
    super(props);

    const header = this.props.entry.value;
    const name = header.name || '';
    const value = header.value || '';

    this.state = {
      name: { value: name },
      value: { value }
    };

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  private getHeader(): Header {
    return {
      name: this.state.name.value,
      value: this.state.value.value,
      uuid: this.props.entry.value.uuid
    };
  }

  private handleChangeName(value: string): void {
    const name = validate('Header name', value, [HeaderName]);
    this.setState({ name: { value: name.value } }, () =>
      this.props.onChange(
        this.getHeader(),
        getAllErrors(this.state.value).concat(getAllErrors(name))
      )
    );
  }

  private handleChangeValue(value: string): void {
    this.setState({ value: { value } }, () => {
      const name = validate('Header name', this.state.name.value, [HeaderName]);
      this.props.onChange(
        this.getHeader(),
        getAllErrors(this.state.value).concat(getAllErrors(name))
      );
    });
  }

  private handleRemove(): void {
    this.props.onRemove(this.getHeader());
  }

  private getRemoveIco(): JSX.Element {
    return (
      <div className={styles.remove_ico} onClick={this.handleRemove} data-spec={removeIcoSpecId}>
        <span className="fe-x" />
      </div>
    );
  }

  public render(): JSX.Element {
    const removeIco: JSX.Element = this.getRemoveIco();
    return (
      <FormElement name="Header" entry={this.props.entry}>
        <div className={styles.header} data-spec={headerContainerSpecId}>
          <div className={styles.header_name} data-spec={nameContainerSpecId}>
            <TextInputElement
              placeholder={NAME_PLACEHOLDER}
              name="name"
              onChange={this.handleChangeName}
              entry={this.state.name}
            />
          </div>
          <div className={styles.header_value} data-spec={valueConatainerSpecId}>
            <TextInputElement
              placeholder={VALUE_PLACEHOLDER}
              name="value"
              onChange={this.handleChangeValue}
              entry={this.state.value}
              onFieldFailures={(validationFailures: ValidationFailure[]) => {
                const name = validate('Header name', this.state.name.value, [HeaderName]);
                this.props.onChange(
                  this.getHeader(),
                  validationFailures.concat(getAllErrors(name))
                );
              }}
              autocomplete={true}
            />
          </div>
          {removeIco}
        </div>
      </FormElement>
    );
  }
}
