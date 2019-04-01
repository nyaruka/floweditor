import { react as bindCallbacks } from 'auto-bind';
import * as classNames from 'classnames/bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Counter from '~/components/counter/Counter';
import * as styles from '~/components/flow/exit/Exit.scss';
import { getExitActivityKey } from '~/components/flow/exit/helpers';
import { Category, Exit, FlowNode, LocalizationMap } from '~/flowTypes';
import { Asset } from '~/store/flowContext';
import AppState from '~/store/state';
import { DisconnectExit, disconnectExit, DispatchWithState } from '~/store/thunks';
import { createClickHandler, getLocalization } from '~/utils';

export interface ExitPassedProps {
    exit: Exit;
    categories: Category[];
    node: FlowNode;
    plumberMakeSource: (id: string) => void;
    plumberRemove: (id: string) => void;
    plumberConnectExit: (node: FlowNode, exit: Exit) => void;
    plumberUpdateClass: (
        node: FlowNode,
        exit: Exit,
        className: string,
        confirmDelete: boolean
    ) => void;
}

export interface ExitStoreProps {
    translating: boolean;
    dragging: boolean;
    language: Asset;
    localization: LocalizationMap;
    disconnectExit: DisconnectExit;
    segmentCount: number;
}

export type ExitProps = ExitPassedProps & ExitStoreProps;

export interface ExitState {
    confirmDelete: boolean;
}

const cx = classNames.bind(styles);

export class ExitComp extends React.PureComponent<ExitProps, ExitState> {
    private timeout: number;

    constructor(props: ExitProps) {
        super(props);

        this.state = {
            confirmDelete: false
        };

        bindCallbacks(this, {
            include: [/^on/, /^get/]
        });
    }

    public getSourceId(): string {
        return `${this.props.node.uuid}:${this.props.exit.uuid}`;
    }

    public componentDidMount(): void {
        this.props.plumberMakeSource(this.getSourceId());
        if (this.props.exit.destination_uuid) {
            this.connect();
        }
    }

    public componentDidUpdate(prevProps: ExitProps): void {
        if (
            !this.props.exit.destination_uuid ||
            this.props.exit.destination_uuid !== prevProps.exit.destination_uuid
        ) {
            this.connect();
            this.setState({ confirmDelete: false });
        }

        this.props.plumberUpdateClass(
            this.props.node,
            this.props.exit,
            'confirm-delete',
            this.state.confirmDelete
        );
    }

    public componentWillUnmount(): void {
        if (this.props.exit.destination_uuid) {
            this.props.plumberRemove(this.getSourceId());
        }
    }

    private onClick(event: React.MouseEvent<HTMLDivElement>): void {
        if (this.props.exit.destination_uuid && !this.props.translating) {
            this.setState(
                {
                    confirmDelete: true
                },
                () => {
                    this.timeout = window.setTimeout(() => {
                        this.setState({
                            confirmDelete: false
                        });
                    }, 2000);
                }
            );
        }
    }

    private onDisconnect(event: React.MouseEvent<HTMLDivElement>): void {
        if (this.timeout) {
            window.clearTimeout(this.timeout);
        }

        this.props.disconnectExit(this.props.node.uuid, this.props.exit.uuid);
    }

    private connect(): void {
        this.props.plumberConnectExit(this.props.node, this.props.exit);
    }

    private getActivity(): JSX.Element {
        // Only exits with a destination have activity
        if (this.props.exit.destination_uuid) {
            const key = `count:${this.props.exit.uuid}:${this.props.exit.destination_uuid}`;
            return (
                <Counter
                    key={key}
                    count={this.props.segmentCount}
                    containerStyle={styles.activity}
                    countStyle={styles.count}
                    keepVisible={false}
                />
            );
        }
        return null;
    }

    public getName(): { name: string; localized?: boolean } {
        if (this.props.translating) {
            let name: string = '';
            let delim: string = '';

            let localized: boolean = false;

            this.props.categories.forEach((category: Category) => {
                const localization = getLocalization(
                    category,
                    this.props.localization,
                    this.props.language
                );

                localized = localized || 'name' in localization.localizedKeys;
                const localizedObject = localization.getObject() as Category;
                name += delim + localizedObject.name;
                delim = ', ';
            });

            return { name, localized };
        } else {
            return {
                name: this.props.categories.map((category: Category) => category.name).join(', ')
            };
        }
    }

    public render(): JSX.Element {
        const { name, localized } = this.getName();

        const nameStyle = name ? styles.name : '';
        const connected = this.props.exit.destination_uuid ? ' jtk-connected' : '';
        const dragNodeClasses = cx(styles.endpoint, connected);
        const confirmDelete =
            this.state.confirmDelete && this.props.exit.hasOwnProperty('destination_uuid');
        const confirm: JSX.Element = confirmDelete ? (
            <div
                {...createClickHandler(this.onDisconnect, () => this.props.dragging)}
                className="fe-x"
            />
        ) : null;
        const exitClasses: string = cx({
            [styles.exit]: true,
            ['plumb-exit']: true,
            [styles.translating]: this.props.translating,
            [styles.unnamed_exit]: name == null,
            [styles.missing_localization]: name && this.props.translating && !localized,
            [styles.confirmDelete]: confirmDelete
        });
        const activity = this.getActivity();
        return (
            <div className={exitClasses}>
                <div className={nameStyle}>{name}</div>
                <div
                    {...createClickHandler(this.onClick, () => this.props.dragging)}
                    id={`${this.props.node.uuid}:${this.props.exit.uuid}`}
                    className={dragNodeClasses}
                >
                    {confirm}
                </div>
                {activity}
            </div>
        );
    }
}

const mapStateToProps = (
    {
        flowContext: {
            definition: { localization }
        },
        editorState: { translating, language, dragActive, activity }
    }: AppState,
    props: ExitPassedProps
) => {
    const segmentCount = activity.segments[getExitActivityKey(props.exit)] || 0;
    return {
        dragging: dragActive,
        segmentCount,
        translating,
        language,
        localization
    };
};

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators({ disconnectExit }, dispatch);

const ConnectedExit = connect(
    mapStateToProps,
    mapDispatchToProps
)(ExitComp);

export default ConnectedExit;
