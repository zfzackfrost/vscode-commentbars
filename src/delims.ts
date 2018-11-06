'use strict';

import {
	WorkspaceConfiguration
} from 'vscode';

import * as _ from 'lodash';

export interface LanguageCommentDelims {
	start: string;
	end?: string;
}
export type CommentDelimsConfig = { [key: string]: LanguageCommentDelims };

export function isLanguageDelimsConfig(configOrError: LanguageCommentDelims | string): configOrError is LanguageCommentDelims {
	return (typeof configOrError !== "string") && ((<LanguageCommentDelims>configOrError).start !== undefined);
}

export function processCommentDelimsConfig(config: WorkspaceConfiguration, languageId: string): LanguageCommentDelims | string {
	let commentDelimsFallback: CommentDelimsConfig | null | undefined = null;
	let commentDelimsUser: CommentDelimsConfig | null | undefined = null;
	if (config.has('commentDelimsFallback')) {
		commentDelimsFallback = config.get('commentDelimsFallback');
		if (!commentDelimsFallback) {
			return "Failed to read the `commentbars.commentDelimsFallback` setting!";
		}
	} else {
		return "Could not find the `commentbars.commentDelimsFallback` setting!";
	}

	if (config.has('commentDelimsUser')) {
		commentDelimsUser = config.get('commentDelimsUser');
		if (!commentDelimsUser) {
			return "Failed to read the `commentbars.commentDelimsUser` setting!";
		}
	} else {
		return "Could not find the `commentbars.commentDelimsUser` setting!";
	}

	const commentDelims: CommentDelimsConfig = _.assign({}, commentDelimsFallback, commentDelimsUser);

	if (languageId in commentDelims) {
		return commentDelims[languageId];
	} else {
		return "Unsupported language!";
	}
}