import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { Creatable as SelectCreatable } from 'react-select';

import { getSelectClass } from '../../../utils';
import FormElement, { FormElementProps } from '../FormElement';

export type TagList = Array<{ label: string; value: string }>;

export interface TaggingElementProps extends FormElementProps {
    placeholder?: string;
    prompt: string;
    onChange?: (values: string[]) => void;
    onValidPrompt: (value: string) => string;
    onCheckValid: (value: string) => boolean;
}

interface TagState {
    tags: TagList;
}

export const tagsToOptions = (tags: string[]): TagList =>
    tags.map(tag => ({ label: tag, value: tag }));

export const optionsToTags = (tags: TagList): string[] =>
    tags.map(tag => {
        return tag.label;
    });

export default class TaggingElement extends React.Component<TaggingElementProps, TagState> {
    constructor(props: any) {
        super(props);

        const tags = tagsToOptions(this.props.entry.value);

        this.state = {
            tags
        };

        bindCallbacks(this, {
            include: [/^handle/]
        });
    }

    public handleUpdateTags(tags: TagList): void {
        this.setState({
            tags
        });

        if (this.props.onChange) {
            this.props.onChange(optionsToTags(tags));
        }
    }

    public handleValidPrompt(value: string): string {
        return this.props.onValidPrompt(value);
    }

    public handleCheckValid({ label }: { label: string }): boolean {
        if (!label || label.trim().length === 0) {
            return false;
        }
        return this.props.onCheckValid(label);
    }

    private arrowRenderer(): JSX.Element {
        return <div />;
    }

    public render(): JSX.Element {
        const className: string = getSelectClass(
            (this.props.entry.validationFailures || []).length
        );

        return (
            <FormElement name={this.props.name} entry={this.props.entry}>
                <SelectCreatable
                    className={className}
                    name={this.props.name}
                    placeholder={this.props.placeholder}
                    value={this.state.tags}
                    onChange={this.handleUpdateTags}
                    multi={true}
                    searchable={true}
                    clearable={false}
                    noResultsText={this.props.prompt}
                    isValidNewOption={this.handleCheckValid}
                    promptTextCreator={this.handleValidPrompt}
                    arrowRenderer={this.arrowRenderer}
                    options={[]}
                />
            </FormElement>
        );
    }
}
