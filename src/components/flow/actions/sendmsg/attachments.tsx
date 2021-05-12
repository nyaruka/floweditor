import axios, { AxiosResponse } from 'axios';
import SelectElement, { SelectOption } from 'components/form/select/SelectElement';
import Pill from 'components/pill/Pill';
import i18n from 'config/i18n';
import { getCookie } from 'external';
import React from 'react';
import { TembaSelectStyle } from 'temba/TembaSelect';
import { createUUID } from 'utils';
import styles from './attachments.module.scss';
import TextInputElement, { TextInputStyle } from 'components/form/textinput/TextInputElement';

export interface Attachment {
  type: string;
  url: string;
  uploaded?: boolean;
}

const MAX_ATTACHMENTS = 3;

const TYPE_OPTIONS: SelectOption[] = [
  { value: 'image', name: i18n.t('forms.image_url', 'Image URL') },
  { value: 'audio', name: i18n.t('forms.audio_url', 'Audio URL') },
  { value: 'video', name: i18n.t('forms.video_url', 'Video URL') },
  { value: 'application', name: i18n.t('forms.pdf_url', 'PDF Document URL') }
];

const NEW_TYPE_OPTIONS = TYPE_OPTIONS.concat([
  { value: 'upload', name: i18n.t('forms.upload_attachment', 'Upload Attachment') }
]);

// we would prefer that attachmetns be entirely stateless, but we have this
// tiny bit of state for simplicity with the reasonable assumption that only
// one batch of attachments are rendered at once
let filePicker: any;

const getAttachmentTypeOption = (type: string): SelectOption => {
  return TYPE_OPTIONS.find((option: SelectOption) => option.value === type);
};

export const handleUploadFile = (
  endpoint: string,
  files: FileList,
  onSuccess: (response: AxiosResponse) => void
): void => {
  // if we have a csrf in our cookie, pass it along as a header
  const csrf = getCookie('csrftoken');
  const headers: any = csrf ? { 'X-CSRFToken': csrf } : {};

  // mark us as ajax
  headers['X-Requested-With'] = 'XMLHttpRequest';

  const data = new FormData();
  data.append('file', files[0]);
  axios
    .post(endpoint, data, { headers })
    .then(onSuccess)
    .catch(error => {
      console.log(error);
    });
};

export const renderAttachments = (
  endpoint: string,
  attachments: Attachment[],
  onUploaded: (response: AxiosResponse) => void,
  onAttachmentChanged: (index: number, value: string, url: string) => void,
  onAttachmentRemoved: (index: number) => void
): JSX.Element => {
  const renderedAttachments = attachments.map((attachment, index: number) =>
    attachment.uploaded
      ? renderUpload(index, attachment, onAttachmentRemoved)
      : renderAttachment(index, attachment, onAttachmentChanged, onAttachmentRemoved)
  );

  const emptyOption =
    attachments.length < MAX_ATTACHMENTS
      ? renderAttachment(
          -1,
          { url: '', type: '' },

          onAttachmentChanged,
          onAttachmentRemoved
        )
      : null;
  return (
    <>
      <p>
        {i18n.t(
          'forms.send_msg_summary',
          'Add an attachment to each message. The attachment can be a file you upload or a dynamic URL using expressions and variables from your Flow.',
          { count: MAX_ATTACHMENTS }
        )}
      </p>
      {renderedAttachments}
      {emptyOption}
      <input
        style={{
          display: 'none'
        }}
        ref={ele => {
          filePicker = ele;
        }}
        type="file"
        onChange={e => handleUploadFile(endpoint, e.target.files, onUploaded)}
      />
    </>
  );
};

export const renderUpload = (
  index: number,
  attachment: Attachment,
  onAttachmentRemoved: (index: number) => void
): JSX.Element => {
  return (
    <div
      className={styles.url_attachment}
      key={index > -1 ? 'url_attachment_' + index : createUUID()}
    >
      <div className={styles.type_choice}>
        <SelectElement
          key={'attachment_type_' + index}
          name={i18n.t('forms.type', 'Type')}
          style={TembaSelectStyle.small}
          entry={{
            value: { name: attachment.type }
          }}
          options={TYPE_OPTIONS}
          disabled={true}
        />
      </div>
      <div className={styles.url}>
        <span className={styles.upload}>
          <Pill
            icon="fe-download"
            text="Download"
            large={true}
            onClick={() => {
              window.open(attachment.url, '_blank');
            }}
          />
          <div className={styles.remove_upload}>
            <Pill
              icon="fe-x"
              text="Remove"
              large={true}
              onClick={() => {
                onAttachmentRemoved(index);
              }}
            />
          </div>
        </span>
      </div>
    </div>
  );
};

export const renderAttachment = (
  index: number,
  attachment: Attachment,
  onAttachmentChanged: (index: number, type: string, url: string) => void,
  onAttachmentRemoved: (index: number) => void
): JSX.Element => {
  return (
    <div
      className={styles.url_attachment}
      key={index > -1 ? 'url_attachment_' + index : createUUID()}
    >
      <div className={styles.type_choice}>
        <SelectElement
          key={'attachment_type_' + index}
          style={TembaSelectStyle.small}
          name={i18n.t('forms.type_options', 'Type Options')}
          placeholder={i18n.t('forms.add_attachment', 'Add Attachment')}
          entry={{
            value: index > -1 ? getAttachmentTypeOption(attachment.type) : null
          }}
          onChange={(option: any) => {
            if (option.value === 'upload') {
              window.setTimeout(() => {
                filePicker.click();
              }, 0);
            } else {
              onAttachmentChanged(index, option.value, index === -1 ? '' : attachment.url);
            }
          }}
          options={index > -1 ? TYPE_OPTIONS : NEW_TYPE_OPTIONS}
        />
      </div>
      {index > -1 ? (
        <>
          <div className={styles.url}>
            <TextInputElement
              placeholder="URL"
              name={i18n.t('forms.url', 'URL')}
              style={TextInputStyle.small}
              onChange={(value: string) => {
                onAttachmentChanged(index, attachment.type, value);
              }}
              entry={{ value: attachment.url }}
              autocomplete={true}
            />
          </div>
          <div className={styles.remove}>
            <Pill
              icon="fe-x"
              text=" Remove"
              large={true}
              onClick={() => {
                onAttachmentRemoved(index);
              }}
            />
          </div>
        </>
      ) : null}
    </div>
  );
};
