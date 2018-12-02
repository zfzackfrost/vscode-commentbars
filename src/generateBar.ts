// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode;

import {
	window as Window,
	workspace as Workspace,
	commands as Commands,
	QuickPickOptions,
	QuickPickItem,
	InputBoxOptions,
	TextDocument as Document,
	TextEditor as Editor,
	TextEditorEdit,
	Selection,
	ExtensionContext,
	WorkspaceConfiguration,
	LanguageConfiguration
} from "vscode";

import * as _ from "lodash";

import * as Presets from "./presets";
import * as Delims from "./delims";


/**
 * Create the text for a single line of a comment bar.
 *
 * @export
 * @param {number} width - The width of the comment bar to generate
 * @param {(string | null | undefined)} text - The text to place in the center of the line, if any.
 * @param {string} fillChar  - The fill character to use for the comment bar line. Should be a string of length 1.
 * @param {Delims.LanguageCommentDelims} commentDelims - The comment delimiters for the language to generate the comment bar for.
 * @param {boolean} [seamlessFill=false] - Should the comment bar line be generated using "seamless filling". Default to false.
 * @returns {string} A line for a comment bar generated using the options passed to the function as arguments.
 */
export function buildCommentBarLine(
	width: number,
	text: string | null | undefined,
	fillChar: string,
	commentDelims: Delims.LanguageCommentDelims,
	seamlessFill: boolean = false
): string {
	// Make sure the width is an integer
	const tmpWidth = Math.round(width);

	// If comment bar text is valid, set to a trimmed copy. Otherwise set to empty string.
	const tmpText = _.isString(text) ? text.trim() : "";
	// Text to place in center of comment bar: If `tmpText` above is not an empty string,
	// pad it with 1 space on left and right. Otherwise, set to empty string.
	const insertedText = tmpText.length > 0 ? ` ${tmpText} ` : "";
	// Length of text to insert in center of comment bar.
	const insertedTextLen = insertedText.length;

	// The number of fill characters to place before the comment bar text, ignoring comment delimiters
	const lengthBeforeBase = Math.round((tmpWidth - insertedTextLen) / 2.0);
	// The number of fill characters to place after the comment bar text, ignoring comment delimiters
	const lengthAfterBase = tmpWidth - (insertedTextLen + lengthBeforeBase);

	// The starting comment delimiter
	let startCmt = commentDelims.start;
	// The ending comment delimiter, or empty string
	let endCmt = commentDelims.end ? commentDelims.end : "";

	// If "seamless filling" is enabled...
	if (seamlessFill) {
		// Trimmed copy of the starting comment delimiter
		const trimmedStartCmt = startCmt.trimRight();
		// The last character of the starting comment delimiter
		const startCmtBorderChar = _.last(trimmedStartCmt);

		// If the last character of the starting comment delimiter equals
		// the fill character...
		if (startCmtBorderChar === fillChar) {
			// Set the starting comment delimiter to the trimmed copy
			startCmt = trimmedStartCmt;
		}

		// Trimmed copy of the ending comment delimiter
		const trimmedEndCmt = endCmt.trimLeft();
		// The first character of the ending comment delimiter
		const endCmtBorderChar = _.first(trimmedEndCmt);

		// If the first character of the starting comment delimiter equals
		// the fill character...
		if (endCmtBorderChar === fillChar) {
			// Set the ending comment delimiter to the trimmed copy
			endCmt = trimmedStartCmt;
		}
	}

	// The length of the starting comment delimiter
	const startCmtLen = startCmt.length;
	// The length of the ending comment delimiter
	const endCmtLen = endCmt.length;

	// The number of fill characters to place before the comment bar text, adjusted comment delimiters
	const lengthBefore = lengthBeforeBase - startCmtLen;
	// The number of fill characters to place after the comment bar text, adjusted comment delimiters
	const lengthAfter = lengthAfterBase - endCmtLen;

	// The fill character repeated `lengthBefore` times
	const fillBefore = _.repeat(fillChar, lengthBefore);
	// The fill character repeated `lengthAfter` times.
	const fillAfter = _.repeat(fillChar, lengthAfter);

	// Starting text that gets placed before the contents of the comment bar (i.e. starting comment 
	// delimiter and fill characters)
	const lineBefore = `${startCmt}${fillBefore}`;
	// Starting text that gets placed after the contents of the comment bar (i.e. fill characters 
	// and ending comment delimiters)
	const lineAfter = `${fillAfter}${endCmt}`;
	// The final assembled text of the comment bar line!
	const lineText = `${lineBefore}${insertedText}${lineAfter}`;

	return lineText;
}
/**
 * Construct all of the lines for a comment bar with the given options.
 *
 * @export
 * @param {number} width - The width of the comment bar to generate. All of the strings will be this length, as
 * long as the length `text` is less than this (with allowance for comment delimiters).
 * @param {(string | null | undefined)} text - The text to insert in the middle of the center line.
 * @param {number} thickness - The number of lines thick the comment bar should be. Will be rounded up to an odd number.
 * @param {string} fillChar - The fill character to use for the comment bar.
 * @param {Delims.LanguageCommentDelims} commentDelims - The set of comment delimiters to use when generating the comment bar
 * @param {boolean} [seamlessFill=false] - Should the comment bar be generated with "seamless filling"?
 * @returns {string[]} The lines of text that make up the comment bar. On success, length will be equal to `thickness`.
 */
