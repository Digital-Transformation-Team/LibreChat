import React, { useState } from 'react';
import { useGetStartupConfig, useListAgentsQuery } from '~/data-provider';
import { processAgentOption } from '~/utils';

function AgentModal({ open, onClose, agent }: { open: boolean; onClose: () => void; agent: any }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <button
          className="absolute right-4 top-4 text-2xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {/* form here */}
      </div>
    </div>
  );
}

function getAvatarUrl(avatar?: { filepath?: string; source?: string }) {
  if (!avatar?.filepath) return undefined;
  // use process.env.BASE_URL to get abspath
  return avatar.filepath;
}

export default function AgentsDashboard() {
  const { data: startupConfig } = useGetStartupConfig();
  const { data: agents = null } = useListAgentsQuery(undefined, {
    select: (res) =>
      res.data.map((agent) =>
        processAgentOption({
          agent: {
            ...agent,
            name: agent.name || agent.id,
          },
          instanceProjectId: startupConfig?.instanceProjectId,
        }),
      ),
  });

  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (agent: any) => {
    setSelectedAgent(agent);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAgent(null);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-full w-full rounded-lg bg-transparent p-8 text-sm text-text-primary">
        <div className="absolute right-8 top-8 flex gap-8">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-blue-600 dark:text-blue-300">0</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Uses</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-green-600 dark:text-green-300">0%</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Avg. Success Rate</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-purple-600 dark:text-purple-300">
              {agents ? agents.length : 0}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Active Agents</span>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold text-gray-700 dark:text-gray-200">
          Agents Dashboard
        </h2>

        {/* grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {agents?.map((agent) => (
            <div
              key={agent.id}
              className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
              onClick={() => handleOpenModal(agent)}
            >
              {/* agent avatar */}
              {agent.avatar?.filepath ? (
                <div className="mb-2 flex justify-center">
                  <img
                    src={getAvatarUrl(agent.avatar)}
                    alt={agent.name ?? `${agent.id}_avatar`}
                    className="h-16 w-16 rounded-full border border-gray-200 object-cover dark:border-gray-700"
                  />
                </div>
              ) : (
                <div className="mb-2 flex justify-center">
                  <span className="text-4xl text-gray-400">🤖</span>
                </div>
              )}

              {/* center text */}
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  {agent.name}
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {agent.description || 'No description'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <AgentModal open={modalOpen} onClose={handleCloseModal} agent={selectedAgent} />
      </div>
    </div>
  );
}
