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
		} else {
			// Otherwise, not a center line...

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
/**
 * Implementations for the "Generate" commands (both the advanced and quick variations).
 *
 * @export
 * @param {boolean} advanced - If `true`, the "advanced" variation of the "Generate" command will be run.
 * Otherwise, the "Quick" variation will be executed.
 * @returns {Promise<any>} A `Promise` that resolves when the command is finished executing.
 */
export async function commentBarGenerateCommand(
	advanced: boolean
): Promise<any> {
	// The active `TextEditor` object in VSCode
	let editor: Editor = Window.activeTextEditor;

	// If there is not currently a text editor active...
	if (!editor) {
		// Show an error message to the user...
		Window.showErrorMessage(
			"There must be an active file to use this command!"
		);
		// ... And stop the command here.
		return;
	}

	// Get the user configuration fot this extension
	let config = Workspace.getConfiguration("commentbars");

	let thickness: number = 0; // Thickness of the comment bar to generate
	let width: number = 0; // Width of the comment bar to generate
	let fillChar: string = ""; // Fill character of the comment bar to generate
	let seamlessFill = false; // Should the comment bar use seamless filling?

	let defaultFillChar: string | null | undefined = null; // The default fill character

	// The current Language ID
	let languageId = editor.document.languageId;
	// Get the comment delimiters for the current language, or an error if none are found.
	let commentDelimsOrError:
		| Delims.LanguageCommentDelims
		| string = Delims.processCommentDelimsConfig(config, languageId);

	// If the `commentDelimsOrError` is an INVALID comment delimiter configuration.
	if (!Delims.isLanguageDelimsConfig(commentDelimsOrError)) {
		// Show the error message that it must be, if it is not a valid configuration.
		Window.showErrorMessage(commentDelimsOrError);
		// Stop the command here.
		return;
	}

	// The selected text in the active editor.
	// Will be used as the content text of the comment bar.
	let text: string | null | undefined = null;
	// The current editor's text selection
	let edtSelection = editor.selection;

	// If the active editor's text selection is empty...
	if (edtSelection.isEmpty) {
		// Set comment bar text content to an empty string
		text = "";
	} else {
		// Else, active editor has selection of non-zero length...

		// If selection does not span multiple lines...
		if (edtSelection.isSingleLine) {
			// Set comment bar text to selected text
			text = editor.document.getText(edtSelection);
		} else {
			// Else, multiple lines are selected (currently unsupported)

			// Show error message to the user.
			Window.showErrorMessage(
				"Multi-line comment bar text is not supported!"
			);
			// Stop command here.
			return;
		}
	}

	// If advanced mode is enabled...
	if (advanced) {
		// ====================== Advanced ====================== //

		// ------------- Pick comment bar thickness -------------

		// Options for comment bar thickness input box
		let thickOpts: InputBoxOptions = {
			prompt: "Enter comment bar thickness (by number of lines):",
			placeHolder:
				"Enter thickness in # of lines (Will be rounded to an ODD number)"
		};
		// Display input box to user and get the string that is entered
		let thicknessChoice = await Window.showInputBox(thickOpts);

		// Convert the string retrieved from thickness input box to a number
		thickness = Number(thicknessChoice);

		// If the thickness is not a number (i.e. NaN) ...
		if (isNaN(thickness)) {
			// Show an error message to the user
			Window.showErrorMessage("Comment bar thickness must be a number!");
			// Stop the command here.
			return;
		}

		// ------------- Pick comment bar width -------------

		// Options for comment bar width input box
		let widthOpts: InputBoxOptions = {
			prompt:
				"Enter the the width of the comment bar (by number of characters)"
		};
		// Display input box to user and get the string that is entered
		let widthInput = await Window.showInputBox(widthOpts);

		// Convert the string retrieved from width input box to a number
		width = Number(widthInput);

		// If the width is not a number (i.e. NaN) ...
		if (isNaN(width)) {
			// Show an error message to the user
			Window.showErrorMessage("Comment bar width must be a number!");
			// Stop the command here.
			return;
		}

		// If the user configuration has `defaultFillChar`...
		if (config.has("defaultFillChar")) {
			// Get the default fill character from the user configuration
			defaultFillChar = config.get("defaultFillChar");
		}

		// Options for comment bar fill character input box
		let fillOpts: InputBoxOptions = {
			prompt:
				"Enter the fill character (Default can be set in preferences)"
		};
		// Display input box to user and get the string that is entered
		let fillCharInput = await Window.showInputBox(fillOpts);

		// Set fill character with fallbacks.
		fillChar =
			fillCharInput && fillCharInput.length === 1
				? fillCharInput
				: defaultFillChar
				? defaultFillChar
				: "-";
	} else {
		// Else, use quick mode

		// ======================== Quick ======================= //

		// The quick pick options, for the style preset selection box
		let styleOpts: QuickPickOptions = {
			placeHolder: "Choose comment bar style preset (by number of lines):"
		};
		// Get all of the available quick mode presets, from the user's configuration
		let presetsConfig = Presets.getCommentBarPresets(config);

		// If there is at least one quick mode preset...
		if (_.isArray(presetsConfig) && presetsConfig.length > 0) {
			// Create an array of `QuickPickItem` objects from the array of
			// `QuickPreset` objects.
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
			// Display quick pick to user and get the item that is chosen
			let styleChoice:
				| QuickPickItem
				| undefined = await Window.showQuickPick(items, styleOpts);

			// Find the index of the preset style that has the same label as the user's choice
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
			// If a quick preset was found that matches the user's choice...
			if (presetIdx >= 0) {
				// Get the preset object at the index that was found
				let preset = presetsConfig[presetIdx];

				width = preset.width; // Set the width to the preset's width
				thickness = preset.thickness; // Set the thickness to the preset's thickness
				fillChar = preset.fillChar; // Set the fill character to the preset's fill character
				seamlessFill = _.isBoolean(preset.seamlessFill) // Set value of the seamless filling flag to the preset's value
					? preset.seamlessFill
					: false;
			}
		}
	}

	// ?: Is this block needed still?
	if (config.has("defaultFillChar")) {
		defaultFillChar = config.get("defaultFillChar");
	}

	// Check if the following conditions are met:
	//    - `commentDelimsOrError` is truthy
	//    - `fillChar` is truthy
	//    - `text` is not `null` 
	if (commentDelimsOrError && fillChar && text !== null) {

		// Generate the lines for a comment bar, using the
		// style that was entered by the user. Store the
		// returned array of lines in this local variable.
		let lines: string[] = buildCommentBar(
			width,
			text,
			thickness,
			fillChar,
			commentDelimsOrError,
			seamlessFill
		);

		// If the array of comment bar lines is truthy.
		if (lines) {
			// Replace the current text selection with a comment bar and wait for
			// the completion of the edit.
			await insertCommentBar(lines, editor, edtSelection);
		}
	} else { // Else, something was configured wrong...

		// Display an error to the user.
		Window.showErrorMessage("Invalid config!");
	}
}
