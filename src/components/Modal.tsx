import * as React from "react";
var UUID  = require("node-uuid");

interface ModalProps {
    title: JSX.Element
    show: boolean
    className: string
    close: any
}

export class ModalComp extends React.Component<ModalProps, {}> {

    private ele: any

    constructor(props: ModalProps) {
        super(props);
    }

    componentDidUpdate(prevProps: ModalProps, prevState: any) {
        if (this.props.show && !prevProps.show) {
            $(this.ele).modal({
                complete: this.props.close,
                inDuration: 200,
                outDuration: 200,
                startingTop: '70%'
            }).modal('open');
        } else if (!this.props.show && prevProps.show) {
            $(this.ele).modal('close');
        }
    }

    render() {
        return !this.props.show ? <div/> : (
            <div ref={(ele: any) => {this.ele = ele;}} className={"modal " + this.props.className}>
                <div className="modal-header">
                    {this.props.title}
                </div>
                <div className="modal-content">
                    {this.props.children}
                </div>
                <div className="modal-footer">
                  <a href="#!" className=" modal-action modal-close waves-effect waves-green btn-flat">Agree</a>
                </div>
            </div>
        )
    }
}

export default ModalComp;