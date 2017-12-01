import * as React from 'react';
import Select from 'react-select';
import { Type } from '../../providers/ConfigProvider/typeConfigs';
import { typeConfigListPT } from '../../providers/ConfigProvider/propTypes';
import { ConfigProviderContext } from '../../providers/ConfigProvider/configContext';

const formStyles = require('./NodeEditor.scss');

export interface TypeListProps {
    className: string;
    initialType: Type;
    onChange(config: Type): void;
}

export interface TypeListState {
    config: Type;
}

export default class TypeList extends React.PureComponent<TypeListProps, TypeListState> {
    public static contextTypes = {
        typeConfigList: typeConfigListPT
    };

    constructor(props: TypeListProps, context: ConfigProviderContext) {
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
            () => {
                this.props.onChange(config);
            }
        );
    }

    render(): JSX.Element {
        return (
            <div className={this.props.className}>
                <div className={formStyles.intro}>
                    When a contact arrives at this point in your flow...
                </div>
                <div>
                    <Select
                        value={this.state.config.type}
                        onChange={this.onChangeType}
                        valueKey="type"
                        searchable={false}
                        clearable={false}
                        labelKey="description"
                        options={this.context.typeConfigList}
                    />
                </div>
            </div>
        );
    }
}
