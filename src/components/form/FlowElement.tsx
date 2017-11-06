import * as React from 'react';
import * as UUID from 'uuid';

import { FormElement, IFormElementProps } from './FormElement';
import { FormWidget, IFormValueState } from './FormWidget';
import { ISearchResult } from '../../services/ComponentMap';
import { SelectSearch } from '../SelectSearch';

var Select = require('react-select');
var styles = require('./FormElement.scss');

interface IFlowElementProps extends IFormElementProps {
    flow_name: string;
    flow_uuid: string;
    endpoint?: string;
    placeholder?: string;
}

interface IFlowState extends IFormValueState {
    flow: ISearchResult;
}

export class FlowElement extends FormWidget<IFlowElementProps, IFlowState> {
    constructor(props: any) {
        super(props);

        var flow: ISearchResult = null;
        if (this.props.flow_uuid) {
            flow = {
                name: this.props.flow_name,
                id: this.props.flow_uuid,
                type: 'flow'
            };
        }

        this.state = {
            flow: flow,
            errors: []
        };

        this.onChange = this.onChange.bind(this);
    }

    onChange(selected: any) {
        this.setState({
            flow: selected[0]
        });
    }

    validate(): boolean {
        var errors: string[] = [];
        if (this.props.required) {
            if (!this.state.flow) {
                errors.push(this.props.name + ' is required');
            }
        }

        this.setState({ errors: errors });
        return errors.length == 0;
    }

    render() {
        var isValidNewOption = null;
        var createNewOption = null;
        var createPrompt = null;
        var createOptions = {};

        var classes = [];
        if (this.state.errors.length > 0) {
            // we use a global selector here for react-select
            classes.push('select-invalid');
        }

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
