import React from 'react';

type Agent = {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  usageCount: number;
  lastUsed: string;
  successRate: number;
};

const testAgents: Agent[] = [
  {
    id: 1,
    name: 'GPT-4 Assistant',
    status: 'active',
    usageCount: 120,
    lastUsed: '2025-09-10 08:00',
    successRate: 98,
  },
  {
    id: 2,
    name: 'Claude Haiku',
    status: 'inactive',
    usageCount: 45,
    lastUsed: '2025-09-01 12:30',
    successRate: 95,
  },
  {
    id: 3,
    name: 'Custom Agent',
    status: 'active',
    usageCount: 62,
    lastUsed: '2025-09-08 17:20',
    successRate: 92,
  },
];

export default function AgentsDashboard() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-full w-full rounded-lg bg-transparent p-8 text-sm text-text-primary">
        {/* Блок summary справа сверху */}
        <div className="absolute right-8 top-8 flex gap-8">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-blue-600 dark:text-blue-300">
              {testAgents.reduce((acc, a) => acc + a.usageCount, 0)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Uses</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-green-600 dark:text-green-300">
              {Math.round(
                testAgents.reduce((acc, a) => acc + a.successRate, 0) / testAgents.length,
              )}
              %
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Avg. Success Rate</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-purple-600 dark:text-purple-300">
              {testAgents.filter((a) => a.status === 'active').length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Active Agents</span>
          </div>
        </div>
        {/* Основная таблица */}
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
                Status
              </th>
              <th className="border-b px-4 py-2 text-left text-gray-500 dark:text-gray-400">
                Usage
              </th>
              <th className="border-b px-4 py-2 text-left text-gray-500 dark:text-gray-400">
                Last Used
              </th>
              <th className="border-b px-4 py-2 text-left text-gray-500 dark:text-gray-400">
                Success Rate
              </th>
            </tr>
          </thead>
          <tbody>
            {testAgents.map((agent) => (
              <tr key={agent.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="px-4 py-2 font-semibold">{agent.name}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                      agent.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {agent.status}
                  </span>
                </td>
                <td className="px-4 py-2">{agent.usageCount}</td>
                <td className="px-4 py-2">{agent.lastUsed}</td>
                <td className="px-4 py-2">{agent.successRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
