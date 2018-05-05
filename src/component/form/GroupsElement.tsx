import * as React from 'react';
import { v4 as generateUUID } from 'uuid';

import { ResultType } from '../../flowTypes';
import { Asset, Assets, AssetType } from '../../services/AssetService';
import { composeCreateNewOption, getSelectClass, isValidNewOption, jsonEqual } from '../../utils';
import SelectSearch from '../SelectSearch';
import FormElement, { FormElementProps } from './FormElement';

export interface GroupOption {
    group: string;
    name: string;
}

export interface GroupsElementProps extends FormElementProps {
    add?: boolean;
    groups?: Asset[];
    placeholder?: string;
    searchPromptText?: string | JSX.Element;
    onChange?: (groups: Asset[]) => void;
    helpText?: string;
    assets: Assets;
}

interface GroupsElementState {
    groups: Asset[];
    errors: string[];
}

export const createNewOption = composeCreateNewOption({
    idCb: () => generateUUID(),
    type: AssetType.Group
});

export const GROUP_PROMPT = 'New group: ';
export const GROUP_PLACEHOLDER = 'Enter the name of an existing group...';
export const GROUP_NOT_FOUND = 'Invalid group';

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

    private onChange(groups: Asset[]): void {
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

        return (
            <FormElement name={this.props.name} errors={this.state.errors}>
                <SelectSearch
                    __className={getSelectClass(this.state.errors.length)}
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