export function buildCommentBar(
	width: number,
	text: string | null | undefined,
	thickness: number,
	fillChar: string,
	commentDelims: Delims.LanguageCommentDelims,
	seamlessFill: boolean = false
): string[] {
	// Running array of lines that have been generated
	let lines: string[] = [];

	// The thickness of the comment bar, rounded to an odd number
	let tmpThickness: number = thickness % 2 === 0 ? thickness + 1 : thickness;
	// The index of the center line, for inserting the bar text
	let centerIdx = Math.floor(tmpThickness / 2.0);

	// Loop through each line index...
	for (let i = 0; i < tmpThickness; ++i) {
		// If line index is equal to the center line index...
		if (i === centerIdx) {
			// Generate a line with text and add it to the running
			// array of lines
			lines.push(
				buildCommentBarLine(
					width,
					text,
					fillChar,
					commentDelims,
					seamlessFill
				)
			);
		} else { // Otherwise, not a center line...

			// Generate a fill line and add it to the 
			// running array of lines
			lines.push(
				buildCommentBarLine(
					width,
					null,
					fillChar,
					commentDelims,
					seamlessFill
				)
			);
		}
	}

	// Return the running array of lines
	return lines;
}
/**
 * Replace a selection with a comment bar. 
 *
 * @param {string[]} lines - The lines of the comment bar to insert
 * @param {Editor} editor - The current vscode `TextEditor` object to operate on
 * @param {Selection} selection - The selection to replace with a comment bar
 * @returns {Promise<any>} A promise that resolves when the editor operation, to insert
 * the comment bar, is complete.
 */
async function insertCommentBar(
	lines: string[],
	editor: Editor,
	selection: Selection
): Promise<any> {
	// Start performing an edit on the document attached to `editor`
	return editor.edit((editBuilder: TextEditorEdit) => {
		// Replace the specified selection with the lines of the comment bar.
		editBuilder.replace(selection, _.join(lines, "\n"));
	});
}

