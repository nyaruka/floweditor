import { react as bindCallbacks } from 'auto-bind';
import classNames from 'classnames/bind';
import React from 'react';
import styles from './TranslatorTab.module.scss';
import i18n from 'config/i18n';
import { PopTab } from 'components/poptab/PopTab';
import { AssetMap, Asset, RenderNodeMap } from 'store/flowContext';
import { PopTabType, Type } from 'config/interfaces';
import { Action, Category, Case } from 'flowTypes';
import { getTypeConfig } from 'config';
import {
  findTranslations,
  getMergedByType,
  TranslationState,
  getFriendlyAttribute,
  getBundleKey
} from './helpers';
import CheckboxElement from 'components/form/checkbox/CheckboxElement';
import { UpdateTranslationFilters } from 'store/thunks';
import { getSwitchRouter } from 'components/flow/routers/helpers';
import { getType } from 'config/typeConfigs';
import { fakePropType } from 'config/ConfigProvider';

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
  onTranslationClicked: (bundle: TranslationBundle) => void;
  onTranslationOpened: (bundle: TranslationBundle) => void;
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
  public static contextTypes = {
    config: fakePropType
  };

  constructor(props: TranslatorTabProps, context: any) {
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
    // traceUpdate(this, prevProps, prevState);
    if (
      prevProps.translationFilters !== this.props.translationFilters ||
      prevProps.localization !== this.props.localization ||
      prevProps.language !== this.props.language ||
      !prevState.visible ||
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

    const pctComplete = counts.total > 0 ? Math.round((counts.complete / counts.total) * 100) : 0;

    const bundles = translationBundles
      .filter((bundle: TranslationBundle) => bundle.translated < bundle.translations.length)
      .sort((a: TranslationBundle, b: TranslationBundle) => {
        return b.translations.length - b.translated - (a.translations.length - a.translated);
      });

    if (
      pctComplete !== this.state.pctComplete ||
      bundles.length !== this.state.translationBundles.length
    ) {
      this.setState({
        pctComplete,
        translationBundles: bundles
      });
    }
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

  private renderMissing(key: string, from: string, summary: string) {
    if (from) {
      return (
        <div key={this.props.language.id + key} className={styles.item}>
          <div className={styles.text + ' ' + styles.from_text}>{from}</div>
          <div className={styles.text + ' ' + styles.attribute}>{summary}</div>
        </div>
      );
    }
    return null;
  }

  private handleTranslationClicked(bundle: TranslationBundle) {
    this.props.onTranslationClicked(bundle);

    window.setTimeout(() => {
      this.props.onTranslationOpened(bundle);
    }, 750);
  }

  private handleChangeLanguageClick(e: any): void {
    this.context.config.onChangeLanguage(this.props.language.id, this.props.language.name);
    e.preventDefault();
    e.stopPropagation();
  }

  public render(): JSX.Element {
    // only show change button if container set up to handle it
    const showChangeButton = this.state.optionsVisible && this.context.config.onChangeLanguage;

    const classes = cx({
      [styles.visible]: this.state.visible,
      [styles.hidden]: this.props.popped && this.props.popped !== PopTabType.TRANSLATOR_TAB
    });

    const optionsClasses = cx({
      [styles.options]: true,
      [styles.options_visible]: this.state.optionsVisible,
      [styles.change_visible]: showChangeButton
    });

    const filledClasses = cx({
      [styles.filled]: true,
      [styles.hundredpct]: this.state.pctComplete === 100
    });

    const wrapperClasses = cx({
      [styles.translations_wrapper]: true,
      [styles.complete]: this.state.translationBundles.length === 0
    });

    return (
      <div className={classes}>
        <PopTab
          header={`${this.props.language.name} ${i18n.t('translation.label', 'Translations')}`}
          label={i18n.t('translation.header', 'Flow Translation')}
          color="#777"
          icon="fe-language"
          top="243px"
          visible={this.state.visible}
          onShow={this.handleTabClicked}
          onHide={this.handleTabClicked}
        >
          <div key={'translation_wrapper'} className={wrapperClasses}>
            {this.state.translationBundles.map((bundle: TranslationBundle) => {
              return (
                <div
                  key={this.props.language.id + getBundleKey(bundle)}
                  className={styles.translate_block}
                  onClick={() => {
                    this.handleTranslationClicked(bundle);
                  }}
                >
                  <div className={styles.needs_translation}>
                    <div className={styles.type_name}>{bundle.typeConfig.name}</div>
                    {this.renderMissing(
                      getBundleKey(bundle) + 'categories',
                      getMergedByType(bundle, TranslationState.MISSING, TranslationType.CATEGORY),
                      getFriendlyAttribute('categories')
                    )}

                    {this.renderMissing(
                      getBundleKey(bundle) + 'rules',

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
                          getBundleKey(bundle) + translation.from,
                          translation.from,
                          getFriendlyAttribute(translation.attribute)
                        )
                      )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={optionsClasses} onClick={this.toggleOptions}>
            <div className={styles.header}>
              <div className={styles.progress_bar}>
                <div
                  style={{ width: `${this.state.pctComplete}%` }}
                  className={filledClasses}
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
                    name={i18n.t('forms.categories', 'categories')}
                    checked={this.state.translationFilters.categories}
                    description={'Categories'}
                    checkboxClassName={styles.checkbox}
                    onChange={this.toggleCategories}
                  />
                </div>
                <div>
                  <CheckboxElement
                    name={i18n.t('forms.rules', 'rules')}
                    checked={this.state.translationFilters.rules}
                    description={'Rule Arguments'}
                    checkboxClassName={styles.checkbox}
                    onChange={this.toggleRules}
                  />
                </div>
              </div>
              <div className={styles.pct_complete}>{this.state.pctComplete}%</div>
            </div>
            <div className={styles.changeLanguage}>
              {showChangeButton && (
                <button onClick={this.handleChangeLanguageClick}>
                  {i18n.t('forms.use_as_default_language', 'Use as default language')}
                </button>
              )}
            </div>
          </div>
        </PopTab>
      </div>
    );
  }
}
