'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoStore } from '@/store/demoStore';
import { mockCreatePayment, mockWebhookEventLog } from '@/lib/mock-api';
import { Payment, PaymentStatus } from '@/types';

const SOURCE_ACCOUNT = 'acc_ge68Fj9bVgmRE';
const SOURCE_LABEL = 'Citi Disbursement Account';

function fmt(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

const STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  sent: 'bg-green-100 text-green-700 border-green-200',
  posted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const STATUS_ICONS: Record<PaymentStatus, string> = {
  pending: '⏳',
  processing: '⚡',
  sent: '✅',
  posted: '🏦',
};

function FlowArrow({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col gap-1 flex-1 mx-1">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-0">
          <div className="flex-1 h-0.5 bg-gray-200 relative overflow-hidden rounded-full">
            {active && (
              <motion.div
                className="absolute inset-y-0 left-0 bg-[#4A90D9] rounded-full"
                style={{ width: '35%' }}
                animate={{ x: ['0%', '200%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear', delay: i * 0.3 }}
              />
            )}
          </div>
          <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" stroke="currentColor" />
          </svg>
        </div>
      ))}
    </div>
  );
}

function FlowNode({ label, sub, icon, glowing }: { label: string; sub: string; icon: string; glowing?: boolean }) {
  return (
    <motion.div
      className={`p-3 rounded-xl border-2 text-center min-w-[90px] transition-all ${
        glowing ? 'border-[#4A90D9] bg-[#EEF4FB] shadow-md shadow-blue-100' : 'border-gray-200 bg-white'
      }`}
      animate={glowing ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <p className="text-xl mb-1">{icon}</p>
      <p className="text-xs font-semibold text-gray-800 leading-tight">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5 leading-tight">{sub}</p>
    </motion.div>
  );
}

interface WebhookEvent {
  type: string;
  status: PaymentStatus;
  time: string;
}

export default function Step6Payment() {
  const { selectedAccountIds, accounts, paymentInstruments, addApiLog } = useDemoStore();

  const [amount, setAmount] = useState('5000'); // in cents, displayed as dollars
  const [payment, setPayment] = useState<Payment | null>(null);
  const [currentStatus, setCurrentStatus] = useState<PaymentStatus>('pending');
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [flowPhase, setFlowPhase] = useState(0); // 0=idle, 1=source→method, 2=method→dest
  const [creating, setCreating] = useState(false);

  const STEP = 5;

  // Use first selected account as destination for the demo payment
  const destinationId = selectedAccountIds[0] || '';
  const destAccount = accounts.find((a) => a.id === destinationId);
  const destLabel = destAccount ? `${destAccount.liability.name} ••••${destAccount.liability.mask}` : destinationId;
  const destInstrument = paymentInstruments.find((pi) => pi.account_id === destinationId);

  const amountCents = Math.max(100, Math.round(Number(amount) * 100) || 5000);

  async function handleCreatePayment() {
    setCreating(true);

    // 1. Create payment
    const { data: pmt, log } = await mockCreatePayment(SOURCE_ACCOUNT, destinationId, amountCents, STEP);
    addApiLog(log);
    setPayment(pmt);
    setFlowPhase(1);

    // 2. payment.create webhook
    await new Promise((r) => setTimeout(r, 600));
    const hook1 = mockWebhookEventLog(pmt.id, 'pending', STEP, 'payment.create');
    addApiLog(hook1);
    setWebhookEvents((prev) => [...prev, { type: 'payment.create', status: 'pending', time: new Date().toLocaleTimeString() }]);

    // 3. processing update
    await new Promise((r) => setTimeout(r, 2200));
    const hook2 = mockWebhookEventLog(pmt.id, 'processing', STEP, 'payment.update');
    addApiLog(hook2);
    setCurrentStatus('processing');
    setFlowPhase(2);
    setWebhookEvents((prev) => [...prev, { type: 'payment.update', status: 'processing', time: new Date().toLocaleTimeString() }]);

    // 4. sent update
    await new Promise((r) => setTimeout(r, 3000));
    const hook3 = mockWebhookEventLog(pmt.id, 'sent', STEP, 'payment.update');
    addApiLog(hook3);
    setCurrentStatus('sent');
    setWebhookEvents((prev) => [...prev, { type: 'payment.update', status: 'sent', time: new Date().toLocaleTimeString() }]);

    // 5. posted — funds landed at destination
    await new Promise((r) => setTimeout(r, 3500));
    const hook4 = mockWebhookEventLog(pmt.id, 'posted', STEP, 'payment.update');
    addApiLog(hook4);
    setCurrentStatus('posted');
    setWebhookEvents((prev) => [...prev, { type: 'payment.update', status: 'posted', time: new Date().toLocaleTimeString() }]);

    setCreating(false);
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Disburse Funds</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create a payment from the lender&apos;s account to the liability account.
          </p>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200">
          <span className="text-blue-500 flex-shrink-0 mt-0.5">ℹ️</span>
          <p className="text-xs text-blue-700 leading-relaxed">
            <span className="font-semibold">Note:</span> Citi will ACH the disbursement funds directly to the account and routing numbers generated by the Payment Instrument request in the previous step.
          </p>
        </div>

        {/* Payment Form */}
        {!payment && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Source Account</p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-lg">🏦</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{SOURCE_LABEL}</p>
                  <p className="text-xs font-mono text-gray-500">{SOURCE_ACCOUNT}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Destination</p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-lg">{destAccount ? '💳' : '🏦'}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{destLabel}</p>
                  {destInstrument && (
                    <p className="text-xs font-mono text-[#003087]">
                      RTN: {destInstrument.inbound_achwire_payment.routing_number}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {selectedAccountIds.length > 1 && (
              <p className="text-xs text-gray-400 text-center">
                Showing demo payment for first selected account. In production, one payment per account.
              </p>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003087]"
                  placeholder="50.00"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Will be sent as {amountCents} cents</p>
            </div>

            <button
              onClick={handleCreatePayment}
              disabled={creating || !destinationId}
              className="w-full py-3 rounded-xl bg-[#003087] hover:bg-[#002570] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-md shadow-blue-200 active:scale-95"
            >
              {creating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing…
                </span>
              ) : (
                `Create Payment — ${fmt(amountCents)} →`
              )}
            </button>
          </div>
        )}

        {/* Flow of Funds */}
        {payment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Flow of Funds</p>
            <div className="flex items-center justify-between">
              <FlowNode label="Citi" sub="Disbursement" icon="🏦" glowing={flowPhase >= 1} />
              <FlowArrow active={flowPhase >= 1} />
              <FlowNode label="Method" sub="Sponsor Bank" icon="⚡" glowing={flowPhase >= 1} />
              <FlowArrow active={flowPhase >= 2} />
              <FlowNode
                label={destAccount?.liability.name.split(' ')[0] || 'Destination'}
                sub={`••••${destAccount?.liability.mask || '----'}`}
                icon="💳"
                glowing={flowPhase >= 2}
              />
            </div>

            {/* Status Badge */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[currentStatus]}`}>
                  {STATUS_ICONS[currentStatus]} {currentStatus}
                </span>
                <span className="text-xs text-gray-500 font-mono">{payment.id}</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{fmt(payment.amount)}</span>
            </div>
          </motion.div>
        )}

        {/* Webhook Timeline */}
        {webhookEvents.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Webhook Events</p>
            <div className="space-y-2.5">
              <AnimatePresence>
                {webhookEvents.map((ev, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                      ev.status === 'posted' ? 'bg-emerald-400' :
                      ev.status === 'sent' ? 'bg-green-400' :
                      ev.status === 'processing' ? 'bg-blue-400' : 'bg-yellow-400'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-xs font-mono text-gray-700 font-semibold">{ev.type}</code>
                        <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${STATUS_COLORS[ev.status]}`}>
                          {ev.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {ev.type === 'payment.create' && ev.status === 'pending' && 'Funds received at Method sponsor bank'}
                        {ev.status === 'processing' && 'Payment being routed to destination account'}
                        {ev.status === 'sent' && 'Funds sent from Method sponsor bank to destination'}
                        {ev.status === 'posted' && 'Funds posted and settled at destination account'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {currentStatus === 'posted' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center"
              >
                <p className="text-emerald-700 font-semibold text-sm">🎉 Payment Posted!</p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  {fmt(payment!.amount)} landed at {destLabel}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
