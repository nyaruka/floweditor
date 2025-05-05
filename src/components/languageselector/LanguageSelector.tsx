import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

import styles from './LanguageSelector.module.scss';
import { store } from 'store';
import { TembaAppState, Language, Workspace } from 'temba-components';

export interface LanguageSelectorProps {}
export interface LanguageSelectorState {
  languageCode: string;
  workspace: Workspace;
  languageNames: { [key: string]: string };
}

export const containerClasses = 'language-selector';

export class LanguageSelector extends React.Component<
  LanguageSelectorProps,
  LanguageSelectorState
> {
  private unsubscribe: () => void;
  constructor(props: LanguageSelectorProps, state: LanguageSelectorState) {
    super(props);

    const appState = store.getState();
    this.mapState(appState);

    // subscribe for changes
    this.unsubscribe = store
      .getApp()
      .subscribe((state: TembaAppState, prevState: TembaAppState) => {
        this.mapState(state);
      });

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public mapState(state: TembaAppState): void {
    const changes = {
      languageCode: state.languageCode,
      workspace: state.workspace,
      languageNames: state.languageNames
    };
    if (this.state) {
      this.setState(changes);
    } else {
      // eslint-disable-next-line
      this.state = changes;
    }
  }

  public componentWillUnmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  public handleLanguageChanged(code: string): void {
    store.getState().setLanguageCode(code);
  }

  public handleLanguageSort(a: Language, b: Language): number {
    if (a.code === 'base') {
      return -1;
    }

    if (b.code === 'base') {
      return 1;
    }
    return a.name.localeCompare(b.name);
  }

  public render(): JSX.Element {
    if (!this.state) {
      return null;
    }

    if (
      !this.state.languageNames ||
      !this.state.workspace ||
      this.state.workspace.languages.length === 0
    ) {
      return null;
    }

    const languages = this.state.workspace.languages
      .map((code: string) => {
        if (!this.state.languageNames[code]) {
          return null;
        }
        return {
          code,
          name: this.state.languageNames[code]
        };
      })
      .sort(this.handleLanguageSort);

    if (languages.length === 1) {
      return null;
    }

    return (
      <div className={containerClasses}>
        <div style={{ position: 'fixed', right: '2em', marginTop: '2em', zIndex: 1 }}>
          {languages.map((lang: Language, idx: number) => {
            return (
              <div key={'lang_' + lang.code} className={styles.language}>
                {idx > 0 ? <div className={styles.separator}>|</div> : null}
                <div
                  className={
                    styles.language_link +
                    ' ' +
                    (this.state.languageCode === lang.code ? styles.active : '')
                  }
                  onClick={() => {
                    this.handleLanguageChanged(lang.code);
                  }}
                >
                  {lang.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
