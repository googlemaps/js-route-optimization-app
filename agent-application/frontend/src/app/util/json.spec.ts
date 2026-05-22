import { extractCode, isCodeBlock } from './json';

describe('parse JSON', () => {
  describe('isCodeBlock', () => {
    it('should return false for empty string', () => {
      expect(isCodeBlock('')).toBeFalsy();
    });
    it('should return true for json-tagged code blocks', () => {
      expect(isCodeBlock('```json')).toBeTruthy();
    });
    it('should return true for any language-tagged code blocks', () => {
      expect(isCodeBlock('```javascript')).toBeTruthy();
      expect(isCodeBlock('```textproto')).toBeTruthy();
    });
    it('should return true for untagged code fences', () => {
      expect(isCodeBlock('```')).toBeTruthy();
    });
    it('should return false for plain text', () => {
      expect(isCodeBlock('{}')).toBeFalsy();
    });
  });

  describe('extractCode', () => {
    it('should parse empty JSON block', () => {
      expect(extractCode('```json\n{}\n```')).toEqual('{}');
    });

    it('should parse any language-tagged block', () => {
      expect(extractCode('```javascript\nconsole.log("hi");\n```')).toEqual('console.log("hi");');
    });

    it('should parse textproto blocks', () => {
      expect(extractCode('```textproto\nmodel: {}\n```')).toEqual('model: {}');
    });

    it('should parse valid JSON block', () => {
      expect(extractCode('```json\n{"model": {}}\n```')).toEqual('{"model": {}}');
    });

    it('should return empty string for non-fence content', () => {
      expect(extractCode('just plain text')).toEqual('');
    });
  });
});
