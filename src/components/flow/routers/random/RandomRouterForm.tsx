import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { hasErrors } from 'components/flow/actions/helpers';
import { RouterFormProps } from 'components/flow/props';
import { createResultNameInput } from 'components/flow/routers/widgets';
import SelectElement, { SelectOption } from 'components/form/select/SelectElement';
import TextInputElement from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import { Category } from 'flowTypes';
import * as React from 'react';
import { FormState, mergeForm, SelectOptionEntry, StringEntry } from 'store/nodeEditor';
import { Alphanumeric, StartIsNonNumeric, validate } from 'store/validators';
import { small } from 'utils/reactselect';

import { BUCKET_OPTIONS, fillOutCategories, nodeToState, stateToNode } from './helpers';
import styles from './RandomRouterForm.module.scss';
import i18n from 'config/i18n';

// TODO: Remove use of Function
// tslint:disable:ban-types
export enum InputToFocus {
  args = 'args',
  min = 'min',
  max = 'max',
  exit = 'exit'
}

export interface RandomRouterFormState extends FormState {
  bucketChoice: SelectOptionEntry;
  resultName: StringEntry;
  categories: Category[];
}

export const leadInSpecId = 'lead-in';

export default class RandomRouterForm extends React.Component<
  RouterFormProps,
  RandomRouterFormState
> {
  constructor(props: RouterFormProps) {
    super(props);

    this.state = nodeToState(this.props.nodeSettings);

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  public static contextTypes = {
    assetService: fakePropType
  };

  private handleUpdateResultName(value: string): void {
    const resultName = validate('Result Name', value, [Alphanumeric, StartIsNonNumeric]);
    this.setState({
      resultName,
      valid: this.state.valid && !hasErrors(resultName)
    });
  }

  private handleBucketsChanged(selected: SelectOption): boolean {
    // create new exits if needed

    const count = parseInt(selected.value, 10);

    let categories = this.state.categories.concat([]);

    // prune off if we have too many
    categories = categories.slice(0, count);

    // add any that we still need
    categories = fillOutCategories(categories, count);

    const updates: Partial<RandomRouterFormState> = {
      bucketChoice: { value: selected }
    };

    const updated = mergeForm(this.state, updates);
    this.setState({ ...updated, categories });

    return updated.valid;
  }

  public handleSave(): void {
    this.props.updateRouter(stateToNode(this.props.nodeSettings, this.state));
    this.props.onClose(false);
  }

  private getButtons(): ButtonSet {
    return {
      primary: { name: i18n.t('buttons.ok', 'Ok'), onClick: this.handleSave },
      secondary: {
        name: i18n.t('buttons.cancel', 'Cancel'),
        onClick: () => this.props.onClose(true)
      }
    };
  }

  private handleBucketNameChanged(category: Category, value: string): void {
    const categories = this.state.categories;
    categories.find((cat: Category) => cat.uuid === category.uuid).name = value;
    this.setState({ categories });
  }

  private renderBucketNames(): any {
    return this.state.categories.map((cat: Category) => (
      <TextInputElement
        key={cat.uuid}
        __className={styles.bucket_name}
        name={cat.uuid}
        entry={{ value: cat.name }}
        onChange={(value: string) => {
          this.handleBucketNameChanged(cat, value);
        }}
      />
    ));
  }

  public renderEdit(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    const OPTIONS = BUCKET_OPTIONS.concat([]);
    if (BUCKET_OPTIONS.indexOf(this.state.bucketChoice.value) === -1) {
      OPTIONS.push(this.state.bucketChoice.value);
    }

    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <div className={styles.lead_in}>Split them randomly into one of</div>
        <div className={styles.bucket_select}>
          <SelectElement
            styles={small as any}
            name="Buckets"
            entry={this.state.bucketChoice}
            onChange={this.handleBucketsChanged}
            options={OPTIONS}
          />
        </div>
        <div className={styles.bucket_list}>{this.renderBucketNames()}</div>
        {createResultNameInput(this.state.resultName, this.handleUpdateResultName)}
      </Dialog>
    );
  }

  public render(): JSX.Element {
    return this.renderEdit();
  }
}
