import * as React from 'react';
import Select from 'react-select';
import * as styles from '~/components/nodeeditor/TypeList.scss';
import { Type } from '~/config';
import { configsToDisplay } from '~/config/typeConfigs';
import { large } from '~/utils/reactselect';

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
            <div className={`${this.props.__className} ${styles.typeList}`}>
                <p>When a contact arrives at this point in your flow...</p>
                <div>
                    <Select
                        styles={large}
                        value={this.state.config}
                        onChange={this.handleChangeType}
                        isSearchable={false}
                        isClearable={false}
                        getOptionValue={(option: Type) => option.type}
                        getOptionLabel={(option: Type) => option.description}
                        options={configsToDisplay}
                    />
                </div>
            </div>
        );
    }
}
