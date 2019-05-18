import { Contact, Endpoints, Group, RecipientsAction } from 'flowTypes';
import * as React from 'react';
import { Asset, AssetType } from 'store/flowContext';
import { FormEntry, NodeEditorSettings, ValidationFailure } from 'store/nodeEditor';
import { createUUID } from 'utils';

const styles = require('components/shared.module.scss');

export const getActionUUID = (nodeSettings: NodeEditorSettings, currentType: string): string => {
    if (nodeSettings.originalAction && nodeSettings.originalAction.type === currentType) {
        return nodeSettings.originalAction.uuid;
    }

    return createUUID();
};

export const getRecipients = (action: RecipientsAction): Asset[] => {
    let selected = (action.groups || []).map((group: Group) => {
        return { id: group.uuid, name: group.name, type: AssetType.Group };
    });

    selected = selected.concat(
        (action.contacts || []).map((contact: Contact) => {
            return { id: contact.uuid, name: contact.name, type: AssetType.Contact };
        })
    );

    selected = selected.concat(
        (action.legacy_vars || []).map((expression: string) => {
            return { id: expression, name: expression, type: AssetType.Expression };
        })
    );

    return selected;
};

export const renderAssetList = (
    assets: Asset[],
    max: number = 10,
    endpoints: Endpoints
): JSX.Element[] => {
    return assets.reduce((elements, asset, idx) => {
        if (idx <= max - 1) {
            elements.push(renderAsset(asset, endpoints));
        } else if (idx > max - 1 && elements.length === max) {
            elements.push(<div key="ellipses">...</div>);
        }
        return elements;
    }, []);
};

export const renderAsset = (asset: Asset, endpoints: Endpoints) => {
    switch (asset.type) {
        case AssetType.Group:
            return (
                <div className={styles.node_asset} key={asset.id}>
                    <span className={`${styles.node_group} fe-group`} />
                    {asset.name}
                </div>
            );
        case AssetType.Label:
            return (
                <div className={styles.node_asset} key={asset.id}>
                    <span className={`${styles.node_label} fe-label`} />
                    {asset.name}
                </div>
            );
        case AssetType.Flow:
            return (
                <div className={styles.node_asset} key={asset.id}>
                    <span className={`${styles.node_label} fe-split`} />
                    <a
                        onMouseDown={(e: any) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onMouseUp={(e: any) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        href={`${endpoints.editor}/${asset.id}`}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        {asset.name}
                    </a>
                </div>
            );
    }

    return (
        <div className={styles.node_asset} key={asset.id}>
            {asset.name}
        </div>
    );
};

export const getAllErrors = (entry: FormEntry): ValidationFailure[] => {
    return (entry.validationFailures || []).concat(entry.persistantFailures || []);
};

export const hasErrors = (entry: FormEntry): boolean => {
    return getAllErrors(entry).length > 0;
};

export const getExpressions = (assets: Asset[]): any[] => {
    return assets
        .filter((asset: Asset) => asset.type === AssetType.Expression)
        .map((asset: Asset) => {
            return asset.id;
        });
};

export const getRecipientsByAsset = (assets: Asset[], type: AssetType): any[] => {
    return assets.filter((asset: Asset) => asset.type === type).map((asset: Asset) => {
        return { uuid: asset.id, name: asset.name };
    });
};