export async function commentBarGenerateCommand(
	advanced: boolean
): Promise<any> {
	let editor = Window.activeTextEditor;
	if (!editor) {
		Window.showErrorMessage(
			"There must be an active file to use this command!"
		);
		return;
	}

	let config = Workspace.getConfiguration("commentbars");

	let thickness: number = 0;
	let width: number = 0;
	let fillChar: string = "";
	let seamlessFill = false;

	let defaultFillChar: string | null | undefined = null;
	let languageId = editor.document.languageId;
	let commentDelimsOrError:
		| Delims.LanguageCommentDelims
		| string = Delims.processCommentDelimsConfig(config, languageId);

	if (!Delims.isLanguageDelimsConfig(commentDelimsOrError)) {
		Window.showErrorMessage(commentDelimsOrError);
		return;
	}

	let text: string | null | undefined = null;
	let edtSelection = editor.selection;
	if (edtSelection.isEmpty) {
		text = "";
	} else {
		if (edtSelection.isSingleLine) {
			text = editor.document.getText(edtSelection);
		} else {
			Window.showErrorMessage(
				"Multi-line comment bar text is not supported!"
			);
			return;
		}
	}

	// ------------- Pick comment bar thickness -------------
	if (advanced) {
		let thickOpts: InputBoxOptions = {
			prompt: "Enter comment bar thickness (by number of lines):",
			placeHolder:
				"Enter thickness in # of lines (Will be rounded to an ODD number)"
		};
		let thicknessChoice = await Window.showInputBox(thickOpts);

		if (!thicknessChoice) {
			return;
		}

		thickness = Number(thicknessChoice);

		// ------------- Pick comment bar width -------------

		let widthOpts: InputBoxOptions = {
			prompt:
				"Enter the the width of the comment bar (by number of characters)"
		};
		let widthInput = await Window.showInputBox(widthOpts);
		width = Number(widthInput);

		if (isNaN(width)) {
			Window.showErrorMessage("Comment bar width must be a number!");
			return;
		}

		if (config.has("defaultFillChar")) {
			defaultFillChar = config.get("defaultFillChar");
		}

		let fillOpts: InputBoxOptions = {
			prompt:
				"Enter the fill character (Default can be set in preferences)"
		};
		let fillCharInput = await Window.showInputBox(fillOpts);
		fillChar =
			fillCharInput && fillCharInput.length === 1
				? fillCharInput
				: defaultFillChar
				? defaultFillChar
				: "-";
	} else {
		let styleOpts: QuickPickOptions = {
			placeHolder: "Choose comment bar style preset (by number of lines):"
		};
		let presetsConfig = Presets.getCommentBarPresets(config);
		if (_.isArray(presetsConfig) && presetsConfig.length > 0) {
			let items: QuickPickItem[] = _.map(
				presetsConfig,
				(preset: Presets.QuickPreset) => {
					let tmpWidth = preset.width;
					let tmpThickness = preset.thickness;
					let tmpFillChar = preset.fillChar
						? preset.fillChar
						: defaultFillChar;
					return {
						label: preset.label,
						description: `Width: ${tmpWidth} \u2014 Thickness: ${tmpWidth} \u2014 Fill Character: '${tmpFillChar}'`
					};
				}
			);
			let styleChoice:
				| QuickPickItem
				| undefined = await Window.showQuickPick(items, styleOpts);
			let presetIdx = _.findIndex(
				presetsConfig,
				(
					value: Presets.QuickPreset,
					index: number,
					collection: ArrayLike<Presets.QuickPreset>
				) => {
					if (styleChoice) {
						if (value.label === styleChoice.label) {
							return true;
						}
					}
					return false;
				}
			);
			if (presetIdx >= 0) {
				let preset = presetsConfig[presetIdx];
				width = preset.width;
				thickness = preset.thickness;
				fillChar = preset.fillChar;
				seamlessFill = _.isBoolean(preset.seamlessFill)
					? preset.seamlessFill
					: false;
			}
		}
	}
	if (config.has("defaultFillChar")) {
		defaultFillChar = config.get("defaultFillChar");
	}

	if (commentDelimsOrError && fillChar && text !== null) {
		let lines: string[] = buildCommentBar(
			width,
			text,
			thickness,
			fillChar,
			commentDelimsOrError,
			seamlessFill
		);
		if (lines) {
			await insertCommentBar(lines, editor, edtSelection);
		}
	} else {
		Window.showErrorMessage("Invalid config!");
	}
}
