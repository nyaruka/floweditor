import SendBroadcastForm from 'components/flow/actions/sendbroadcast/SendBroadcastForm';
import { ActionFormProps } from 'components/flow/props';
import { ComposeAttachment } from 'flowTypes';
import { composeComponentTestUtils, mock } from 'testUtils';
import { createBroadcastMsgAction, getActionFormProps } from 'testUtils/assetCreators';
import * as utils from 'utils';

mock(utils, 'createUUID', utils.seededUUIDs());

const action = createBroadcastMsgAction();
const { setup } = composeComponentTestUtils<ActionFormProps>(
  SendBroadcastForm,
  getActionFormProps(action)
);

// for a server limit of 640 chars, return a string that is 640+ chars
export const getInvalidText = () => {
  return "p}h<r0P<?SCIbV1+pwW1Hj8g^J&=Sm2f)K=5LjFFUZ№5@ybpoLZ7DJ(27qdWxQMaO)I1nB4(D%d3c(H)QXOF6F?4>&d{lhd5?0`Lio!yAGMO№*AxN5{z5s.IO*dy?tm}vXJ#Lf-HlD;xmNp}0<P42=w#ll9)B-e9>Q#'{~Vp<dl:xC9`T^lhh@TosCZ^:(H<Ji<E(~PojvYk^rPB+poYy^Ne~Su1:9?IgH'4S5Q9v0g№FEIUc~!{S7;746j'Sd@Nfu3=x?CsuR;YLP4j+AOzDARZG?0(Ji(NMg=r%n0Fq?R1?E%Yf`bcoVZAJ^bl0J'^@;lH>T.HmxYxwS;1?(bfrh?pRdd73:iMxrfx5luQ(}<dCD1b3g'G0CtkB№;8KkbL=>krG{RO%Va4wwr%P>jE*+n(E11}Ju9#<.f^)<MTH09^b{RQv7~H`#@Hda6{MV&H@xdyEKq#M@nZng8WTU66!F@*!)w*EpQ+65XKuQCaESgq=PHmtqi@l;F?PHvl^g@Z:+}}Xyr`IC2=3?20^I'qSU*tkyinM^JF.ZI>}~XzRQJn№v3o-w?Vy&gC:c.l(&9{`M#-'N}{T#7lw8(4:iY621'>C^.&hVZn:R!G}Ek){D#'KkiJWawq#7~GLBN*?V!ncw)d%&(tXj";
};

export const getTestAttachments = (numFiles = 2): ComposeAttachment[] => {
  const attachments = [];
  let index = 1;
  while (index <= numFiles) {
    const test = 'test' + index;
    const attachment = {
      uuid: test,
      content_type: 'image/png',
      type: 'image/png',
      filename: 'name_' + test,
      url: 'url_' + test,
      size: 1024,
      error: null
    } as ComposeAttachment;
    attachments.push(attachment);
    index++;
  }
  return attachments;
};

describe(SendBroadcastForm.name, () => {
  describe('render', () => {
    it('should render self, children with base props', () => {
      const { wrapper } = setup(true);
      expect(wrapper).toMatchSnapshot();
    });

    it('should render an empty form with no action', () => {
      const { wrapper, instance } = setup(true, {
        $merge: {
          nodeSettings: { originalNode: null }
        }
      });
      expect(instance.state).toMatchSnapshot();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('handles recipent change', () => {
      const { instance } = setup(true, {
        $merge: { updateSendBroadcastForm: jest.fn().mockReturnValue(true) }
      });
      instance.handleRecipientsChanged([{ id: 'group-0', name: 'My Group' }]);
      expect(instance.state).toMatchSnapshot();
    });

    it('handles valid compose text change', () => {
      const { instance, props } = setup(true, {
        $merge: { updateSendBroadcastForm: jest.fn().mockReturnValue(true) }
      });
      const compose = JSON.stringify({ und: { text: 'Some message', attachments: [] } });
      instance.handleComposeChanged(compose);
      expect(instance.state).toMatchSnapshot();
    });

    it('handles invalid compose text change', () => {
      const { instance, props } = setup(true, {
        $merge: { updateSendBroadcastForm: jest.fn().mockReturnValue(true) }
      });
      const compose = JSON.stringify({ und: { text: getInvalidText(), attachments: [] } });
      instance.handleComposeChanged(compose);
      expect(instance.state.compose.validationFailures[0].message).toContain(
        'Maximum allowed text is 640 characters'
      );
      expect(instance.state).toMatchSnapshot();
    });

    it('handles valid compose attachments change', () => {
      const { instance, props } = setup(true, {
        $merge: { updateSendBroadcastForm: jest.fn().mockReturnValue(true) }
      });
      const text = 'Some message with an attachment';
      const attachments = getTestAttachments();
      const compose = JSON.stringify({ und: { text: text, attachments: attachments } });
      instance.handleComposeChanged(compose);
      expect(instance.state).toMatchSnapshot();
    });

    it('handles invalid compose attachments change', () => {
      const { instance, props } = setup(true, {
        $merge: { updateSendBroadcastForm: jest.fn().mockReturnValue(true) }
      });
      const text = 'Some message with an attachment';
      const attachments = getTestAttachments(11);
      const compose = JSON.stringify({ und: { text: text, attachments: attachments } });
      instance.handleComposeChanged(compose);
      expect(instance.state.compose.validationFailures[0].message).toContain(
        'Maximum allowed attachments is 3 files'
      );
      expect(instance.state).toMatchSnapshot();
    });

    it('should allow switching from router', () => {
      const { instance, props } = setup(true, {
        $merge: { updateAction: jest.fn() },
        nodeSettings: { $merge: { originalAction: null } }
      });

      instance.handleRecipientsChanged([{ id: 'group-0', name: 'My Group' }]);
      const text = 'Some message with an attachment';
      const attachments = getTestAttachments(1);
      const compose = JSON.stringify({ und: { text: text, attachments: attachments } });
      instance.handleComposeChanged(compose);
      instance.handleSave();

      expect(props.updateAction).toMatchCallSnapshot();
    });
  });
});
