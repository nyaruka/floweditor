import * as React from 'react';
import Select from 'react-select';
import { IType } from '../../services/EditorConfig';

const formStyles = require('./NodeEditor.scss');

export interface ITypeChooserProps {
    className: string;
    typeConfigList: IType[];
    initialType: IType;
    onChange(config: IType): void;
}

export interface ITypeChooserState {
    config: IType;
}

class TypeChooser extends React.PureComponent<ITypeChooserProps, ITypeChooserState> {
    constructor(props: ITypeChooserProps) {
        super(props);

        this.state = {
            config: this.props.initialType
        };
    }

    private onChangeType(config: IType): void {
        this.setState(
            {
                config: config
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
                        onChange={this.onChangeType.bind(this)}
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
}

export default TypeChooser;
