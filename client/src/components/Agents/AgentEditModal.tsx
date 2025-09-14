import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm, FormProvider, Controller, useWatch } from 'react-hook-form';
import { useToastContext } from '@librechat/client';
import { useUpdateAgentMutation } from '~/data-provider/Agents/mutations';
import { useLocalize } from '~/hooks';
import { getDefaultAgentFormValues, createProviderOption } from '~/utils';
import type { AgentForm, StringOption, IconComponentTypes } from '~/common';
import { cn, removeFocusOutlines, defaultTextProps, getEndpointField, getIconKey } from '~/utils';
import { EModelEndpoint, isAssistantsEndpoint, EToolResources, mergeFileConfig, fileConfig as defaultFileConfig } from 'librechat-data-provider';
import { useGetStartupConfig, useGetEndpointsQuery, useGetFileConfig } from '~/data-provider';
import { icons } from '~/hooks/Endpoint/Icons';
import AgentAvatar from '~/components/SidePanel/Agents/AgentAvatar';
import Instructions from '~/components/SidePanel/Agents/Instructions';
import FileContext from '~/components/SidePanel/Agents/FileContext';
import SearchForm from '~/components/SidePanel/Agents/Search/Form';
import FileSearch from '~/components/SidePanel/Agents/FileSearch';
import Artifacts from '~/components/SidePanel/Agents/Artifacts';
import CodeForm from '~/components/SidePanel/Agents/Code/Form';
import useAgentCapabilities from '~/hooks/Agents/useAgentCapabilities';
import { useFileMapContext, useChatContext } from '~/Providers';
import { useFileHandling, useLazyEffect } from '~/hooks';
import FileRow from '~/components/Chat/Input/Files/FileRow';
import { AttachmentIcon } from '@librechat/client';
import type { ExtendedFile } from '~/common';

const labelClass = 'mb-2 text-token-text-primary block font-medium';
const inputClass = cn(
  defaultTextProps,
  'flex w-full px-3 py-2 border-border-light bg-surface-secondary focus-visible:ring-2 focus-visible:ring-ring-primary',
  removeFocusOutlines,
);

interface AgentEditModalProps {
  open: boolean;
  onClose: () => void;
  agent: any;
  onSuccess?: () => void;
}

