
import {
	WorkspaceConfiguration
} from 'vscode';

import * as _ from 'lodash';


/**
 * The configured comment delimiters for a language
 *
 * @export
 * @interface LanguageCommentDelims
 * @property {string} start - Starting comment delimiter
 * @property {string} [end] - Ending comment delimiter. Optional. 
 */
export interface LanguageCommentDelims {
	start: string;
	end?: string;
}

/**
 * Type of comment delimiter configuration object
 */
export type CommentDelimsConfig = { [key: string]: LanguageCommentDelims };

/**
 * Type guard to check the input is a valid comment delimiter configuration object.
 *
 * @export
 * @param {(LanguageCommentDelims | string)} configOrError - A comment delimiter configuration object or an error string
 * @returns {configOrError is LanguageCommentDelims} - `true` if `configOrError` is a valid
 * comment delimiter configuration, `false` otherwise.
 */
export function isLanguageDelimsConfig(configOrError: LanguageCommentDelims | string): configOrError is LanguageCommentDelims {
	return (typeof configOrError !== "string") && (<LanguageCommentDelims>configOrError).start !== undefined);
}


/**
 * Get the comment delimiters configuration, accounting for user overrides
 *
 * @export
 * @param {WorkspaceConfiguration} config - The workspace configuration for this extension
 * @param {string} languageId - The language ID to get the comment delimiters for
 * @returns {(LanguageCommentDelims | string)} The comment delimiters for `languageId` or an error string on failure
 */
export function processCommentDelimsConfig(config: WorkspaceConfiguration, languageId: string): LanguageCommentDelims | string {

	// Local variable for fallback comment delimiters
	let commentDelimsFallback: CommentDelimsConfig | null | undefined = null;
	// Local variable for user comment delimiters
	let commentDelimsUser: CommentDelimsConfig | null | undefined = null;

	// If the configuration has fallback delimiters...
	if (config.has('commentDelimsFallback')) {
		// Get the fallback delimiters
		commentDelimsFallback = config.get('commentDelimsFallback');
		// If the fallback delimiters are invalid...
		if (!commentDelimsFallback) {
			// Return an error message
			return "Failed to read the `commentbars.commentDelimsFallback` setting!";
		}
	} else { // Else, does not have fallback delimiters

		// Return an error message
		return "Could not find the `commentbars.commentDelimsFallback` setting!";
	}

	// If the configuration has user delimiters...
	if (config.has('commentDelimsUser')) {
		// Get the user delimiters
		commentDelimsUser = config.get('commentDelimsUser');
		// If the user delimiters are invalid...
		if (!commentDelimsUser) {
			// Return an error message
			return "Failed to read the `commentbars.commentDelimsUser` setting!";
		}
	} else { // Else, does not have fallback delimiters

		// Return an error message
		return "Could not find the `commentbars.commentDelimsUser` setting!";
	}

	// Use fallback delimiters as default, but user delimiters take priority
	const commentDelims: CommentDelimsConfig = _.assign({}, commentDelimsFallback, commentDelimsUser);

	// If language is supported...
	if (languageId in commentDelims) {
		// Return the comment delimiters for the requested language ID
		return commentDelims[languageId];
	} else { // Else, unsupported language...
		// Return an error message
		return "Unsupported language!";
	}
}