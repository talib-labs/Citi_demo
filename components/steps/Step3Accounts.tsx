'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoStore } from '@/store/demoStore';
import { mockGetAccounts } from '@/lib/mock-api';
import { Account, getAccountFinancials } from '@/types';

function fmt(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

const TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  student_loans: { label: 'Student Loans', icon: '🎓', color: 'indigo' },
  credit_card: { label: 'Credit Card', icon: '💳', color: 'blue' },
  auto_loan: { label: 'Auto Loan', icon: '🚗', color: 'green' },
  mortgage: { label: 'Mortgage', icon: '🏠', color: 'purple' },
  personal_loan: { label: 'Personal Loan', icon: '💰', color: 'orange' },
};

function AccountCard({ account, selected, onToggle, index }: {
  account: Account;
  selected: boolean;
  onToggle: () => void;
  index: number;
}) {
  const meta = TYPE_META[account.liability.type] || { label: account.liability.type, icon: '🏦', color: 'gray' };
  const fin = getAccountFinancials(account);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={onToggle}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        selected
          ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
          selected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'
        }`}>
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <span className="text-xl flex-shrink-0">{meta.icon}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{account.liability.name}</p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">••••{account.liability.mask}</p>
            </div>
            {fin && (
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-900">{fmt(fin.balance)}</p>
                <p className="text-xs text-gray-500">balance</p>
              </div>
            )}
          </div>

          {fin && (
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {fin.interestRate !== undefined && (
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                  {fin.interestRateMin !== undefined
                    ? `${fin.interestRateMin}% – ${fin.interestRate}% APR`
                    : `${fin.interestRate}% APR`}
                </span>
              )}
              {fin.minPayment !== undefined && (
                <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  Min: {fmt(fin.minPayment)}/mo
                </span>
              )}
              {fin.dueDate && (
                <span className="text-xs text-gray-500">Due {fin.dueDate}</span>
              )}
            </div>
          )}

          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
              {account.status}
            </span>
            <span className="text-xs text-gray-500">{meta.label}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Step3Accounts() {
  const {
    entityId,
    accounts,
    setAccounts,
    selectedAccountIds,
    toggleSelectedAccount,
    setSelectedAccountIds,
    addApiLog,
    setLoading,
    setError,
    isLoading,
    error,
    setStep,
  } = useDemoStore();

  const [fetched, setFetched] = useState(accounts.length > 0);

  useEffect(() => {
    if (fetched || !entityId) return;
    (async () => {
      setLoading(true);
      try {
        const { data, log } = await mockGetAccounts(entityId);
        addApiLog(log);
        setAccounts(data);
      } catch {
        setError('Failed to retrieve accounts');
      } finally {
        setLoading(false);
        setFetched(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleContinue() {
    if (selectedAccountIds.length === 0) {
      setError('Select at least one account to continue');
      return;
    }
    setError(null);
    setStep(3);
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Select Accounts to Pay</h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose which liability accounts to disburse funds to.
          </p>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 rounded-full border-2 border-indigo-200 border-t-indigo-600 mx-auto mb-3"
            />
            <p className="text-sm text-gray-500">Retrieving accounts…</p>
          </div>
        )}

        <AnimatePresence>
          {fetched && accounts.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{accounts.length} accounts found</p>
                <button
                  onClick={() =>
                    selectedAccountIds.length === accounts.length
                      ? setSelectedAccountIds([])
                      : setSelectedAccountIds(accounts.map((a) => a.id))
                  }
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {selectedAccountIds.length === accounts.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {accounts.map((acc, idx) => (
                <AccountCard
                  key={acc.id}
                  account={acc}
                  selected={selectedAccountIds.includes(acc.id)}
                  onToggle={() => toggleSelectedAccount(acc.id)}
                  index={idx}
                />
              ))}

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
                >
                  {error}
                </motion.div>
              )}

              <button
                onClick={handleContinue}
                disabled={selectedAccountIds.length === 0}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-md shadow-indigo-200 active:scale-95"
              >
                {selectedAccountIds.length === 0
                  ? 'Select accounts to continue'
                  : `Continue with ${selectedAccountIds.length} account${selectedAccountIds.length !== 1 ? 's' : ''} →`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
