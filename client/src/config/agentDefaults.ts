/**
 * Configuration for predefined agent provider and model values
 * This allows setting fixed values that users cannot change
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
 * Default configuration - can be modified to set your preferred values
 */
export const AGENT_DEFAULTS: AgentDefaultsConfig = {
  usePredefined: true,
  provider: 'openai', // Change this to your preferred provider
  model: 'gpt-4', // Change this to your preferred model
  providerDisplayName: 'OpenAI',
  modelDisplayName: 'GPT-4',
};

/**
 * Helper function to get the current agent defaults configuration
 * In a real application, this could be loaded from environment variables or a config file
 */
export const getAgentDefaults = (): AgentDefaultsConfig => {
  return AGENT_DEFAULTS;
};

/**
 * Helper function to check if predefined values should be used
 */
export const shouldUsePredefinedValues = (): boolean => {
  return getAgentDefaults().usePredefined;
};
