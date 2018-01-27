import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import SelectSearch from '../SelectSearch';
import { SearchResult } from '../../services/ComponentMap';
import FormElement, { FormElementProps } from './FormElement';
import { getSelectClass, truthyArr } from '../../helpers/utils';

export interface GroupOption {
    group: string;
    name: string;
}

export interface GroupElementProps extends FormElementProps {
    endpoint: string;
    groups?: SearchResult[];
    localGroups?: SearchResult[];
    add?: boolean;
    placeholder?: string;
    searchPromptText?: string | JSX.Element;
    onChange?: (groups: SearchResult[]) => void;
}

interface GroupElementState {
    groups: SearchResult[];
    errors: string[];
}

export const isValidNewOption = ({ label }: { label: string } = { label: '' }): boolean => {
    if (!label) {
        return false;
    }

    const lowered: string = label.toLowerCase();

    const isValid: boolean =
        lowered.length > 0 && lowered.length <= 36 && /^[a-z0-9-][a-z0-9- ]*$/.test(lowered);

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

export const NEW_GROUP_PROMPT: string = 'New group: ';
export const GROUP_TYPE: string = 'group';

export default class GroupElement extends React.Component<GroupElementProps, GroupElementState> {
    constructor(props: GroupElementProps) {
        super(props);

        const groups: SearchResult[] = this.getGroups();

        this.state = {
            groups,
            errors: []
        };

        this.onChange = this.onChange.bind(this);
    }

    private onChange(groups: SearchResult[]): void {
        this.setState(
            {
                groups
            },
            () => this.props.onChange && this.props.onChange(groups)
        );
    }

    private getGroups(): SearchResult[] {
        if (truthyArr(this.props.groups)) {
            return this.props.groups;
        } else if (truthyArr(this.props.localGroups)) {
            return this.props.localGroups;
        } else {
            return [];
        }
    }

    public validate(): boolean {
        const errors: string[] = [];

        if (this.props.required && this.state.groups.length < 1) {
            errors.push(`${this.props.name} is required`);
        }

        this.setState({ errors });

        const valid: boolean = errors.length === 0;

        return valid;
    }

    public render(): JSX.Element {
        const createOptions: any = {};

        if (this.props.add) {
            createOptions.isValidNewOption = isValidNewOption;
            createOptions.createNewOption = createNewOption;
            createOptions.createPrompt = NEW_GROUP_PROMPT;
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
