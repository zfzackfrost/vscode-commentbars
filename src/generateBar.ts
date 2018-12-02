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

export function buildCommentBarLine(
	width: number,
	text: string | null | undefined,
	fillChar: string,
	commentDelims: Delims.LanguageCommentDelims,
	seamlessFill: boolean = false
): string {
	const tmpWidth = Math.round(width);

	const tmpText = _.isString(text) ? text.trim() : "";
	const insertedText = tmpText.length > 0 ? ` ${tmpText} ` : "";
	const insertedTextLen = insertedText.length;

	const lengthBeforeBase = Math.round((tmpWidth - insertedTextLen) / 2.0);
	const lengthAfterBase = tmpWidth - (insertedTextLen + lengthBeforeBase);

	let startCmt = `${commentDelims.start}`;
	let endCmt = commentDelims.end ? `${commentDelims.end}` : "";
	if (seamlessFill) {
		const trimmedStartCmt = startCmt.trimRight();
		const startCmtBorderChar = _.last(trimmedStartCmt);
		if (startCmtBorderChar === fillChar) {
			startCmt = trimmedStartCmt;
		}

		const trimmedEndCmt = endCmt.trimLeft();
		const endCmtBorderChar = _.first(trimmedEndCmt);
		if (endCmtBorderChar === fillChar) {
			endCmt = trimmedStartCmt;
		}
	}

	const startCmtLen = startCmt.length;
	const endCmtLen = endCmt.length;

	const lengthBefore = lengthBeforeBase - startCmtLen;
	const lengthAfter = lengthAfterBase - endCmtLen;

	const fillBefore = _.repeat(fillChar, lengthBefore);
	const fillAfter = _.repeat(fillChar, lengthAfter);

	const wordLineBefore = `${startCmt}${fillBefore}`;
	const wordLineAfter = `${fillAfter}${endCmt}`;
	const wordLine = `${wordLineBefore}${insertedText}${wordLineAfter}`;

	return wordLine;
}

export function buildCommentBar(
	width: number,
	text: string | null | undefined,
	thickness: number,
	fillChar: string,
	commentDelims: Delims.LanguageCommentDelims,
	seamlessFill: boolean = false
): string[] {
	let lines: string[] = [];

	let tmpThickness: number = thickness % 2 === 0 ? thickness + 1 : thickness;
	let centerIdx = Math.floor(tmpThickness / 2.0);

	for (let i = 0; i < tmpThickness; ++i) {
		if (i === centerIdx) {
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

	return lines;
}

async function insertCommentBar(
	lines: string[],
	editor: Editor,
	selection: Selection
): Promise<any> {
	await editor.edit((editBuilder: TextEditorEdit) => {
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
