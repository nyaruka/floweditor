import * as React from 'react';
import UUID from 'uuid';
import Select from 'react-select';
import { SearchResult } from '../../services/ComponentMap';
import FormElement, { FormElementProps } from './FormElement';
import SelectSearch from '../SelectSearch';
import { getSelectClass } from '../../helpers/utils';

const styles = require('./FormElement.scss');

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

export default class FlowElement extends React.Component<FlowElementProps, FlowState> {
    constructor(props: any) {
        super(props);

        let flow: SearchResult = null;

        if (this.props.flow_uuid) {
            flow = {
                name: this.props.flow_name,
                id: this.props.flow_uuid,
                type: 'flow'
            };
        }

        this.state = {
            flow,
            errors: []
        };

        this.onChange = this.onChange.bind(this);
    }

    onChange([flow]: any) {
        this.setState({
            flow
        });
    }

    validate(): boolean {
        const errors: string[] = [];

        if (this.props.required) {
            if (!this.state.flow) {
                errors.push(`${this.props.name} is required`);
            }
        }

        this.setState({ errors: errors });

        return errors.length === 0;
    }

    render() {
        let createOptions = {};

        const classes: string[] = getSelectClass(this.state.errors.length);

        return (
            <FormElement name={this.props.name} errors={this.state.errors}>
                <SelectSearch
                    className={classes.join(' ')}
                    onChange={this.onChange}
                    name={this.props.name}
                    url={this.props.endpoint}
                    resultType="flow"
                    multi={false}
                    clearable={false}
                    initial={[this.state.flow]}
                    {...createOptions}
                />
            </FormElement>
        );
    }
}
