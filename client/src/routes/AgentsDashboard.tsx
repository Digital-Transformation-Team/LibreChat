import React, { useState } from 'react';
import { useGetStartupConfig, useListAgentsQuery, useUpdateAgentMutation } from '~/data-provider';
import { processAgentOption } from '~/utils';
import { AgentCreationModal } from '~/components/Agents';
import { AgentEditModal } from '~/components/Agents';
import { useOutletContext } from 'react-router-dom';
import type { ContextType } from '~/common';
import { Button, useMediaQuery } from '@librechat/client';
import { OpenSidebar } from '~/components/Chat/Menus';
import AgentModal from '~/components/Agents/AgentModal';
import { ChatContext } from '~/Providers';
import { useChatHelpers } from '~/hooks';

// Removed - using AgentEditModal instead

function getAvatarUrl(avatar?: { filepath?: string; source?: string }) {
  if (!avatar?.filepath) return undefined;
  // use process.env.BASE_URL to get abspath
  return avatar.filepath;
}

export default function AgentsDashboard() {
  const { data: startupConfig } = useGetStartupConfig();
  const { data: agents = null, refetch } = useListAgentsQuery(undefined, {
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
  const [isCreate, setIsCreate] = useState(false);
  const { navVisible, setNavVisible } = useOutletContext<ContextType>();

  const chatHelpers = useChatHelpers();

  const handleOpenModal = (agent: any) => {
    setIsCreate(false);
    setSelectedAgent(agent);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAgent(null);
  };

  const handleOpenCreateModal = () => {
    setIsCreate(true);
    setModalOpen(true);
  };

  const handleCreateSuccess = () => {
    // Refresh the agents list
    refetch();
  };
  
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  return (
    <ChatContext.Provider value={chatHelpers}>
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
          <div
            className={`flex items-center gap-2 mb-2 ${
              !isSmallScreen ? 'transition-all duration-200 ease-in-out' : ''
            }`}
          >
            <OpenSidebar setNavVisible={setNavVisible} navVisible={navVisible} />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">
              Agents Dashboard
            </h2>
          </div>

          {/* Create Agent Button - positioned after statistics */}
          <div className="flex justify- mb-6 mt-6">
            {/* <button
              onClick={handleOpenCreateModal}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium shadow-sm"
            >
              + Create Agent
            </button> */}
            <Button
              size="lg"
              variant="ghost"
              className='pl-4 pr-6 rounded-lg outline-dashed outline-2 outline-gray-400'
              onClick={handleOpenCreateModal}>
                <p>
                  <span className='text-xl/4 mr-2'>+</span>
                  Create Agent
                </p>
            </Button>
          </div>

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

          {/* <AgentEditModal 
            open={modalOpen} 
            onClose={handleCloseModal} 
            agent={selectedAgent}
            onSuccess={handleCreateSuccess}
          /> */}
          {/* <AgentCreationModal 
            open={createModalOpen} 
            onClose={handleCloseCreateModal} 
            onSuccess={handleCreateSuccess}
          /> */}
          <AgentModal
            open={modalOpen}
            isCreate={isCreate}
            agent={selectedAgent}
            onClose={handleCloseModal}
            onSuccess={handleCreateSuccess}
          />
        </div>
      </div>
    </ChatContext.Provider>
  );
}
