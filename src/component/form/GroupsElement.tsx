import * as isEqual from 'fast-deep-equal';
import * as React from 'react';
import { v4 as generateUUID } from 'uuid';

import { ResultType } from '../../flowTypes';
import { Asset, Assets, AssetType } from '../../services/AssetService';
import {
    composeCreateNewOption,
    getSelectClassForEntry,
    isOptionUnique,
    isValidNewOption
} from '../../utils';
import SelectSearch from '../SelectSearch/SelectSearch';
import FormElement, { FormElementProps } from './FormElement';

export interface GroupOption {
    group: string;
    name: string;
}

export interface GroupsElementProps extends FormElementProps {
    assets: Assets;
    add?: boolean;
    groups?: Asset[];
    placeholder?: string;
    searchPromptText?: string | JSX.Element;
    onChange: (groups: Asset[]) => void;
    helpText?: string;
}

export const createNewOption = composeCreateNewOption({
    idCb: () => generateUUID(),
    type: AssetType.Group
});

export const GROUP_PROMPT = 'New group: ';
export const GROUP_PLACEHOLDER = 'Enter the name of an existing group...';
export const GROUP_NOT_FOUND = 'Invalid group';

export default class GroupsElement extends React.Component<GroupsElementProps> {
    public static defaultProps = {
        placeholder: GROUP_PLACEHOLDER,
        searchPromptText: GROUP_NOT_FOUND
    };

    constructor(props: GroupsElementProps) {
        super(props);

        this.state = {
            groups: this.props.groups || []
        };

        this.handleChange = this.handleChange.bind(this);
    }

    public componentWillReceiveProps(nextProps: GroupsElementProps): void {
        if (
            nextProps.groups &&
            nextProps.groups.length &&
            !isEqual(nextProps.groups, this.props.groups)
        ) {
            this.setState({ groups: nextProps.groups });
        }
    }

    private handleChange(groups: Asset[]): void {
        this.props.onChange(groups);
    }

    public render(): JSX.Element {
        const createOptions: any = {};

        if (this.props.add) {
            createOptions.isValidNewOption = isValidNewOption;
            createOptions.isOptionUnique = isOptionUnique;
            createOptions.createNewOption = createNewOption;
            createOptions.createPrompt = GROUP_PROMPT;
        }

        return (
            <FormElement name={this.props.name} entry={this.props.entry}>
                <SelectSearch
                    __className={getSelectClassForEntry(this.props.entry)}
                    onChange={this.handleChange}
                    name={this.props.name}
                    resultType={ResultType.group}
                    assets={this.props.assets}
                    multi={true}
                    initial={this.props.entry ? this.props.entry.value : []}
                    placeholder={this.props.placeholder}
                    searchPromptText={this.props.searchPromptText}
                    {...createOptions}
                />
            </FormElement>
        );
    }
}
