import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import SelectSearch from '../SelectSearch';
import { SearchResult } from '../../services/ComponentMap';
import FormElement, { FormElementProps } from './FormElement';
import { getSelectClass, jsonEqual } from '../../helpers/utils';

import * as styles from './FormElement.scss';

interface GroupElementProps extends FormElementProps {
    groups: SearchResult[];
    localGroups?: SearchResult[];
    endpoint?: string;
    add?: boolean;
    placeholder?: string;
    searchPromptText?: string | JSX.Element;
    onChange?: (groups: SearchResult[]) => void;
}

interface GroupElementState {
    groups: SearchResult[];
    errors: string[];
}

export default class GroupElement extends React.Component<GroupElementProps, GroupElementState> {
    constructor(props: GroupElementProps) {
        super(props);

        const { groups } = props;

        this.state = {
            groups,
            errors: []
        };

        this.onChange = this.onChange.bind(this);
        this.isValidNewOption = this.isValidNewOption.bind(this);
        this.createNewOption = this.createNewOption.bind(this);
    }

    public componentWillReceiveProps(nextProps: GroupElementProps): void {
        if (!jsonEqual(nextProps.groups, this.state.groups)) {
            this.setState({ groups: nextProps.groups });
        }
    }

    private onChange(groups: SearchResult[]): void {
        if (!jsonEqual(groups, this.state.groups)) {
            this.setState(
                {
                    groups
                },
                () => this.props.onChange && this.props.onChange(groups)
            );
        }
    }

    public validate(): boolean {
        const errors: string[] = [];

        if (this.props.required) {
            if (this.state.groups.length < 1) {
                errors.push(`${this.props.name} is required`);
            }
        }

        this.setState({ errors });

        return errors.length === 0;
    }

    private isValidNewOption({ label }: { label: string }): boolean {
        if (!label) {
            return false;
        }

        const lowered = label.toLowerCase();

        return lowered.length > 0 && lowered.length <= 36 && /^[a-z0-9-][a-z0-9- ]*$/.test(lowered);
    }

    private createNewOption(arg: { label: string }): SearchResult {
        const newOption = {
            id: generateUUID(),
            name: arg.label,
            extraResult: true
        } as SearchResult;

        return newOption;
    }

    public render(): JSX.Element {
        const createOptions: any = {};

        if (this.props.add) {
            createOptions.isValidNewOption = this.isValidNewOption;
            createOptions.createNewOption = this.createNewOption;
            createOptions.createPrompt = 'New group: ';
        }

        const className: string = getSelectClass(this.state.errors.length);

        return (
            <FormElement name={this.props.name} errors={this.state.errors}>
                <SelectSearch
                    className={className}
                    onChange={this.onChange}
                    name={this.props.name}
                    url={this.props.endpoint}
                    resultType="group"
                    localSearchOptions={this.props.localGroups}
                    multi={true}
                    initial={this.state.groups}
                    closeOnSelect={false}
                    placeholder={this.props.placeholder}
                    searchPromptText={this.props.searchPromptText}
                    {...createOptions}
                />
            </FormElement>
        );
    }
}
