
import { WorkspaceConfiguration } from 'vscode';

export interface QuickPreset {
	label: string;
	fillChar: string;
	width: number;
	thickness: number;
	seamlessFill?: boolean;
}

export function getCommentBarPresets(config: WorkspaceConfiguration): QuickPreset[] {
	if (config.has("quickPresets")) {
		let cfg: QuickPreset[] | undefined = config.get("quickPresets");
		if (cfg) {
			return cfg;
		}
	}
	return [];
}