import * as React from 'react';
import FormElement, { FormElementProps } from '~/components/form/FormElement';
import SelectSearch from '~/components/form/select/SelectSearch';
import { Asset, Assets } from '~/services/AssetService';
import { getSelectClassForEntry } from '~/utils';

export interface GroupOption {
    group: string;
    name: string;
}

export interface GroupsElementProps extends FormElementProps {
    assets: Assets;
    add?: boolean;
    placeholder?: string;
    searchPromptText?: string | JSX.Element;
    onChange: (groups: Asset[]) => void;
    helpText?: string;
}

/* export const createNewOption = composeCreateNewOption({
    idCb: () => createUUID(),
    type: AssetType.Group
});*/

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
        this.handleChange = this.handleChange.bind(this);
    }

    private handleChange(groups: Asset[]): void {
        this.props.onChange(groups);
    }

    public render(): JSX.Element {
        const createOptions: any = {};

        if (this.props.add) {
            createOptions.createPrompt = GROUP_PROMPT;
        }

        return (
            <FormElement name={this.props.name} entry={this.props.entry}>
                <SelectSearch
                    __className={getSelectClassForEntry(this.props.entry)}
                    onChange={this.handleChange}
                    name={this.props.name}
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
