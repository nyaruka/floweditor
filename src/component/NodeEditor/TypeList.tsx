import * as React from 'react';
import Select from 'react-select';
import { configsToDisplay } from '~/config/typeConfigs';

import { Type } from '~/config';
import * as formStyles from './NodeEditor.scss';

export interface TypeListProps {
    __className: string;
    initialType: Type;
    onChange(config: Type): void;
}

export interface TypeListState {
    config: Type;
}

export default class TypeList extends React.PureComponent<TypeListProps, TypeListState> {
    constructor(props: TypeListProps) {
        super(props);

        this.state = {
            config: this.props.initialType
        };

        this.handleChangeType = this.handleChangeType.bind(this);
    }

    private handleChangeType(config: Type): void {
        this.setState(
            {
                config
            },
            () => this.props.onChange(config)
        );
    }

    public render(): JSX.Element {
        return (
            <div className={this.props.__className}>
                <div className={formStyles.intro}>
                    When a contact arrives at this point in your flow...
                </div>
                <div>
                    <Select
                        value={this.state.config}
                        onChange={this.handleChangeType}
                        valueKey="type"
                        searchable={false}
                        clearable={false}
                        labelKey="description"
                        options={configsToDisplay}
                    />
                </div>
            </div>
        );
    }
}
