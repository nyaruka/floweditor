import { react as bindCallbacks } from 'auto-bind';
import axios from 'axios';
import * as React from 'react';
import Button, { ButtonTypes } from 'components/button/Button';
import { getCookie } from 'external';

export interface UploadButtonState {}

export interface UploadButtonProps {
  icon: string;
  uploadText: string;
  removeText: string;
  url: string;
  endpoint: string;
  onUploadChanged: (url: string) => void;
}

export default class UploadButton extends React.Component<UploadButtonProps, UploadButtonState> {
  private filePicker: any;

  constructor(props: UploadButtonProps) {
    super(props);
    this.state = {};
    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  private handleRemoveUpload(): void {
    this.props.onUploadChanged(null);
  }

  private handleUploadFile(files: FileList): void {
    const data = new FormData();
    data.append('file', files[0]);

    // if we have a csrf in our cookie, pass it along as a header
    const csrf = getCookie('csrftoken');
    const headers = csrf ? { 'X-CSRFToken': csrf } : {};

    axios
      .post(this.props.endpoint, data, { headers })
      .then(response => {
        this.props.onUploadChanged(response.data.url);
      })
      .catch(error => {
        console.log(error);
      });
  }

  public render(): JSX.Element {
    return (
      <>
        <input
          style={{
            display: 'none'
          }}
          ref={ele => {
            this.filePicker = ele;
          }}
          type="file"
          onChange={e => this.handleUploadFile(e.target.files)}
        />
        {this.props.url ? (
          <Button
            iconName="fe-trash"
            name={this.props.removeText}
            topSpacing={true}
            onClick={this.handleRemoveUpload}
            type={ButtonTypes.tertiary}
          />
        ) : (
          <Button
            iconName={this.props.icon}
            name={this.props.uploadText}
            topSpacing={true}
            onClick={() => {
              this.filePicker.click();
            }}
            type={ButtonTypes.tertiary}
          />
        )}
      </>
    );
  }
}
