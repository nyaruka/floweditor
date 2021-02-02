import { renderAssetList } from 'components/flow/actions/helpers';
import { fakePropType } from 'config/ConfigProvider';
import { Types } from 'config/interfaces';
import { ChangeGroups, Endpoints } from 'flowTypes';
import * as React from 'react';
import { AssetType } from 'store/flowContext';

export const removeAllSpecId = 'remove_from_all';
export const contentSpecId = 'content';
export const removeAllText = 'Remove from all groups';

export const MAX_TO_SHOW = 5;
export const getRemoveAllMarkup = (
  key = removeAllSpecId,
  specId = removeAllSpecId,
  text = removeAllText
) => (
  <div key={key} data-spec={specId}>
    {text}
  </div>
);

export const getContentMarkup = (
  { type, groups }: ChangeGroups,
  endpoints?: Endpoints
): JSX.Element[] => {
  const content = [];

  if (type === Types.remove_contact_groups && (!groups || !groups.length)) {
    content.push(getRemoveAllMarkup());
  } else {
    return renderAssetList(
      groups.map(group => {
        if (group.name_match) {
          return {
            id: group.name_match,
            name: group.name_match,
            type: AssetType.NameMatch
          };
        }
        return {
          id: group.uuid,
          name: group.name,
          type: AssetType.Group
        };
      }),
      MAX_TO_SHOW,
      endpoints!
    );
  }

  return content;
};

export const getChangeGroupsMarkup = (
  action: ChangeGroups,
  endpoints?: Endpoints,
  specId = contentSpecId
) => <div data-spec={specId}>{getContentMarkup(action, endpoints)}</div>;

const ChangeGroupsComp: React.SFC<ChangeGroups> = (props: any, context: any): JSX.Element => {
  return getChangeGroupsMarkup(props, context.config.endpoints);
};

ChangeGroupsComp.contextTypes = {
  config: fakePropType
};

export default ChangeGroupsComp;
