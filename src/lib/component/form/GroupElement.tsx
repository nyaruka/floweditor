import * as React from 'react';
import { substArr } from '@ycleptkellan/substantive';
import { v4 as generateUUID } from 'uuid';
import SelectSearch from '../SelectSearch';
import { SearchResult } from '../../services/ComponentMap';
import FormElement, { FormElementProps } from './FormElement';
import { getSelectClass, jsonEqual } from '../../utils';
import { Type } from '../../config';
import { AnyAction } from '../../flowTypes';

export interface GroupOption {
    group: string;
    name: string;
}

export interface GroupElementProps extends FormElementProps {
    endpoint: string;
    add?: boolean;
    groups?: SearchResult[];
    localGroups?: SearchResult[];
    placeholder?: string;
    searchPromptText?: string | JSX.Element;
    onChange?: (groups: SearchResult[]) => void;
}

interface GroupElementState {
    groups: SearchResult[];
    errors: string[];
}

export const isValidNewOption = (
    { label }: { label: string } = { label: '' }
): boolean => {
    if (!label) {
        return false;
    }

    const lowered = label.toLowerCase();

    const isValid =
        lowered.length > 0 &&
        lowered.length <= 36 &&
        /^[a-z0-9-][a-z0-9- ]*$/.test(lowered);

    return isValid;
};

export const createNewOption = ({ label }: { label: string }): SearchResult => {
    const newOption = {
        id: generateUUID(),
        name: label,
        extraResult: true
    } as SearchResult;

    return newOption;
};

export const getInitialGroups = ({
    groups,
    localGroups
}: GroupElementProps): SearchResult[] => {
    if (substArr(groups)) {
        return groups;
    } else if (substArr(localGroups)) {
        return localGroups;
    } else {
        return [];
    }
};

export const GROUP_PROMPT = 'New group: ';
export const GROUP_PLACEHOLDER = 'Enter the name of an existing group...';
export const GROUP_NOT_FOUND = 'Enter the name of an existing group';

export default class GroupElement extends React.Component<
    GroupElementProps,
    GroupElementState
> {
    constructor(props: GroupElementProps) {
        super(props);

        const groups = getInitialGroups(props);

        this.state = {
            groups,
            errors: []
        };

        this.onChange = this.onChange.bind(this);
    }

    public componentWillReceiveProps(nextProps: GroupElementProps): void {
        if (
            substArr(nextProps.groups) &&
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
                () => this.props.onChange && this.props.onChange(groups)
            );
        }
    }

    public validate(): boolean {
        const errors: string[] = [];

        if (this.props.required && !substArr(this.state.groups)) {
            errors.push(`${this.props.name} is required`);
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
        const placeholder = this.props.placeholder || GROUP_PLACEHOLDER;
        const searchPromptText = this.props.searchPromptText || GROUP_NOT_FOUND;

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
                    placeholder={placeholder}
                    searchPromptText={searchPromptText}
                    {...createOptions}
                />
            </FormElement>
        );
    }
}
