import { react as bindCallbacks } from 'auto-bind';
import FormElement, { FormElementProps } from 'components/form/FormElement';
import React from 'react';
import { StringArrayEntry } from 'store/nodeEditor';
import { getSelectClass } from 'utils';
import { tagging } from 'utils/reactselect';
import CreatableSelect from 'react-select/creatable';

export type TagList = Array<{ label: string; value: string }>;

export interface TaggingElementProps extends FormElementProps {
  placeholder?: string;
  prompt: string;
  createPrompt?: string;
  onChange?: (values: string[]) => void;
  onCheckValid: (value: string) => boolean;
}

export const tagsToOptions = (tags: StringArrayEntry): TagList => {
  return tags.value.map(tag => ({ label: tag, value: tag }));
};

export const optionsToTags = (tags: TagList): string[] =>
  tags.map(tag => {
    return tag.label;
  });

export default class TaggingElement extends React.Component<TaggingElementProps> {
  constructor(props: any) {
    super(props);
    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public handleUpdateTags(tags: TagList): void {
    if (this.props.onChange) {
      this.props.onChange(optionsToTags(tags));
    }
  }

  public handleCheckValid(label: string): boolean {
    if (!label || label.trim().length === 0) {
      return false;
    }
    return this.props.onCheckValid(label);
  }

  private arrowRenderer(): JSX.Element {
    return <div />;
  }

  public render(): JSX.Element {
    const className: string = getSelectClass((this.props.entry.validationFailures || []).length);

    const tags = tagsToOptions(this.props.entry);
    return (
      <FormElement name={this.props.name} entry={this.props.entry}>
        <CreatableSelect
          styles={tagging as any}
          className={className}
          name={this.props.name}
          placeholder={this.props.placeholder}
          value={tags}
          onChange={this.handleUpdateTags as any}
          isMulti={true}
          isSearchable={true}
          isValidNewOption={this.handleCheckValid}
          noOptionsMessage={() => this.props.prompt}
          formatCreateLabel={(input: string) => {
            return this.props.createPrompt !== undefined
              ? this.props.createPrompt + input
              : 'Create new ' + input;
          }}
          options={[]}
        />
      </FormElement>
    );
  }
}
