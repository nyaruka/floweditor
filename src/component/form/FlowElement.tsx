import * as React from 'react';
import { getSelectClass } from '../../utils';
import SelectSearch from '../SelectSearch';
import FormElement, { FormElementProps } from './FormElement';
import { SearchResult } from '../../store';

interface FlowElementProps extends FormElementProps {
    flow_name: string;
    flow_uuid: string;
    endpoint?: string;
    placeholder?: string;
}

interface FlowState {
    flow: SearchResult;
    errors: string[];
}

export const notFound: string = 'Enter the name of an existing flow';

export default class FlowElement extends React.Component<FlowElementProps, FlowState> {
    constructor(props: any) {
        super(props);

        const flow =
            this.props.flow_uuid && this.props.flow_name
                ? {
                      name: this.props.flow_name,
                      id: this.props.flow_uuid,
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
        const className: string = getSelectClass(this.state.errors.length);
        return (
            <FormElement name={this.props.name} errors={this.state.errors}>
                <SelectSearch
                    className={className}
                    onChange={this.onChange}
                    name={this.props.name}
                    url={this.props.endpoint}
                    resultType="flow"
                    multi={false}
                    initial={[this.state.flow]}
                    searchPromptText={notFound}
                />
            </FormElement>
        );
    }
}