export default function AgentEditModal({ open, onClose, agent, onSuccess }: AgentEditModalProps) {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const fileMap = useFileMapContext();
  const { setFilesLoading } = useChatContext();
  
  // Mock setFilesLoading function for FileRow compatibility
  const mockSetFilesLoading = (loading: boolean) => {
    // Simple mock function - we don't need complex loading states in modals
    console.log('File loading state:', loading);
  };
  const [showToolDialog, setShowToolDialog] = useState(false);
  const [contextFiles, setContextFiles] = useState<Map<string, ExtendedFile>>(new Map());
  const [knowledgeFiles, setKnowledgeFiles] = useState<Map<string, ExtendedFile>>(new Map());
  const [codeFiles, setCodeFiles] = useState<Map<string, ExtendedFile>>(new Map());

  const { data: startupConfig } = useGetStartupConfig();
  const { data: endpointsConfig } = useGetEndpointsQuery();
  const { data: fileConfig = defaultFileConfig } = useGetFileConfig({
    select: (data) => mergeFileConfig(data),
  });
  const agentsConfig = null; // We'll handle this differently for now
  const allTools = {}; // We'll handle tools differently for now

  const methods = useForm<AgentForm>({
    defaultValues: getDefaultAgentFormValues(),
  });

  const { control, handleSubmit, reset, setValue } = methods;
  
  const updateMutation = useUpdateAgentMutation();

  // Watch form values
  const provider = useWatch({ control, name: 'provider' });
  const model = useWatch({ control, name: 'model' });
  const tools = useWatch({ control, name: 'tools' });
  const agent_id = useWatch({ control, name: 'id' });

  // Simple file upload handlers
  const handleContextFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      files.forEach((file) => {
        const fileId = `context_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const extendedFile: ExtendedFile = {
          file_id: fileId,
          file: file,
          filepath: file.name,
          type: file.type,
          size: file.size,
          progress: 1,
        };
        setContextFiles(prev => new Map(prev).set(fileId, extendedFile));
      });
      event.target.value = '';
    }
  };

  const handleKnowledgeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      files.forEach((file) => {
        const fileId = `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const extendedFile: ExtendedFile = {
          file_id: fileId,
          file: file,
          filepath: file.name,
          type: file.type,
          size: file.size,
          progress: 1,
        };
        setKnowledgeFiles(prev => new Map(prev).set(fileId, extendedFile));
      });
      event.target.value = '';
    }
  };

  const handleCodeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      files.forEach((file) => {
        const fileId = `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const extendedFile: ExtendedFile = {
          file_id: fileId,
          file: file,
          filepath: file.name,
          type: file.type,
          size: file.size,
          progress: 1,
        };
        setCodeFiles(prev => new Map(prev).set(fileId, extendedFile));
      });
      event.target.value = '';
    }
  };

  const {
    ocrEnabled,
    codeEnabled,
    toolsEnabled,
    actionsEnabled,
    artifactsEnabled,
    webSearchEnabled,
    fileSearchEnabled,
  } = useAgentCapabilities(undefined);

  // Force enable file capabilities for modal
  const showFileUploads = true;

  const allowedProviders = useMemo(
    () => new Set<string>(),
    [],
  );

  const providers = useMemo(
    () =>
      Object.keys(endpointsConfig ?? {})
        .filter(
          (key) =>
            !isAssistantsEndpoint(key) &&
            (allowedProviders.size > 0 ? allowedProviders.has(key) : true) &&
            key !== EModelEndpoint.agents &&
            key !== EModelEndpoint.chatGPTBrowser &&
            key !== EModelEndpoint.gptPlugins,
        )
        .map((provider) => createProviderOption(provider)),
    [endpointsConfig, allowedProviders],
  );

  // Populate form with agent data when agent changes
  useEffect(() => {
    if (agent && open) {
      const formData = {
        id: agent.id || '',
        name: agent.name || '',
        description: agent.description || '',
        instructions: agent.instructions || '',
        model: agent.model || '',
        provider: agent.provider || '',
        tools: agent.tools || [],
        model_parameters: agent.model_parameters || {},
        artifacts: agent.artifacts || '',
        agent_ids: agent.agent_ids || [],
        end_after_tools: agent.end_after_tools || false,
        hide_sequential_outputs: agent.hide_sequential_outputs || false,
        recursion_limit: agent.recursion_limit || 5,
        conversation_starters: agent.conversation_starters || [],
        isCollaborative: agent.isCollaborative || false,
        execute_code: agent.tools?.includes('execute_code') || false,
        file_search: agent.tools?.includes('file_search') || false,
        web_search: agent.tools?.includes('web_search') || false,
      };
      
      // Reset form with agent data
      reset(formData);
    }
  }, [agent, open, reset]);

  const onSubmit = useCallback(
    async (data: AgentForm) => {
      if (!agent?.id) {
        showToast({
          message: 'No agent ID found',
          status: 'error',
        });
        return;
      }

      try {
        const tools = data.tools ?? [];

        // Add system tools based on capabilities
        if (data.execute_code === true) {
          tools.push('execute_code');
        }
        if (data.file_search === true) {
          tools.push('file_search');
        }
        if (data.web_search === true) {
          tools.push('web_search');
        }

        const {
          name,
          artifacts,
          description,
          instructions,
          model: _model,
          model_parameters,
          provider: _provider,
          agent_ids,
          end_after_tools,
          hide_sequential_outputs,
          recursion_limit,
          conversation_starters,
          isCollaborative,
        } = data;

        const modelValue = _model ?? '';
        const providerValue =
          (typeof _provider === 'string' ? _provider : (_provider as StringOption)?.value) ?? '';

        if (!providerValue || !modelValue) {
          showToast({
            message: localize('com_agents_missing_provider_model'),
            status: 'error',
          });
          return;
        }

        await updateMutation.mutateAsync({
          agent_id: agent.id,
          data: {
            name,
            artifacts,
            description,
            instructions,
            model: modelValue,
            tools,
            provider: providerValue,
            model_parameters,
            agent_ids,
            end_after_tools,
            hide_sequential_outputs,
            recursion_limit,
            // conversation_starters, // Temporarily disabled until backend supports it
            // isCollaborative, // Temporarily disabled until backend supports it
          },
        });
        
        showToast({
          message: localize('com_assistants_update_success'),
          status: 'success',
        });
        onSuccess?.();
        onClose();
      } catch (error) {
        showToast({
          message: localize('com_assistants_update_error'),
          status: 'error',
        });
      }
    },
    [updateMutation, showToast, localize, onSuccess, onClose, agent?.id],
  );

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleProviderSelect = useCallback((selectedProvider: StringOption) => {
    setValue('provider', selectedProvider);
    setValue('model', '');
  }, [setValue]);

  const handleModelSelect = useCallback((selectedModel: string) => {
    setValue('model', selectedModel);
  }, [setValue]);

  const providerValue = typeof provider === 'string' ? provider : provider?.value;
  let Icon: IconComponentTypes | null | undefined;
  let endpointType: EModelEndpoint | undefined;
  let endpointIconURL: string | undefined;
  let iconKey: string | undefined;

  if (providerValue !== undefined) {
    endpointType = getEndpointField(endpointsConfig, providerValue as string, 'type');
    endpointIconURL = getEndpointField(endpointsConfig, providerValue as string, 'iconURL');
    iconKey = getIconKey({
      endpoint: providerValue as string,
      endpointsConfig,
      endpointType,
      endpointIconURL,
    });
    Icon = icons[iconKey];
  }

  // Determine what tools to show
  const selectedToolIds = tools ?? [];
  const visibleToolIds = new Set(selectedToolIds);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] rounded-lg bg-white shadow-lg dark:bg-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {localize('com_ui_edit')} {localize('com_ui_agent')}
          </h2>
          <button
            className="text-2xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="space-y-6">
                {/* Avatar & Name */}
                <div className="mb-4">
                  <AgentAvatar
                    agent_id={agent?.id || ''}
                    createMutation={updateMutation as any}
                    avatar={agent?.avatar ?? null}
                  />
                  <label className={labelClass} htmlFor="name">
                    {localize('com_ui_name')} <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        value={field.value ?? ''}
                        maxLength={256}
                        className={inputClass}
                        id="name"
                        type="text"
                        placeholder={localize('com_agents_name_placeholder')}
                        aria-label="Agent name"
                      />
                    )}
                  />
                  <Controller
                    name="id"
                    control={control}
                    render={({ field }) => (
                      <p className="h-3 text-xs italic text-text-secondary mt-1" aria-live="polite">
                        ID: {field.value}
                      </p>
                    )}
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className={labelClass} htmlFor="description">
                    {localize('com_ui_description')}
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        value={field.value ?? ''}
                        maxLength={512}
                        className={inputClass}
                        id="description"
                        type="text"
                        placeholder={localize('com_agents_description_placeholder')}
                        aria-label="Agent description"
                      />
                    )}
                  />
                </div>

                {/* Instructions */}
                <Instructions />

                {/* Model and Provider Selection */}
                <div className="mb-4">
                  <label className={labelClass} htmlFor="provider">
                    {localize('com_ui_model')} <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {/* Provider Selection */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Provider
                      </label>
                      <select
                        value={providerValue || ''}
                        onChange={(e) => {
                          const selectedProvider = providers.find(p => p.value === e.target.value);
                          if (selectedProvider) {
                            handleProviderSelect(selectedProvider);
                          }
                        }}
                        className={inputClass}
                      >
                        <option value="">Select Provider</option>
                        {providers.map((provider) => (
                          <option key={provider.value} value={provider.value}>
                            {provider.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Model Selection */}
                    {providerValue && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Model
                        </label>
                        <button
                          type="button"
                          className="btn btn-neutral border-token-border-light relative h-10 w-full rounded-lg font-medium"
                          onClick={() => {
                            // This would open a model selection dialog
                            // For now, we'll use a simple input
                          }}
                        >
                          <div className="flex w-full items-center gap-2">
                            {Icon && (
                              <div className="shadow-stroke relative flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-black dark:bg-white">
                                <Icon
                                  className="h-2/3 w-2/3"
                                  endpoint={providerValue as string}
                                  endpointType={endpointType}
                                  iconURL={endpointIconURL}
                                />
                              </div>
                            )}
                            <span>{model || localize('com_ui_select_model')}</span>
                          </div>
                        </button>
                        <Controller
                          name="model"
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <input
                              {...field}
                              value={field.value ?? ''}
                              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                              placeholder="Enter model name (e.g., gpt-4, claude-3)"
                              aria-label="Model name"
                            />
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Capabilities */}
                {(codeEnabled ||
                  fileSearchEnabled ||
                  artifactsEnabled ||
                  ocrEnabled ||
                  webSearchEnabled) && (
                  <div className="mb-4 flex w-full flex-col items-start gap-3">
                    <label className="text-token-text-primary block font-medium">
                      {localize('com_assistants_capabilities')}
                    </label>
                    {/* Code Execution */}
                    {codeEnabled && <CodeForm agent_id={agent?.id || ''} files={[]} />}
                    {/* Web Search */}
                    {webSearchEnabled && <SearchForm />}
                    {/* File Context (OCR) */}
                    {ocrEnabled && <FileContext agent_id={agent?.id || ''} files={[]} />}
                    {/* Artifacts */}
                    {artifactsEnabled && <Artifacts />}
                    {/* File Search */}
                    {fileSearchEnabled && <FileSearch agent_id={agent?.id || ''} files={[]} />}
                  </div>
                )}

                {/* File Upload Sections */}
                <div className="mb-4">
                  <label className={labelClass}>
                    File Management
                  </label>
                    <div className="space-y-4">
                      {/* OCR Files */}
                      <div className="border rounded-lg p-4">
                        <h4 className="text-sm font-medium mb-2">OCR Files (Context)</h4>
                        <FileRow
                          files={contextFiles}
                          setFiles={setContextFiles}
                          setFilesLoading={mockSetFilesLoading}
                          agent_id={agent?.id || ''}
                          tool_resource={EToolResources.ocr}
                          Wrapper={({ children }) => <div className="flex flex-wrap gap-2">{children}</div>}
                        />
                        <button
                          type="button"
                          className="mt-2 btn btn-neutral border-token-border-light relative h-9 w-full rounded-lg font-medium"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.multiple = true;
                            input.onchange = (e) => handleContextFileChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
                            input.click();
                          }}
                        >
                          <div className="flex w-full items-center justify-center gap-1">
                            <AttachmentIcon className="text-token-text-primary h-4 w-4" />
                            Upload OCR Files
                          </div>
                        </button>
                      </div>

                      {/* File Search Files */}
                      <div className="border rounded-lg p-4">
                        <h4 className="text-sm font-medium mb-2">Knowledge Files (Search)</h4>
                        <FileRow
                          files={knowledgeFiles}
                          setFiles={setKnowledgeFiles}
                          setFilesLoading={mockSetFilesLoading}
                          agent_id={agent?.id || ''}
                          tool_resource={EToolResources.file_search}
                          Wrapper={({ children }) => <div className="flex flex-wrap gap-2">{children}</div>}
                        />
                        <button
                          type="button"
                          className="mt-2 btn btn-neutral border-token-border-light relative h-9 w-full rounded-lg font-medium"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.multiple = true;
                            input.onchange = (e) => handleKnowledgeFileChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
                            input.click();
                          }}
                        >
                          <div className="flex w-full items-center justify-center gap-1">
                            <AttachmentIcon className="text-token-text-primary h-4 w-4" />
                            Upload Knowledge Files
                          </div>
                        </button>
                      </div>

                      {/* Code Files */}
                      <div className="border rounded-lg p-4">
                        <h4 className="text-sm font-medium mb-2">Code Files</h4>
                        <FileRow
                          files={codeFiles}
                          setFiles={setCodeFiles}
                          setFilesLoading={mockSetFilesLoading}
                          agent_id={agent?.id || ''}
                          tool_resource={EToolResources.execute_code}
                          Wrapper={({ children }) => <div className="flex flex-wrap gap-2">{children}</div>}
                        />
                        <button
                          type="button"
                          className="mt-2 btn btn-neutral border-token-border-light relative h-9 w-full rounded-lg font-medium"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.multiple = true;
                            input.onchange = (e) => handleCodeFileChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
                            input.click();
                          }}
                        >
                          <div className="flex w-full items-center justify-center gap-1">
                            <AttachmentIcon className="text-token-text-primary h-4 w-4" />
                            Upload Code Files
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                {/* Tools */}
                {toolsEnabled && (
                  <div className="mb-4">
                    <label className={labelClass}>
                      {localize('com_ui_tools')}
                    </label>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {selectedToolIds.map((toolId) => (
                          <span
                            key={toolId}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                          >
                            {toolId}
                            <button
                              type="button"
                              onClick={() => {
                                const newTools = tools?.filter((t) => t !== toolId) ?? [];
                                setValue('tools', newTools);
                              }}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowToolDialog(true)}
                        className="btn btn-neutral border-token-border-light relative h-10 w-full rounded-lg font-medium"
                      >
                        {localize('com_assistants_add_tools')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Conversation Starters */}
                <div className="mb-4">
                  <label className={labelClass}>
                    Conversation Starters
                  </label>
                  <Controller
                    name="conversation_starters"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <textarea
                          {...field}
                          value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                          onChange={(e) => {
                            const starters = e.target.value.split('\n').filter(s => s.trim());
                            field.onChange(starters);
                          }}
                          className={inputClass}
                          rows={3}
                          placeholder="Enter conversation starters, one per line"
                          aria-label="Conversation starters"
                        />
                        <p className="text-xs text-gray-500">
                          Enter conversation starters, one per line
                        </p>
                      </div>
                    )}
                  />
                </div>

                {/* Advanced Settings */}
                <div className="mb-4">
                  <label className={labelClass}>
                    Advanced Settings
                  </label>
                  <div className="space-y-3">
                    {/* Recursion Limit */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Recursion Limit
                      </label>
                      <Controller
                        name="recursion_limit"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            value={field.value ?? ''}
                            type="number"
                            min="1"
                            max="10"
                            className={inputClass}
                            placeholder="5"
                            aria-label="Recursion limit"
                          />
                        )}
                      />
                    </div>

                    {/* End After Tools */}
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="end_after_tools"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="checkbox"
                            checked={field.value ?? false}
                            className="rounded"
                            aria-label="End after tools"
                          />
                        )}
                      />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        End after tools
                      </label>
                    </div>

                    {/* Hide Sequential Outputs */}
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="hide_sequential_outputs"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="checkbox"
                            checked={field.value ?? false}
                            className="rounded"
                            aria-label="Hide sequential outputs"
                          />
                        )}
                      />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hide sequential outputs
                      </label>
                    </div>

                    {/* Collaborative Mode */}
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="isCollaborative"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            checked={field.value ?? false}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            className="rounded"
                            aria-label="Collaborative mode"
                          />
                        )}
                      />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Collaborative mode
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  {localize('com_ui_cancel')}
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {updateMutation.isLoading ? localize('com_ui_loading') : localize('com_ui_save')}
                </button>
              </div>
            </form>
          </FormProvider>
        </div>

        {/* Tool Selection Dialog - Simplified for now */}
        {showToolDialog && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Select Tools</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium">Available Tools:</label>
                <div className="space-y-1">
                  {['file_search', 'web_search', 'execute_code'].map((tool) => (
                    <label key={tool} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedToolIds.includes(tool)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setValue('tools', [...(tools ?? []), tool]);
                          } else {
                            setValue('tools', tools?.filter(t => t !== tool) ?? []);
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{tool}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowToolDialog(false)}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowToolDialog(false)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
