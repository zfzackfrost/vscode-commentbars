'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode;

import {
	commands as Commands,
	ExtensionContext,
} from 'vscode';

import * as GenerateBar from './generateBar';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "commentbars" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let genAdvancedDisp = Commands.registerCommand('extension.generateAdvanced', async () => {
		await GenerateBar.commentBarGenerateCommand(true);
	});

	let genQuickDisp = Commands.registerCommand('extension.generateQuick', async () => {
		await GenerateBar.commentBarGenerateCommand(false);
	});
	context.subscriptions.push(genAdvancedDisp);
	context.subscriptions.push(genQuickDisp);
}

// this method is called when your extension is deactivated
export function deactivate() {
}