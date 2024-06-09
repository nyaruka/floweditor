import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { RouterFormProps } from 'components/flow/props';
import TypeList from 'components/nodeeditor/TypeList';
import { FormEntry, FormState, mergeForm } from 'store/nodeEditor';
import i18n from 'config/i18n';
import TextInputElement, { TextInputStyle } from 'components/form/textinput/TextInputElement';
import styles from 'components/flow/routers/sheet/SheetForm.module.scss';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import { ACTION_OPTIONS, nodeToState, stateToNode } from './helpers';
import { LowerCaseAlphaNumeric, Required, StartIsNonNumeric, validate } from 'store/validators';
import { hasErrors } from 'components/flow/actions/helpers';
import { Trans } from 'react-i18next';
import { snakify } from 'utils';
import SelectElement, { SelectOption } from 'components/form/select/SelectElement';
import { SelectOptionEntry } from 'store/nodeEditor';
import mutate from 'immutability-helper';

export interface SheetFormState extends FormState {
  sheet: FormEntry;
  result_name: FormEntry;
  row: FormEntry;
  action_type: SelectOptionEntry;
  range: FormEntry;
  starting_cell: FormEntry;
  subsheet: FormEntry;
  row_data: FormEntry[];
}

const MAX_ATTACHMENTS = 30;

export const RenderData = ({
  index,
  rowData,
  onRowDataChanged,
  onRowDataRemoved
}: any): JSX.Element => {
  return (
    <div className={styles.url_attachment}>
      <div className={styles.row}>
        <TextInputElement
          placeholder="Row data"
          name={i18n.t('forms.row', 'row_data')}
          style={TextInputStyle.small}
          onBlur={(event: any) => {
            onRowDataChanged(index, event.target.value);
          }}
          entry={rowData}
          autocomplete={true}
        />
      </div>
    </div>
  );
};
const RenderRowData = ({ rowDataArray, onRowDataChanged, onRowDataRemoved }: any): JSX.Element => {
  const renderedAttachments = rowDataArray.map((rowData: any, index: number) => (
    <RenderData
      key={index}
      index={index}
      rowData={rowData}
      onRowDataChanged={onRowDataChanged}
      onRowDataRemoved={onRowDataRemoved}
    />
  ));

  const emptyOption =
    rowDataArray.length < MAX_ATTACHMENTS ? (
      <RenderData
        key={rowDataArray.length}
        index={rowDataArray.length}
        rowData={{ value: '' }}
        onRowDataChanged={onRowDataChanged}
        onRowDataRemoved={onRowDataRemoved}
      />
    ) : null;

  return (
    <>
      <p>Input data to update in sheet</p>
      <div className={styles.row_container}>
        {renderedAttachments}
        {emptyOption}
      </div>
    </>
  );
};

