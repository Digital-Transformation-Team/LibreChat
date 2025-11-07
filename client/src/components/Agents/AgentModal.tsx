import { useLocalize } from "~/hooks";
import { useToastContext } from '@librechat/client';
import AgentPanel from "../SidePanel/Agents/AgentPanel";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { AgentForm } from "~/common";
import { getDefaultAgentFormValues } from "~/utils";
import { AgentPanelProvider } from "~/Providers";

interface AgentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  agent?: any;
  isCreate?: boolean;
}

export default function AgentModal({ open, onClose, onSuccess, isCreate, agent }: AgentModalProps) {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const methods = useForm<AgentForm>({
    defaultValues: getDefaultAgentFormValues(),
  });
  const { control, handleSubmit, reset, setValue } = methods;

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  if (!open) return null;

  return <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
    <div className="relative w-full max-w-6xl max-h-[90vh] rounded-lg bg-white shadow-lg dark:bg-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {isCreate && localize('com_ui_create')} {!isCreate && localize('com_ui_edit')} {localize('com_ui_agent')}
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
      <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-5">
        <AgentPanelProvider>
          <AgentPanel onSuccess={handleClose} showSelection={false} selectedAgentId={isCreate?null:agent.id}></AgentPanel>
        </AgentPanelProvider>
      </div>
    </div>
  </div>;
}