import * as React from 'react';
import { render, getByText, mock } from 'test/utils';
import { IssuesTab, IssuesTabProps } from './IssuesTab';
import { createUUID } from 'utils';
import { FlowIssueType, FlowIssue, DependencyType } from 'flowTypes';
import { RenderNode, RenderNodeMap } from 'store/flowContext';
import { Types } from 'config/interfaces';
import { createFlowIssueMap } from 'store/helpers';

const issuesProps: IssuesTabProps = {
  issues: {},
  nodes: {},
  languages: {},
  popped: null,

  // callbacks
  onToggled: jest.fn(),
  onIssueClicked: jest.fn(),
  onIssueOpened: jest.fn()
};

const createNodes = (issues: FlowIssue[]): RenderNodeMap => {
  const nodes: RenderNodeMap = {};
  issues.forEach((issue: FlowIssue) => {
    const actions = issue.action_uuid
      ? [
          {
            type: Types.send_msg,
            uuid: issue.action_uuid
          }
        ]
      : [];

    const node: RenderNode = {
      node: {
        uuid: issue.node_uuid,
        exits: [],
        actions
      },
      ui: {
        position: {
          top: 0,
          left: 0
        }
      },
      inboundConnections: {}
    };
    nodes[node.node.uuid] = node;
  });
  return nodes;
};

const createMissingDependency = (name: string, type: DependencyType): FlowIssue => {
  return {
    node_uuid: createUUID(),
    action_uuid: createUUID(),
    type: FlowIssueType.MISSING_DEPENDENCY,
    description: `missing dependency ${name} of type ${type}`,
    dependency: {
      name,
      key: name,
      type,
      nodes: {}
    }
  };
};

describe(IssuesTab.name, () => {
  it('renders', () => {
    const { baseElement, getByText } = render(<IssuesTab {...issuesProps} />);

    // should have an empty list
    getByText('Flow Issues (0)');
    expect(baseElement).toMatchSnapshot();
  });

  it('renders missing dependencies', () => {
    const issues = [
      createMissingDependency('My Missing Group', DependencyType.group),
      createMissingDependency('My Missing Field', DependencyType.field),
      createMissingDependency('My Missing Flow', DependencyType.flow)
    ];

    const { baseElement, getByText, getAllByText } = render(
      <IssuesTab
        {...issuesProps}
        issues={createFlowIssueMap({}, issues)}
        nodes={createNodes(issues)}
      />
    );

    expect(getAllByText('Send Message:').length).toBe(3);

    getByText('Flow Issues (3)');

    // group
    getByText('Cannot find a group for');
    getByText('My Missing Group');

    getByText('Cannot find a field for');
    getByText('My Missing Field');

    getByText('Cannot find a flow for');
    getByText('My Missing Flow');

    expect(baseElement).toMatchSnapshot();
  });
});
