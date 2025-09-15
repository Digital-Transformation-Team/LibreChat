# Agent Configuration

This directory contains configuration files for agent-related features in LibreChat.

## Predefined Agent Provider and Model Values

The agent system supports predefined provider and model values that can be set to prevent users from changing these settings during agent creation and editing.

### Files

- `agentDefaults.ts` - Main configuration file (modify this)
- `agentDefaults.example.ts` - Example configurations for different scenarios
- `README.md` - This documentation file

### How to Use

1. **Enable Predefined Values**: Set `usePredefined: true` in the configuration
2. **Set Provider and Model**: Specify the desired provider and model values
3. **Customize Display Names**: Optionally set custom display names for better UX

### Configuration Options

```typescript
export const AGENT_DEFAULTS: AgentDefaultsConfig = {
  usePredefined: true,           // Enable/disable predefined values
  provider: 'openai',            // Provider identifier
  model: 'gpt-4',               // Model identifier
  providerDisplayName: 'OpenAI', // Optional display name
  modelDisplayName: 'GPT-4',    // Optional display name
};
```

### Behavior

When `usePredefined: true`:
- Provider and model selection UI is hidden
- Values are automatically set to the predefined values
- Users cannot change these values
- A read-only display shows the current values

When `usePredefined: false`:
- Normal provider and model selection UI is shown
- Users can select from available providers and models
- Values are stored in localStorage for persistence

### Supported Providers

The system supports any provider configured in your LibreChat instance, including:
- OpenAI
- Anthropic (Claude)
- Google (Gemini)
- Azure OpenAI
- Cohere
- Hugging Face
- Replicate
- Together AI
- And more...

### Example Configurations

See `agentDefaults.example.ts` for various example configurations you can use as a starting point.

### Customization

To customize the predefined values:

1. Open `agentDefaults.ts`
2. Modify the `AGENT_DEFAULTS` object with your desired values
3. Save the file
4. The changes will take effect immediately in the agent creation and editing forms

### Troubleshooting

- Make sure the provider and model values match what's available in your LibreChat configuration
- Check the browser console for any errors if the values don't work as expected
- Verify that the provider is properly configured in your LibreChat instance
