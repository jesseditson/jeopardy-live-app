import React, { Component } from "react";
import { create, SimpleDrawingBoard } from "simple-drawing-board";
import quip from "quip-apps-api";

interface DrawNameProps {
  currentImageURI?: string;
  onSave: (imageURI: string) => void;
}

interface DrawNameState {}

export default class DrawName extends Component<DrawNameProps, DrawNameState> {
  constructor(props: DrawNameProps) {
    super(props);
    this.state = {};
  }
  private canvas = React.createRef<HTMLCanvasElement>();
  private drawingBoard: SimpleDrawingBoard | undefined;

  private saveDrawing = () => {
    const { onSave } = this.props;
    if (this.drawingBoard) {
      onSave(this.drawingBoard.toDataURL());
    }
  };

  private currentCanvas: HTMLCanvasElement | undefined

  componentDidUpdate() {
    const { currentImageURI } = this.props;
    const newCanvas = !this.currentCanvas || this.canvas.current !== this.currentCanvas
    if (newCanvas && this.canvas.current) {
      if (!this.drawingBoard) {
        this.drawingBoard = create(this.canvas.current);
        this.drawingBoard.setLineColor("#fff");
        this.drawingBoard.setLineSize(4);
        this.drawingBoard.observer.on("drawEnd", this.saveDrawing);
      }
      if (currentImageURI) {
        this.drawingBoard.fillImageByDataURL(currentImageURI);
      }
    }
  }

  componentWillUnmount() {
    this.drawingBoard?.observer.off("drawEnd", this.saveDrawing);
  }

  render() {
    return (
      <div className="draw-name">
        <div className="controls">
          <div className="undo" onClick={() => this.drawingBoard?.undo()}>
            Undo
          </div>
          <div className="redo" onClick={() => this.drawingBoard?.redo()}>
            Redo
          </div>
          <div className="clear" onClick={() => this.drawingBoard?.clear()}>
            Clear
          </div>
        </div>
        <canvas ref={this.canvas} className="canvas"></canvas>
      </div>
    );
  }
}