export default class SheetForm extends React.Component<RouterFormProps, SheetFormState> {
  constructor(props: RouterFormProps) {
    super(props);

    this.state = nodeToState(this.props.nodeSettings);

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  private validate() {
    if (this.state.action_type.value.value === 'READ') {
      const row = validate(i18n.t('forms.row', 'Select row'), this.state.row.value, [Required]);

      const result_name = validate(
        i18n.t('forms.sheet_result_name', 'Save row as'),
        this.state.result_name.value,
        [Required]
      );
      const sheet = validate(i18n.t('forms.sheet', 'Sheet'), this.state.sheet.value, [Required]);

      const updated = mergeForm(this.state, { row, result_name, sheet } as any);

      this.setState(updated);

      return updated.valid;
    }
    const sheet = validate(i18n.t('forms.sheet', 'Sheet'), this.state.sheet.value, [Required]);

    const updated = mergeForm(this.state, { sheet } as any);

    this.setState(updated);

    return updated.valid;
  }

  private handleSave(): void {
    let valid = this.validate();

    if (valid) {
      this.props.updateRouter(stateToNode(this.props.nodeSettings, this.state));
      this.props.onClose(false);
    }
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

  private handleActionUpdate(action: SelectOption): boolean {
    this.setState({
      action_type: { value: action },
      sheet: { value: { id: '', name: '', url: '' } }
    });
    return true;
  }

  private handleUpdateResultName(value: string): void {
    const result_name = validate(i18n.t('forms.result_name', 'Result Name'), value, [
      LowerCaseAlphaNumeric,
      StartIsNonNumeric
    ]);

    this.setState({
      result_name,
      valid: !hasErrors(result_name)
    });
  }

  private handleSheetChanged(value: any) {
    const sheetValue = value.length > 0 ? value[0] : { id: '', name: '', url: '' };

    this.setState({
      sheet: { value: sheetValue }
    });
  }

  private handleExcludeSheets(sheet: any) {
    const action = this.state.action_type.value.value;

    if (sheet.type === 'ALL' || action === sheet.type) {
      return false;
    } else if (!sheet.type) {
      return false;
    }
    return true;
  }

  private handleAttachmentChanged(index: number, value: string) {
    let rowData: any = this.state.row_data;

    rowData = mutate(rowData, {
      [index]: {
        $set: { value }
      }
    });

    this.setState({ row_data: rowData });
  }

  public renderEdit(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    const { result_name, sheet, row } = this.state;

    const snaked =
      !hasErrors(result_name) && result_name.value ? '.' + snakify(result_name.value) : '';
    console.log(sheet);

    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />

        <div className={styles.action}>
          <div className={styles.label}>Action</div>
          <SelectElement
            key="action_type"
            name="type"
            placeholder="Select type"
            entry={this.state.action_type}
            onChange={this.handleActionUpdate}
            options={ACTION_OPTIONS}
          />
        </div>
        <div className={styles.sheet_form}>
          {this.state.action_type.value.value === 'READ' && (
            <>
              <div className={styles.read_container}>
                <div className={styles.delay_container}>
                  <AssetSelector
                    name={i18n.t('forms.sheet', 'Sheet')}
                    placeholder={i18n.t('forms.select_sheet', 'Select sheet')}
                    assets={this.props.assetStore.sheets}
                    entry={sheet}
                    expressions={true}
                    searchable={true}
                    shouldExclude={this.handleExcludeSheets}
                    onChange={this.handleSheetChanged}
                  />
                </div>
                <div className={styles.row_field}>
                  <TextInputElement
                    showLabel={true}
                    name={i18n.t('forms.row', 'Select row')}
                    placeholder={i18n.t('forms.enter_profile_name', 'Enter value')}
                    onChange={value => {
                      this.setState({ row: { value } });
                    }}
                    entry={row}
                    helpText={
                      <Trans i18nKey="forms.row_name_help">
                        Select row based on the values in the first column of the sheet. You can
                        either use a static value or a variable from the first column.
                      </Trans>
                    }
                    autocomplete={true}
                    focus={true}
                  />
                </div>
              </div>
              <TextInputElement
                showLabel={true}
                maxLength={64}
                name={i18n.t('forms.sheet_result_name', 'Save row as')}
                onChange={this.handleUpdateResultName}
                entry={result_name}
                helpText={
                  <Trans
                    i18nKey="forms.sheet_result_help"
                    values={{
                      resultFormat: `@results${snaked}`,
                      columnFormat: `@results${snaked}.column_title`
                    }}
                  >
                    You can reference this row as [[resultFormat]] and a specific column can be
                    referenced as [[columnFormat]]
                  </Trans>
                }
              />
            </>
          )}

          {this.state.action_type.value.value === 'WRITE' && (
            <>
              <div className={styles.read_container}>
                <div className={styles.delay_container}>
                  <AssetSelector
                    name={i18n.t('forms.sheet', 'Sheet')}
                    placeholder={i18n.t('forms.select_sheet', 'Select sheet')}
                    assets={this.props.assetStore.sheets}
                    entry={sheet}
                    searchable={true}
                    shouldExclude={this.handleExcludeSheets}
                    onChange={this.handleSheetChanged}
                  />
                </div>
                <div className={styles.row_field}>
                  <TextInputElement
                    showLabel={true}
                    name={i18n.t('forms.subsheet', 'Select Subsheet')}
                    placeholder={i18n.t('forms.enter_sheet_subsheet', 'Sheet1')}
                    onChange={value => {
                      this.setState({ subsheet: { value } });
                    }}
                    entry={this.state.subsheet}
                    autocomplete={true}
                    focus={true}
                  />
                </div>
                <div className={styles.row_field}>
                  <TextInputElement
                    showLabel={true}
                    name={i18n.t('forms.starting_cell', 'Enter the starting cell')}
                    placeholder={i18n.t('forms.enter_sheet_cell', 'A1')}
                    onChange={value => {
                      this.setState({ starting_cell: { value } });
                    }}
                    entry={this.state.starting_cell}
                    helpText={
                      <span>
                        Know more about sheet ranges{' '}
                        <a
                          href="https://spreadsheet.dev/range-in-google-sheets"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          here
                        </a>
                      </span>
                    }
                    autocomplete={true}
                    focus={true}
                  />
                </div>
                <RenderRowData
                  rowDataArray={this.state.row_data}
                  onRowDataChanged={this.handleAttachmentChanged}
                  onRowDataRemoved={() => {}}
                />
              </div>
            </>
          )}
        </div>
      </Dialog>
    );
  }

  public render(): JSX.Element {
    return this.renderEdit();
  }
}
