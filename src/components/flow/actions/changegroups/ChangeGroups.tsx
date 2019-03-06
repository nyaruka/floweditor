import * as React from 'react';
import { renderAssetList } from '~/components/flow/actions/helpers';
import { Types } from '~/config/interfaces';
import { ChangeGroups } from '~/flowTypes';
import { AssetType } from '~/store/flowContext';

export const removeAllSpecId = 'remove_from_all';
export const contentSpecId = 'content';
export const removeAllText = 'Remove from all groups';
export const ellipsesText = '...';

export const MAX_TO_SHOW = 3;
export const getRemoveAllMarkup = (
    key = removeAllSpecId,
    specId = removeAllSpecId,
    text = removeAllText
) => (
    <div key={key} data-spec={specId}>
        {text}
    </div>
);

export const getContentMarkup = ({ type, groups }: ChangeGroups): JSX.Element[] => {
    const content = [];

    if (type === Types.remove_contact_groups && (!groups || !groups.length)) {
        content.push(getRemoveAllMarkup());
    } else {
        return renderAssetList(
            groups.map(group => {
                return { id: group.uuid, name: group.name, type: AssetType.Group };
            }),
            MAX_TO_SHOW
        );
    }

    return content;
};

export const getChangeGroupsMarkup = (action: ChangeGroups, specId = contentSpecId) => (
    <div data-spec={specId}>{getContentMarkup(action)}</div>
);

const ChangeGroupsComp: React.SFC<ChangeGroups> = (props): JSX.Element =>
    getChangeGroupsMarkup(props);

export default ChangeGroupsComp;
