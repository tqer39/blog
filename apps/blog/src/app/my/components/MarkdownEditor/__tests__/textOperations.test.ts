import { describe, expect, it } from 'vitest';

/**
 * Pure function tests for text manipulation logic used in MarkdownEditor.
 * These test the core algorithms without DOM dependencies.
 */

// Pure text manipulation functions extracted for testing
function insertTextAt(
  text: string,
  insertText: string,
  start: number,
  end: number
): string {
  const before = text.substring(0, start);
  const after = text.substring(end);
  return before + insertText + after;
}

function wrapText(
  text: string,
  before: string,
  after: string,
  start: number,
  end: number
): string {
  const beforeText = text.substring(0, start);
  const selectedText = text.substring(start, end);
  const afterText = text.substring(end);
  return beforeText + before + selectedText + after + afterText;
}

function calculateNewCursorPosition(
  insertedText: string,
  originalStart: number
): number {
  return originalStart + insertedText.length;
}

function calculateWrapSelectionRange(
  beforeWrapper: string,
  originalStart: number,
  originalEnd: number
): { start: number; end: number } {
  return {
    start: originalStart + beforeWrapper.length,
    end: originalEnd + beforeWrapper.length,
  };
}

describe('MarkdownEditor Text Operations', () => {
  describe('insertTextAt', () => {
    it('should insert text at cursor position', () => {
      const text = 'Hello World';
      const result = insertTextAt(text, '!', 5, 5);
      expect(result).toBe('Hello! World');
    });

    it('should replace selected text', () => {
      const text = 'Hello World';
      const result = insertTextAt(text, 'Beautiful', 6, 11);
      expect(result).toBe('Hello Beautiful');
    });

    it('should insert at beginning', () => {
      const text = 'World';
      const result = insertTextAt(text, 'Hello ', 0, 0);
      expect(result).toBe('Hello World');
    });

    it('should insert at end', () => {
      const text = 'Hello';
      const result = insertTextAt(text, ' World', 5, 5);
      expect(result).toBe('Hello World');
    });

    it('should handle empty text', () => {
      const text = '';
      const result = insertTextAt(text, 'Hello', 0, 0);
      expect(result).toBe('Hello');
    });

    it('should insert markdown image syntax', () => {
      const text = 'Some text here';
      const result = insertTextAt(
        text,
        '![alt](https://example.com/image.png)',
        14,
        14
      );
      expect(result).toBe(
        'Some text here![alt](https://example.com/image.png)'
      );
    });

    it('should insert code block', () => {
      const text = 'Explanation:\n\nMore text';
      const codeBlock = '```javascript\nconst x = 1;\n```\n';
      const result = insertTextAt(text, codeBlock, 13, 13);
      expect(result).toBe(
        'Explanation:\n```javascript\nconst x = 1;\n```\n\nMore text'
      );
    });
  });

  describe('wrapText', () => {
    it('should wrap selected text with bold markers', () => {
      const text = 'Hello World';
      const result = wrapText(text, '**', '**', 6, 11);
      expect(result).toBe('Hello **World**');
    });

    it('should wrap selected text with italic markers', () => {
      const text = 'Hello World';
      const result = wrapText(text, '_', '_', 6, 11);
      expect(result).toBe('Hello _World_');
    });

    it('should wrap selected text with strikethrough', () => {
      const text = 'Hello World';
      const result = wrapText(text, '~~', '~~', 6, 11);
      expect(result).toBe('Hello ~~World~~');
    });

    it('should wrap with inline code', () => {
      const text = 'Use the function method';
      const result = wrapText(text, '`', '`', 8, 16);
      expect(result).toBe('Use the `function` method');
    });

    it('should wrap with link syntax', () => {
      const text = 'Check this link for more';
      const result = wrapText(text, '[', '](url)', 11, 15);
      expect(result).toBe('Check this [link](url) for more');
    });

    it('should wrap entire text', () => {
      const text = 'Hello';
      const result = wrapText(text, '**', '**', 0, 5);
      expect(result).toBe('**Hello**');
    });

    it('should handle empty selection (insert markers only)', () => {
      const text = 'Hello World';
      const result = wrapText(text, '**', '**', 6, 6);
      expect(result).toBe('Hello ****World');
    });

    it('should wrap with heading prefix', () => {
      const text = 'Title';
      const result = wrapText(text, '## ', '', 0, 5);
      expect(result).toBe('## Title');
    });
  });

  describe('calculateNewCursorPosition', () => {
    it('should calculate position after simple insert', () => {
      const position = calculateNewCursorPosition('Hello', 0);
      expect(position).toBe(5);
    });

    it('should calculate position after insert with offset', () => {
      const position = calculateNewCursorPosition('World', 6);
      expect(position).toBe(11);
    });

    it('should handle multi-line insert', () => {
      const multiLine = '```\ncode\n```';
      const position = calculateNewCursorPosition(multiLine, 10);
      expect(position).toBe(10 + multiLine.length);
    });
  });

  describe('calculateWrapSelectionRange', () => {
    it('should calculate new selection range after wrap', () => {
      const range = calculateWrapSelectionRange('**', 6, 11);
      expect(range.start).toBe(8);
      expect(range.end).toBe(13);
    });

    it('should handle single character wrapper', () => {
      const range = calculateWrapSelectionRange('_', 0, 5);
      expect(range.start).toBe(1);
      expect(range.end).toBe(6);
    });

    it('should handle longer wrapper', () => {
      const range = calculateWrapSelectionRange('```javascript\n', 0, 10);
      expect(range.start).toBe(14);
      expect(range.end).toBe(24);
    });
  });

  describe('Markdown formatting scenarios', () => {
    it('should format heading 1', () => {
      const text = 'My Title';
      const result = insertTextAt('', '# ' + text, 0, 0);
      expect(result).toBe('# My Title');
    });

    it('should format unordered list item', () => {
      const text = 'Item 1\nItem 2';
      const result = insertTextAt(text, '- ', 0, 0);
      expect(result).toBe('- Item 1\nItem 2');
    });

    it('should format ordered list item', () => {
      const text = 'First\nSecond';
      const result = insertTextAt(text, '1. ', 0, 0);
      expect(result).toBe('1. First\nSecond');
    });

    it('should format blockquote', () => {
      const text = 'Some quote here';
      const result = wrapText(text, '> ', '', 0, text.length);
      expect(result).toBe('> Some quote here');
    });

    it('should format horizontal rule', () => {
      const text = 'Before\n\nAfter';
      const result = insertTextAt(text, '\n---\n', 6, 6);
      expect(result).toBe('Before\n---\n\n\nAfter');
    });

    it('should handle nested formatting', () => {
      const text = 'Hello World';
      // First make it bold
      const bold = wrapText(text, '**', '**', 6, 11);
      expect(bold).toBe('Hello **World**');

      // Then make the bold part italic too
      const boldItalic = wrapText(bold, '_', '_', 8, 13);
      expect(boldItalic).toBe('Hello **_World_**');
    });
  });

  describe('Edge cases', () => {
    it('should handle unicode characters', () => {
      const text = '日本語テキスト';
      const result = wrapText(text, '**', '**', 0, 7);
      expect(result).toBe('**日本語テキスト**');
    });

    it('should handle emoji', () => {
      const text = 'Hello 👋 World';
      const result = wrapText(text, '**', '**', 6, 8);
      expect(result).toBe('Hello **👋** World');
    });

    it('should handle special markdown characters', () => {
      const text = 'Use * for lists';
      const result = wrapText(text, '`', '`', 4, 5);
      expect(result).toBe('Use `*` for lists');
    });

    it('should handle newlines in selection', () => {
      const text = 'Line 1\nLine 2\nLine 3';
      const result = wrapText(text, '```\n', '\n```', 0, text.length);
      expect(result).toBe('```\nLine 1\nLine 2\nLine 3\n```');
    });
  });
});
