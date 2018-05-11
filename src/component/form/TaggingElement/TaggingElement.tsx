import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { Creatable as SelectCreatable } from 'react-select';

import { getSelectClass } from '../../../utils';
import FormElement, { FormElementProps } from '../FormElement';

export type TagList = Array<{ label: string; value: string }>;

export interface TaggingElementProps extends FormElementProps {
    tags: string[];
    placeholder?: string;
    prompt: string;
    onValidPrompt: (value: string) => string;
    onCheckValid: (value: string) => boolean;
}

interface TagState {
    tags: TagList;
    errors: string[];
}

export const tagsToOptions = (tags: string[]): TagList =>
    tags.map(tag => ({ label: tag, value: tag }));

export default class TaggingElement extends React.Component<TaggingElementProps, TagState> {
    constructor(props: any) {
        super(props);

        const tags = tagsToOptions(this.props.tags);

        this.state = {
            tags,
            errors: []
        };

        bindCallbacks(this, {
            include: [/^handle/]
        });
    }

    public validate(): boolean {
        const errors: string[] = [];

        if (this.props.required) {
            if (this.state.tags.length === 0) {
                errors.push(`${this.props.name} is required`);
            }
        }

        this.setState({ errors });

        return errors.length === 0;
    }

    public handleUpdateTags(tags: TagList): void {
        this.setState({
            tags
        });
    }

    public handleValidPrompt(value: string): string {
        return this.props.onValidPrompt(value);
    }

    public handleCheckValid({ label }: { label: string }): boolean {
        return this.props.onCheckValid(label);
    }

    private arrowRenderer(): JSX.Element {
        return <div />;
    }

    public render(): JSX.Element {
        const className: string = getSelectClass(this.state.errors.length);

        return (
            <FormElement
                name={this.props.name}
                required={this.props.required}
                errors={this.state.errors}
            >
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
