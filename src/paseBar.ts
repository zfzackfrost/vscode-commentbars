
const commentBarTxtLineRegExp = /^(?:(?:\S){1,10}(?:\s?))(\S)\1*\s(\b.+\b)\s(\S)\1*(?:(?:\s?)(?:\S){1,10})?$/;
const commentBarFillLineRegExp = /^(?:(?:\S){1,10}(?:\s?))(\S)\1*(?:(?:\s?)(?:\S){1,10})?$/;

/**
 * The parsed data for a single line of a comment bar.
 *
 * @export
 * @interface ParsedCommentBarLine
 * @property {string} fillChar - The fill character that was parsed from the input line string.
 * @property {string} [text] - The text, if any, that was parsed from the input line string.
 * @property {number} width - The width of the comment bar line that was parsed from the input string.
 */
export interface ParsedCommentBarLine {
	fillChar: string;
	text?: string;
	width: number;
}
/**
 * Parse a line of a comment bar to get the fill character, width and text (if applicable).
 *
 * @export
 * @param {string} line - The string that has the text for the line of the comment bar to parse
 * @returns {(ParsedCommentBarLine | null)}
 */
export function parseCommentBarLine(line: string): ParsedCommentBarLine | null {
	// Trim whitespace around line
	let tmpLine: string = line.trim();
	// Check if the line string matches the pattern of a comment bar center text line...
	let m: RegExpMatchArray = tmpLine.match(commentBarTxtLineRegExp);

	// if successfully matched text line pattern...
	if (m !== null) {
		// Return line info
		return {
			fillChar: m[1], // Detected fill character
			text: m[2], // Detected text
			width: tmpLine.length // Trimmed line width
		};
	} else { // Else, check for match on fill line pattern
		m = tmpLine.match(commentBarFillLineRegExp);

		// if successfully matched fill line pattern...
		if (m !== null) {
			// Return line info
			return {
				fillChar: m[1], // Detected fill character
				width: tmpLine.length // Trimmed line width
			};
		}
	}
	// If not fill line or text line, return null.
	return null;
}