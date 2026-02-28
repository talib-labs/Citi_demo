'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoStore } from '@/store/demoStore';
import { mockCreateWebhook, mockCreateSubscription } from '@/lib/mock-api';

type TaskStatus = 'pending' | 'running' | 'done' | 'error';

interface Task {
  id: string;
  label: string;
  status: TaskStatus;
}

function TaskRow({ task }: { task: Task }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-2"
    >
      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
        {task.status === 'done' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>
        )}
        {task.status === 'running' && (
          <motion.div
            className="w-4 h-4 rounded-full border-2 border-[#7AB3E8] border-t-[#003087]"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {task.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-gray-200" />}
        {task.status === 'error' && <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs">!</div>}
      </div>
      <span className={`text-sm ${task.status === 'done' ? 'text-gray-700' : task.status === 'running' ? 'text-[#003087] font-medium' : 'text-gray-400'}`}>
        {task.label}
      </span>
    </motion.div>
  );
}

export default function Step4Subscribe() {
  const {
    selectedAccountIds,
    accounts,
    addWebhook,
    addSubscription,
    addApiLog,
    setLoading,
    setStep,
    webhooks,
    subscriptions,
    isLoading,
  } = useDemoStore();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [started, setStarted] = useState(false);
  const done = webhooks.length >= 2 && subscriptions.length >= selectedAccountIds.length;

  const STEP = 3;

  function updateTask(id: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  async function handleSubscribe() {
    setStarted(true);
    setLoading(true);

    // Build task list
    const allTasks: Task[] = [
      { id: 'whk-create', label: 'Create webhook: update.create', status: 'pending' },
      { id: 'whk-update', label: 'Create webhook: update.update', status: 'pending' },
      ...selectedAccountIds.map((id) => {
        const acc = accounts.find((a) => a.id === id);
        const name = acc?.liability.name || id.slice(-8);
        return { id: `sub-${id}`, label: `Subscribe: ${name}`, status: 'pending' as TaskStatus };
      }),
    ];
    setTasks(allTasks);

    // 1. Webhook update.create
    updateTask('whk-create', 'running');
    const { data: wh1, log: log1 } = await mockCreateWebhook('update.create', STEP);
    addApiLog(log1);
    addWebhook(wh1);
    updateTask('whk-create', 'done');

    // 2. Webhook update.update
    updateTask('whk-update', 'running');
    const { data: wh2, log: log2 } = await mockCreateWebhook('update.update', STEP);
    addApiLog(log2);
    addWebhook(wh2);
    updateTask('whk-update', 'done');

    // 3. Subscribe each account
    for (const accountId of selectedAccountIds) {
      const taskId = `sub-${accountId}`;
      updateTask(taskId, 'running');
      const { data: sub, log } = await mockCreateSubscription(accountId, STEP);
      addApiLog(log);
      addSubscription(sub);
      updateTask(taskId, 'done');
    }

    setLoading(false);
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Subscribe to Updates</h2>
          <p className="text-sm text-gray-500 mt-1">
            Set up webhooks and subscribe the selected accounts to real-time liability updates.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {!started ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#EEF4FB] flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔔</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Set Up Notifications</h3>
              <p className="text-sm text-gray-500 mb-2">
                Register webhooks and subscribe{' '}
                <span className="font-semibold text-[#003087]">{selectedAccountIds.length} account{selectedAccountIds.length !== 1 ? 's' : ''}</span>{' '}
                to receive real-time update events.
              </p>
              <div className="flex items-center justify-center gap-4 my-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#4A90D9]" />
                  update.create
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#4A90D9]" />
                  update.update
                </div>
              </div>
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="px-8 py-3 rounded-xl bg-[#003087] hover:bg-[#002570] text-white font-semibold text-sm transition-all shadow-md shadow-blue-200 active:scale-95"
              >
                Create Webhooks & Subscribe →
              </button>
            </div>
          ) : (
            <div className="p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Progress</p>
              <div className="divide-y divide-gray-100">
                {tasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>

              <AnimatePresence>
                {done && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 space-y-3"
                  >
                    {/* Summary */}
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-center">
                      <p className="font-semibold text-green-700">
                        ✅ Setup complete
                      </p>
                      <p className="text-xs text-green-600 mt-0.5">
                        {webhooks.length} webhooks · {subscriptions.length} subscriptions
                      </p>
                    </div>

                    {/* Webhook URLs */}
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs font-mono">
                      <p className="text-gray-500 mb-1.5 font-sans font-medium text-xs">Webhook endpoint</p>
                      <p className="text-[#003087] break-all">https://reference.example.app/webhook</p>
                    </div>

                    <button
                      onClick={() => setStep(4)}
                      className="w-full py-3 rounded-xl bg-[#003087] hover:bg-[#002570] text-white font-semibold text-sm transition-all shadow-md shadow-blue-200 active:scale-95"
                    >
                      Create Payment Instruments →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
