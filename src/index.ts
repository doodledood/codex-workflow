/**
 * Codex Workflow - Skills and Plugins
 *
 * Main entry point for the codex-workflow package.
 */

export * from "./skills/index.js";
export * from "./plugins/index.js";

export interface Skill {
  name: string;
  description: string;
  execute: (context: SkillContext) => Promise<SkillResult>;
}

export interface Plugin {
  name: string;
  version: string;
  skills: Skill[];
  initialize?: () => Promise<void>;
  shutdown?: () => Promise<void>;
}

export interface SkillContext {
  args?: Record<string, unknown>;
  env?: Record<string, string>;
}

export interface SkillResult {
  success: boolean;
  output?: string;
  error?: string;
}
