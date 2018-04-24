import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { ResultType } from '../../flowTypes';
import { SearchResult } from '../../store';
import { getSelectClass, isValidLabel, jsonEqual } from '../../utils';
import SelectSearch from '../SelectSearch';
import FormElement, { FormElementProps } from './FormElement';
import { NewOptionCreatorHandler, IsValidNewOptionHandler } from 'react-select';
import { Assets } from '../../services/AssetService';

export interface GroupOption {
    group: string;
    name: string;
}

export interface GroupsElementProps extends FormElementProps {
    add?: boolean;
    groups?: SearchResult[];
    placeholder?: string;
    searchPromptText?: string | JSX.Element;
    onChange?: (groups: SearchResult[]) => void;
    assets: Assets;
}

interface GroupsElementState {
    groups: SearchResult[];
    errors: string[];
}

export const isValidNewOption: IsValidNewOptionHandler = ({ label }) =>
    !label ? false : isValidLabel(label);

export const createNewOption: NewOptionCreatorHandler = ({ label }) => ({
    id: generateUUID(),
    name: label,
    extraResult: true
});

export const GROUP_PROMPT = 'New group: ';
export const GROUP_PLACEHOLDER = 'Enter the name of an existing group...';
export const GROUP_NOT_FOUND = 'Invalid group name';

export default class GroupsElement extends React.Component<GroupsElementProps, GroupsElementState> {
    public static defaultProps = {
        placeholder: GROUP_PLACEHOLDER,
        searchPromptText: GROUP_NOT_FOUND
    };

    constructor(props: GroupsElementProps) {
        super(props);

        this.state = {
            groups: this.props.groups || [],
            errors: []
        };

        this.onChange = this.onChange.bind(this);
    }

    public componentWillReceiveProps(nextProps: GroupsElementProps): void {
        if (
            nextProps.groups &&
            nextProps.groups.length &&
            !jsonEqual(nextProps.groups, this.props.groups)
        ) {
            this.setState({ groups: nextProps.groups });
        }
    }

    private onChange(groups: SearchResult[]): void {
        if (!jsonEqual(groups, this.state.groups)) {
            this.setState(
                {
                    groups
                },
                () => {
                    if (this.props.onChange) {
                        this.props.onChange(groups);
                    }
                }
            );
        }
    }

    public validate(): boolean {
        const errors: string[] = [];

        if (this.props.required && !this.state.groups.length) {
            errors.push(`${this.props.name} is required.`);
        }

        this.setState({ errors });

        return errors.length === 0;
    }

    public render(): JSX.Element {
        const createOptions: any = {};

        if (this.props.add) {
            createOptions.isValidNewOption = isValidNewOption;
            createOptions.createNewOption = createNewOption;
            createOptions.createPrompt = GROUP_PROMPT;
        }

        const className = getSelectClass(this.state.errors.length);

        return (
            <FormElement name={this.props.name} errors={this.state.errors}>
                <SelectSearch
                    _className={className}
                    onChange={this.onChange}
                    name={this.props.name}
                    resultType={ResultType.group}
                    assets={this.props.assets}
                    multi={true}
                    initial={this.state.groups}
                    placeholder={this.props.placeholder}
                    searchPromptText={this.props.searchPromptText}
                    {...createOptions}
                />
            </FormElement>
        );
    }
}
