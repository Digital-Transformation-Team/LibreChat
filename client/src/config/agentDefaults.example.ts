/**
 * Example configuration for predefined agent provider and model values
 * Copy this file to agentDefaults.ts and modify the values as needed
 */

export interface AgentDefaultsConfig {
  /** Whether to use predefined values (true) or allow user selection (false) */
  usePredefined: boolean;
  /** Predefined provider value */
  provider: string;
  /** Predefined model value */
  model: string;
  /** Display name for the provider (optional, defaults to provider value) */
  providerDisplayName?: string;
  /** Display name for the model (optional, defaults to model value) */
  modelDisplayName?: string;
}

/**
 * Example configurations for different scenarios
 */

// Example 1: OpenAI GPT-4
export const OPENAI_GPT4_CONFIG: AgentDefaultsConfig = {
  usePredefined: true,
  provider: 'openai',
  model: 'gpt-4',
  providerDisplayName: 'OpenAI',
  modelDisplayName: 'GPT-4',
};

// Example 2: Anthropic Claude
export const ANTHROPIC_CLAUDE_CONFIG: AgentDefaultsConfig = {
  usePredefined: true,
  provider: 'anthropic',
  model: 'claude-3-sonnet-20240229',
  providerDisplayName: 'Anthropic',
  modelDisplayName: 'Claude 3 Sonnet',
};

// Example 3: Google Gemini
export const GOOGLE_GEMINI_CONFIG: AgentDefaultsConfig = {
  usePredefined: true,
  provider: 'google',
  model: 'gemini-pro',
  providerDisplayName: 'Google',
  modelDisplayName: 'Gemini Pro',
};

// Example 4: Allow user selection (disable predefined values)
export const USER_SELECTION_CONFIG: AgentDefaultsConfig = {
  usePredefined: false,
  provider: '',
  model: '',
};

/**
 * Instructions for customization:
 * 
 * 1. Copy this file to agentDefaults.ts
 * 2. Choose one of the example configurations above or create your own
 * 3. Update the AGENT_DEFAULTS export in agentDefaults.ts with your chosen configuration
 * 
 * Supported providers include:
 * - openai
 * - anthropic
 * - google
 * - azure
 * - cohere
 * - huggingface
 * - replicate
 * - together
 * - And any other providers configured in your LibreChat instance
 * 
 * Make sure the provider and model values match what's available in your LibreChat configuration.
 */
