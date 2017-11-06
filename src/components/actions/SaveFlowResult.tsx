// import * as React from 'react';
// import { ActionComp } from '../Action';
// import { ISaveFlowResult } from '../../flowTypes';
// import { TextInputElement } from '../form/TextInputElement';
// import NodeActionForm from '../NodeEditor/NodeActionForm';
// import Widget from '../NodeEditor/Widget';

// var styles = require('./SaveFlowResult.scss');

// export class SaveFlowResultComp extends ActionComp<ISaveFlowResult> {
//     renderNode(): JSX.Element {
//         var action = this.getAction();
//         if (action.value) {
//             return (
//                 <div>
//                     Save {action.value} as <span className="emph">{action.result_name}</span>
//                 </div>
//             );
//         } else {
//             return (
//                 <div>
//                     Clear value for <span className="emph">{action.result_name}</span>
//                 </div>
//             );
//         }
//     }
// }

// export class SaveFlowResultForm extends NodeActionForm<ISaveFlowResult> {
//     renderForm(ref: any) {
//         var action = this.getInitial();

//         var name = '';
//         var value = '';
//         var category = '';

//         if (action && action.value) {
//             name = action.result_name;
//             value = action.value;
//             category = action.category;
//         }

//         return (
//             <div className={styles.form}>
//                 <TextInputElement
//                     className={styles.name}
//                     ref={ref}
//                     name="Name"
//                     showLabel={true}
//                     value={name}
//                     required
//                     helpText="The name of the result, used to reference later, for example: @run.results.my_result_name"
//                     ComponentMap={this.props.ComponentMap}
//                 />
//                 <TextInputElement
//                     className={styles.value}
//                     ref={ref}
//                     name="Value"
//                     showLabel={true}
//                     value={value}
//                     autocomplete
//                     helpText="The value to save for this result or empty to clears it. You can use expressions, for example: @(title(input))"
//                     ComponentMap={this.props.ComponentMap}
//                 />
//                 <TextInputElement
//                     className={styles.category}
//                     ref={ref}
//                     name="Category"
//                     placeholder="Optional"
//                     showLabel={true}
//                     value={category}
//                     autocomplete
//                     helpText="An optional category for your result. For age, the value might be 17, but the category might be 'Young Adult'"
//                     ComponentMap={this.props.ComponentMap}
//                 />
//             </div>
//         );
//     }

//     onValid(widgets: { [name: string]: Widget }) {
//         var nameEle = widgets['Name'] as TextInputElement;
//         var valueEle = widgets['Value'] as TextInputElement;
//         var categoryEle = widgets['Category'] as TextInputElement;

//         var newAction: ISaveFlowResult = {
//             uuid: this.getActionUUID(),
//             type: this.props.config.type,
//             result_name: nameEle.state.value,
//             value: valueEle.state.value,
//             category: categoryEle.state.value
//         };

//         this.props.updateAction(newAction);
//     }
// }
