import EditorConfig, { EMode } from './EditorConfig';

const editorConfig = new EditorConfig();

describe('Helpers: config', () => {
    it('should provide a type config list', () => {
        expect(editorConfig.typeConfigList).toMatchSnapshot();
    });

    it('should provide a operator config list', () => {
        expect(editorConfig.operatorConfigList).toMatchSnapshot();
    });

    it('should filter actionConfigs', () => {
        expect(editorConfig.actionConfigList).toMatchSnapshot();
    });

    it('should map type configs', () => {
        expect(editorConfig.typeConfigMap).toMatchSnapshot();
    });

    it('should map operator configs', () => {
        expect(editorConfig.operatorConfigMap).toMatchSnapshot();
    });

    it('should get type config', () => {
        expect(editorConfig.getTypeConfig('add_to_group')).toMatchSnapshot();
    });

    it('should get operator config', () => {
        expect(editorConfig.getOperatorConfig('has_date')).toMatchSnapshot();
    });

    it('should provide an endpoints object', () => {
        expect(editorConfig.endpoints).toMatchSnapshot();
    });

    it('should provide a languages object', () => {
        expect(editorConfig.languages).toMatchSnapshot();
    });
});
