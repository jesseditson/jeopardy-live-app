import React, {Component} from "react";
import quip from "quip-apps-api";
import { CSSTransition } from 'react-transition-group';

interface ModalProps {
    title: string;
    showing: boolean;
    onClose: () => void
}

interface ModalState {
}

export default class Modal extends Component<ModalProps, ModalState> {

    private node = React.createRef<HTMLDivElement>()

    constructor(props: ModalProps) {
        super(props);
        this.state = {};
    }

    private onEnter = (node: HTMLDivElement) => {
        quip.apps.addDetachedNode(node)
    }
    private onExit = (node: HTMLDivElement) => {
        quip.apps.removeDetachedNode(node)
    }

    render() {
        const {title, onClose, showing} = this.props
        return <div className="modal">
            <CSSTransition
                in={showing}
                appear={true}
                timeout={300}
                classNames="modal"
                onEnter={this.onEnter}
                onExited={this.onExit}
            >
            <div className="content" ref={this.node}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <span onClick={onClose} className="close">close</span>
                </div>
                {this.props.children}
            </div>
            </CSSTransition>
        </div>
    }
}