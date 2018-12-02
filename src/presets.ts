import { WorkspaceConfiguration } from "vscode";

/**
 * The format for user configuration of the presets for "Quick" mode
 *
 * @export
 * @interface QuickPreset
 * @property {string} label - The name of the preset to display in the selection menu
 * @property {string} fillChar - The fill character to use when this preset style is selected
 * @property {number} width - The width of comment bars created using this preset style
 * @property {number} thickness - The number of lines tall the comment bar will be, when
 * using this preset style. This value will be rounded up to the nearest odd
 * number in order to keep the text centered vertically.
 * @property {boolean} [seamlessFill=false] - Enable seamless filling? 
 */
export interface QuickPreset {
	label: string;
	fillChar: string;
	width: number;
	thickness: number;
	seamlessFill?: boolean;
}

/**
 * Get the relevant user configuration of the presets for "Quick" mode
 *
 * @export
 * @param {WorkspaceConfiguration} config
 * @returns {QuickPreset[]}
 */
export function getCommentBarPresets(
	config: WorkspaceConfiguration
): QuickPreset[] {
	// Get value of user configuration for 	quick presets
	let cfg: QuickPreset[] | undefined = config.get("quickPresets");

	// If quick preset configuration is valid...
	if (typeof cfg !== "undefined") {
		// Return quick preset configuration...
		return cfg;
	}
	// Else, return empty array as default
	return [];
}
