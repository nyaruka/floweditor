import { react as bindCallbacks } from 'auto-bind';
import classNames from 'classnames/bind';
import React from 'react';
import styles from './TranslatorTab.module.scss';
import i18n from 'config/i18n';
import { PopTab } from 'components/poptab/PopTab';
import { AssetMap, Asset, RenderNodeMap } from 'store/flowContext';
import { PopTabType, Type } from 'config/interfaces';
import { traceUpdate } from 'utils';
import { Action, Category, Case } from 'flowTypes';
import { getTypeConfig } from 'config';
import {
  findTranslations,
  getMergedByType,
  TranslationState,
  getFriendlyAttribute
} from './helpers';
import CheckboxElement from 'components/form/checkbox/CheckboxElement';
import { UpdateTranslationFilters } from 'store/thunks';
import { getSwitchRouter } from 'components/flow/routers/helpers';
import { getType } from 'config/typeConfigs';

const cx: any = classNames.bind(styles);

export enum TranslationType {
  PROPERTY = 'property',
  CATEGORY = 'category',
  CASE = 'case'
}

export interface TranslationBundle {
  node_uuid: string;
  action_uuid?: string;
  translations: Translation[];
  translated: number;
  typeConfig: Type;
}

export interface Translation {
  type: TranslationType;
  attribute: string;
  from: string;
  to: string;
}

export interface TranslatorTabProps {
  localization: { [uuid: string]: any };
  language: Asset;
  languages: AssetMap;

  translationFilters: { categories: boolean; rules: boolean };

  nodes: RenderNodeMap;
  onToggled: (visible: boolean, tab: PopTabType) => void;
  onTranslationClicked: (translation: Translation) => void;
  onTranslationOpened: (translation: Translation) => void;
  onTranslationFilterChanged: UpdateTranslationFilters;
  popped: string;
}

export interface TranslatorTabState {
  visible: boolean;
  selectedTranslation: Translation;
  translationBundles: TranslationBundle[];
  optionsVisible: boolean;
  pctComplete: number;
  translationFilters: { categories: boolean; rules: boolean };
}

export class TranslatorTab extends React.Component<TranslatorTabProps, TranslatorTabState> {
  constructor(props: TranslatorTabProps) {
    super(props);

    this.state = {
      visible: false,
      selectedTranslation: null,
      translationBundles: [],
      optionsVisible: false,
      pctComplete: 0,
      translationFilters: props.translationFilters || { categories: true, rules: true }
    };

    bindCallbacks(this, {
      include: [/^handle/, /^render/, /^toggle/]
    });
  }

  public componentWillUnmount(): void {
    if (this.state.visible) {
      this.handleTabClicked();
    }
  }

  public componentDidUpdate(prevProps: TranslatorTabProps, prevState: TranslatorTabState): void {
    traceUpdate(this, prevProps, prevState);
    if (
      prevProps.translationFilters !== this.props.translationFilters ||
      prevProps.localization !== this.props.localization ||
      (!prevState.visible && this.state.translationBundles.length === 0) ||
      prevState.translationFilters !== this.state.translationFilters
    ) {
      this.handleUpdateTranslations();
    }
  }

  private handleUpdateTranslations(): void {
    const translationBundles: TranslationBundle[] = [];
    Object.keys(this.props.nodes).forEach((node_uuid: string) => {
      const renderNode = this.props.nodes[node_uuid];

      // check for router level translations
      if (
        renderNode.node.router &&
        (this.state.translationFilters.categories || this.state.translationFilters.rules)
      ) {
        const typeConfig = getTypeConfig(getType(renderNode));

        let translations: Translation[] = [];
        if (this.state.translationFilters.categories) {
          const localizeableKeys = ['name'];
          renderNode.node.router.categories.forEach((category: Category) => {
            translations.push(
              ...findTranslations(
                TranslationType.CATEGORY,
                localizeableKeys,
                category,
                this.props.localization
              )
            );
          });
        }

        if (this.state.translationFilters.rules) {
          const localizeableKeys = ['arguments'];
          const switchRouter = getSwitchRouter(renderNode.node);
          if (switchRouter) {
            switchRouter.cases.forEach((kase: Case) => {
              translations.push(
                ...findTranslations(
                  TranslationType.CASE,
                  localizeableKeys,
                  kase,
                  this.props.localization
                )
              );
            });
          }
        }

        if (translations.length > 0) {
          translationBundles.push({
            typeConfig,
            node_uuid,
            translations,
            translated: translations.filter((translation: Translation) => !!translation.to).length
          });
        }
      } else {
        // find attributes from each action
        renderNode.node.actions.forEach((action: Action) => {
          const typeConfig = getTypeConfig(action.type);
          const translations = findTranslations(
            TranslationType.PROPERTY,
            typeConfig.localizeableKeys || [],
            action,
            this.props.localization
          );

          if (translations.length > 0) {
            translationBundles.push({
              typeConfig,
              node_uuid,
              action_uuid: action.uuid,
              translations,
              translated: translations.filter((translation: Translation) => !!translation.to).length
            });
          }
        });
      }
    });

    const counts = { total: 0, complete: 0 };
    translationBundles.reduce((counts, bundle) => {
      counts.total += bundle.translations.length;
      counts.complete += bundle.translated;
      return counts;
    }, counts);

    const pctComplete = Math.round((counts.complete / counts.total) * 100);

    this.setState({
      pctComplete,
      translationBundles: translationBundles.sort((a: TranslationBundle, b: TranslationBundle) => {
        return b.translations.length - b.translated - (a.translations.length - a.translated);
      })
    });
  }

