import * as React from 'react';
import { getSelectClass } from '../../utils';
import SelectSearch from '../SelectSearch';
import FormElement, { FormElementProps } from './FormElement';
import { ResultType } from '../../flowTypes';
import { Assets, Asset } from '../../services/AssetService';

interface FlowElementProps extends FormElementProps {
    flow: { name: string; uuid: string };
    endpoint?: string;
    placeholder?: string;
    assets: Assets;
}

interface FlowState {
    flow: Asset;
    errors: string[];
}

export const notFound: string = 'Enter the name of an existing flow';

export default class FlowElement extends React.Component<FlowElementProps, FlowState> {
    constructor(props: any) {
        super(props);

        const flow =
            this.props.flow.uuid && this.props.flow.name
                ? {
                      name: this.props.flow.name,
                      id: this.props.flow.uuid,
                      type: 'flow'
                  }
                : null;

        this.state = {
            flow,
            errors: []
        };

        this.onChange = this.onChange.bind(this);
    }

    private onChange(flow: any): void {
        this.setState({
            flow
        });
    }

    private validate(): boolean {
        const errors: string[] = [];

        if (this.props.required) {
            if (!this.state.flow) {
                errors.push(`${this.props.name} is required`);
            }
        }

        this.setState({ errors });

        return errors.length === 0;
    }

    public render(): JSX.Element {
        const className = getSelectClass(this.state.errors.length);
        return (
            <FormElement name={this.props.name} errors={this.state.errors}>
                <SelectSearch
                    __className={className}
                    onChange={this.onChange}
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
