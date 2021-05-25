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
import { ValidationFailure } from 'store/nodeEditor';
import { ImCross } from 'react-icons/im';
import Loading from 'components/loading/Loading';

export interface Attachment {
  type: string;
  url: string;
  uploaded?: boolean;
  validationFailures?: ValidationFailure[];
  valid?: boolean;
}

const MAX_ATTACHMENTS = 1;

const TYPE_OPTIONS: SelectOption[] = [
  { value: 'image', name: i18n.t('forms.image_url', 'Image URL') },
  { value: 'audio', name: i18n.t('forms.audio_url', 'Audio URL') },
  { value: 'video', name: i18n.t('forms.video_url', 'Video URL') },
  { value: 'document', name: i18n.t('forms.pdf_url', 'PDF Document URL') }
];

const NEW_TYPE_OPTIONS = TYPE_OPTIONS.concat([
  { value: 'upload', name: i18n.t('forms.upload_attachment', 'Upload Attachment') }
]);

export const validateURL = (endpoint: any, body: any, msgForm: any) => {
  axios
    .get(`${endpoint}?url=${body.url}&type=${body.type}`)
    .then(response => {
      if (response.data.is_valid) {
        msgForm.attachmentValidate(body, false);
      } else {
        msgForm.attachmentValidate(body, true, [{ message: response.data.message }]);
      }
    })
    .catch(error => {
      msgForm.attachmentValidate(body, true, [
        { message: `The attachment url is invalid!: ${error.toString()}` }
      ]);
    });
};

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
  data.append('media', files[0]);
  const mediaName = files[0].name;
  const extension = mediaName.slice((Math.max(0, mediaName.lastIndexOf('.')) || Infinity) + 1);
  data.append('extension', extension);
  axios
    .post(endpoint, data, { headers })
    .then(onSuccess)
    .catch(error => {
      console.log(error);
    });
};

export const renderAttachments = (
  endpoint: string,
  attachmentsEnabled: boolean,
  attachments: Attachment[],
  onUploaded: (response: AxiosResponse) => void,
  onAttachmentChanged: (index: number, value: string, url: string) => void,
  onAttachmentRemoved: (index: number) => void
): JSX.Element => {
  const renderedAttachments = attachments.map((attachment, index: number) =>
    attachment.uploaded
      ? renderUpload(index, attachment, onAttachmentRemoved)
      : renderAttachment(
          attachmentsEnabled,
          index,
          attachment,
          onAttachmentChanged,
          onAttachmentRemoved
        )
  );

  const emptyOption =
    attachments.length < MAX_ATTACHMENTS
      ? renderAttachment(
          attachmentsEnabled,
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
            value: {
              name:
                attachment.url.length > 20 ? `${attachment.url.slice(0, 20)}...` : attachment.url
            }
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
  attachmentsEnabled: boolean,
  index: number,
  attachment: Attachment,
  onAttachmentChanged: (index: number, type: string, url: string) => void,
  onAttachmentRemoved: (index: number) => void
): JSX.Element => {
  return (
    <>
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
            options={attachmentsEnabled ? NEW_TYPE_OPTIONS : TYPE_OPTIONS}
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
      <div>
        {attachment.valid && !attachment.validationFailures ? (
          <div className={styles.loading}>
            Checking URL validity
            <Loading size={10} units={6} color="#999999" />
          </div>
        ) : null}
        {attachment.validationFailures && attachment.validationFailures.length > 0 ? (
          <div className={styles.error}>
            <ImCross className={styles.crossIcon} />
            {attachment.validationFailures[0].message}
          </div>
        ) : null}
      </div>
    </>
  );
};
