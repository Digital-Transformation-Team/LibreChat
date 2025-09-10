import React from 'react';
import { useGetStartupConfig, useListAgentsQuery } from '~/data-provider';
import { processAgentOption } from '~/utils';

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

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-full w-full rounded-lg bg-transparent p-8 text-sm text-text-primary">
        <div className="absolute right-8 top-8 flex gap-8">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-blue-600 dark:text-blue-300">0</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Uses</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-green-600 dark:text-green-300">0 %</span>
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
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border-b px-4 py-2 text-left text-gray-500 dark:text-gray-400">
                Name
              </th>
              <th className="border-b px-4 py-2 text-left text-gray-500 dark:text-gray-400">
                Description
              </th>
              <th className="border-b px-4 py-2 text-left text-gray-500 dark:text-gray-400">
                Model
              </th>
            </tr>
          </thead>
          <tbody>
            {agents?.map((agent) => (
              <tr key={agent.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="px-4 py-2 font-semibold">{agent.name}</td>
                <td className="px-4 py-2">{agent.description ?? 'No description'}</td>
                <td className="px-4 py-2">{agent.model ?? 'Unknown model'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
