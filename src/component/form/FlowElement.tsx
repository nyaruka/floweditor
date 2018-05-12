import * as React from 'react';

import { ResultType } from '../../flowTypes';
import { Asset, Assets, AssetType } from '../../services/AssetService';
import { getSelectClass } from '../../utils';
import SelectSearch from '../SelectSearch/SelectSearch';
import FormElement, { FormElementProps } from './FormElement';

interface FlowElementProps extends FormElementProps {
    flow: { name: string; uuid: string };
    endpoint?: string;
    placeholder?: string;
    assets: Assets;
    onChange?: (selected: Asset[]) => void;
}

interface FlowState {
    flow: Asset;
}

export const notFound: string = 'Enter the name of an existing flow';

export default class FlowElement extends React.Component<FlowElementProps, FlowState> {
    constructor(props: FlowElementProps) {
        super(props);

        const flow =
            this.props.flow && this.props.flow.uuid && this.props.flow.name
                ? {
                      name: this.props.flow.name,
                      id: this.props.flow.uuid,
                      type: AssetType.Flow
                  }
                : null;

        this.state = {
            flow
        };

        this.handleChange = this.handleChange.bind(this);
    }

    private handleChange(selected: Asset[]): void {
        this.setState({
            flow: selected[0]
        });

        if (this.props.onChange) {
            this.props.onChange(selected);
        }
    }

    public render(): JSX.Element {
        const className = getSelectClass(0);
        return (
            <FormElement name={this.props.name}>
                <SelectSearch
                    __className={className}
                    onChange={this.handleChange}
                    name={this.props.name}
                    assets={this.props.assets}
                    resultType={ResultType.flow}
                    multi={false}
                    initial={[this.state.flow]}
                    searchPromptText={notFound}
                />
            </FormElement>
        );
    }
}
