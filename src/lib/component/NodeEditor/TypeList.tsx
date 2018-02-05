import * as React from 'react';
import Select from 'react-select';
import { Type, typeConfigList } from '../../config';

import * as formStyles from './NodeEditor.scss';

export interface TypeListProps {
    __className: string;
    initialType: Type;
    onChange: (config: Type) => void;
}

export interface TypeListState {
    config: Type;
}

export const TYPE_LIST_LABEL =
    'When a contact arrives at this point in your flow...';

export default class TypeList extends React.PureComponent<
    TypeListProps,
    TypeListState
> {
    constructor(props: TypeListProps) {
        super(props);

        this.state = {
            config: this.props.initialType
        };

        this.onChangeType = this.onChangeType.bind(this);
    }

    private onChangeType(config: Type): void {
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
                <span className={formStyles.intro}>{TYPE_LIST_LABEL}</span>
                <Select
                    value={this.state.config}
                    onChange={this.onChangeType}
                    valueKey="type"
                    searchable={false}
                    clearable={false}
                    labelKey="description"
                    options={typeConfigList}
                />
            </div>
        );
    }
}
