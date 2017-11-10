import * as React from 'react';
import Select from 'react-select';
import { Type } from '../../services/EditorConfig';

const formStyles = require('./NodeEditor.scss');

export interface TypeChooserProps {
    className: string;
    typeConfigList: Type[];
    initialType: Type;
    onChange(config: Type): void;
}

export interface TypeChooserState {
    config: Type;
}

export default class TypeChooser extends React.PureComponent<TypeChooserProps, TypeChooserState> {
    constructor(props: TypeChooserProps) {
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
        const options: any = this.props.typeConfigList;
        return (
            <div className={this.props.className}>
                <div className={formStyles.intro}>
                    When a contact arrives at this point in your flow
                </div>
                <div>
                    <Select
                        value={this.state.config.type}
                        onChange={this.onChangeType}
                        valueKey="type"
                        searchable={false}
                        clearable={false}
                        labelKey="description"
                        options={options}
                    />
                </div>
            </div>
        );
    }
};
