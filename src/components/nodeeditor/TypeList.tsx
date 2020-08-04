import { fakePropType } from 'config/ConfigProvider';
import { filterTypeConfigs } from 'config/helpers';
import { Type } from 'config/interfaces';
import { configsToDisplay } from 'config/typeConfigs';
import * as React from 'react';
import i18n from 'config/i18n';
import styles from './TypeList.module.scss';
import TembaSelect from 'temba/TembaSelect';

export interface TypeListProps {
  __className: string;
  initialType: Type;
  onChange(config: Type): void;
}

export interface TypeListState {
  config: Type;
}

export default class TypeList extends React.PureComponent<TypeListProps, TypeListState> {
  private typeConfigs: Type[];

  constructor(props: TypeListProps) {
    super(props);

    this.state = {
      config: this.props.initialType
    };

    this.handleChangeType = this.handleChangeType.bind(this);
  }

  public static contextTypes = {
    config: fakePropType
  };

  private handleChangeType(config: Type): void {
    this.setState({ config }, () => this.props.onChange(config));
  }

  private getTypeConfigs(): Type[] {
    if (this.typeConfigs === undefined) {
      this.typeConfigs = filterTypeConfigs(configsToDisplay, this.context.config);
    }
    return this.typeConfigs;
  }

  public render(): JSX.Element {
    return (
      <div className={`${this.props.__className} ${styles.type_list}`}>
        <p>{i18n.t('forms.type_label', 'When a contact arrives at this point in your flow...')}</p>
        <div>
          <TembaSelect
            key="type_select"
            name="type"
            onChange={this.handleChangeType}
            nameKey="description"
            valueKey="type"
            value={this.state.config}
            options={this.getTypeConfigs()}
            searchable={true}
          />
        </div>
      </div>
    );
  }
}