  public handleTabClicked(): void {
    this.props.onToggled(!this.state.visible, PopTabType.TRANSLATOR_TAB);
    this.setState((prevState: TranslatorTabState) => {
      return { visible: !prevState.visible };
    });
  }

  public toggleOptions(): void {
    this.setState({ optionsVisible: !this.state.optionsVisible });
  }

  private toggleCategories(categories: boolean): void {
    this.setState(
      { translationFilters: { categories, rules: this.state.translationFilters.rules } },
      () => {
        this.props.onTranslationFilterChanged(this.state.translationFilters);
      }
    );
  }
  private toggleRules(rules: boolean): void {
    this.setState(
      { translationFilters: { rules, categories: this.state.translationFilters.categories } },
      () => {
        this.props.onTranslationFilterChanged(this.state.translationFilters);
      }
    );
  }

  private renderMissing(from: string, summary: string) {
    if (from) {
      return (
        <div className={styles.item}>
          <div className={styles.text + ' ' + styles.from_text}>{from}</div>
          <div className={styles.text + ' ' + styles.attribute}>{summary}</div>
        </div>
      );
    }
    return null;
  }

  private renderTranslationType(
    bundle: TranslationBundle,
    state: TranslationState,
    type: TranslationType
  ): JSX.Element {
    const merged = getMergedByType(bundle, state, type);
    if (merged) {
      return this.renderMissing(merged, type);
    }
    return null;
  }

  public render(): JSX.Element {
    const classes = cx({
      [styles.visible]: this.state.visible,
      [styles.hidden]: this.props.popped && this.props.popped !== PopTabType.TRANSLATOR_TAB
    });

    const optionsClasses = cx({
      [styles.options]: true,
      [styles.options_visible]: this.state.optionsVisible
    });

    return (
      <div className={classes}>
        <div className={styles.mask} />
        <PopTab
          header={`${this.props.language.name} ${i18n.t('translation.label', 'Translations')}`}
          label={i18n.t('translation.header', 'Flow Translation')}
          color="#777"
          icon="fe-earth"
          top="243px"
          visible={this.state.visible}
          onShow={this.handleTabClicked}
          onHide={this.handleTabClicked}
        >
          <div className={styles.translations_wrapper}>
            {this.state.translationBundles.map((bundle: TranslationBundle) => {
              return (
                <div className={styles.translate_block}>
                  {bundle.translated !== bundle.translations.length ? (
                    <div className={styles.needs_translation}>
                      <div className={styles.type_name}>{bundle.typeConfig.name}</div>
                      {this.renderMissing(
                        getMergedByType(bundle, TranslationState.MISSING, TranslationType.CATEGORY),
                        getFriendlyAttribute('categories')
                      )}
                      {this.renderMissing(
                        getMergedByType(bundle, TranslationState.MISSING, TranslationType.CASE),
                        getFriendlyAttribute('cases')
                      )}
                      {bundle.translations
                        .filter(
                          translation =>
                            !translation.to && translation.type === TranslationType.PROPERTY
                        )
                        .map(translation =>
                          this.renderMissing(
                            translation.from,
                            getFriendlyAttribute(translation.attribute)
                          )
                        )}
                    </div>
                  ) : (
                    <div className={styles.translated}>
                      <div className={styles.check}>
                        <span className="fe-check"></span>
                      </div>
                      <div>
                        {bundle.translations.map(translation => (
                          <>
                            <div className={styles.text + ' ' + styles.to_text}>
                              {translation.to}
                            </div>
                            <div className={styles.text + ' ' + styles.from_text}>
                              {translation.from}
                            </div>
                          </>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className={optionsClasses} onClick={this.toggleOptions}>
            <div className={styles.header}>
              <div className={styles.progress_bar}>
                <div
                  style={{ width: `${this.state.pctComplete}%` }}
                  className={styles.filled}
                ></div>
              </div>
              <div className={styles.toggle}>
                <span className="fe-arrow-up"></span>
              </div>
            </div>
            <div className={styles.filters}>
              <div className={styles.checkboxes}>
                <div>
                  <CheckboxElement
                    name="categories"
                    checked={this.state.translationFilters.categories}
                    description={'Categories'}
                    checkboxClassName={styles.checkbox}
                    onChange={this.toggleCategories}
                  />
                </div>
                <div>
                  <CheckboxElement
                    name="rules"
                    checked={this.state.translationFilters.rules}
                    description={'Rule Arguments'}
                    checkboxClassName={styles.checkbox}
                    onChange={this.toggleRules}
                  />
                </div>
              </div>
              <div className={styles.pct_complete}>{this.state.pctComplete}%</div>
            </div>
          </div>
        </PopTab>
      </div>
    );
  }
}
