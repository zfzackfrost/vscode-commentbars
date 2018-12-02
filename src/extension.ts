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

	// Register command: "commentbars.generateAdvanced"
	context.subscriptions.push(Commands.registerCommand('commentbars.generateAdvanced',  () => {
		// Execute command function
		GenerateBar.commentBarGenerateCommand(true);
	}));

	// Register command: "commentbars.generateQuick"
	context.subscriptions.push(Commands.registerCommand('commentbars.generateQuick', () => {
		// Execute command function
		GenerateBar.commentBarGenerateCommand(false);
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {
}