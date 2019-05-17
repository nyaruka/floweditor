import PlayAudioComp from "components/flow/actions/playaudio/PlayAudio";
import { PlayAudio } from "flowTypes";
import { composeComponentTestUtils } from "testUtils";
import { createPlayAudioAction } from "testUtils/assetCreators";
import { setEmpty } from "utils";

const playAudioAction = createPlayAudioAction();

const { setup } = composeComponentTestUtils<PlayAudio>(
  PlayAudioComp,
  playAudioAction
);

describe(PlayAudioComp.name, () => {
  describe("render", () => {
    it("should render auhio prop when passed", () => {
      const { wrapper, props } = setup();
      expect(wrapper.text()).toBe(props.audio_url);
      expect(wrapper).toMatchSnapshot();
    });

    it("should render placeholder when url prop isn't passed", () => {
      const { wrapper } = setup(true, { audio_url: setEmpty() });
      expect(wrapper).toMatchSnapshot();
    });
  });
});
