import { create } from 'zustand';
import {
  Account,
  ApiLog,
  Entity,
  Payment,
  PaymentInstrumentData,
  Subscription,
  Webhook,
} from '@/types';

interface DemoStore {
  currentStep: number;
  entity: Entity | null;
  entityId: string | null;
  accountIds: string[];
  accounts: Account[];
  selectedAccountIds: string[];
  webhooks: Webhook[];
  subscriptions: Subscription[];
  paymentInstruments: PaymentInstrumentData[];
  payment: Payment | null;
  apiLogs: ApiLog[];
  isLoading: boolean;
  error: string | null;

  setStep: (step: number) => void;
  setEntity: (entity: Entity) => void;
  setEntityId: (id: string) => void;
  setAccountIds: (ids: string[]) => void;
  setAccounts: (accounts: Account[]) => void;
  toggleSelectedAccount: (id: string) => void;
  setSelectedAccountIds: (ids: string[]) => void;
  addWebhook: (wh: Webhook) => void;
  addSubscription: (sub: Subscription) => void;
  addPaymentInstrument: (pi: PaymentInstrumentData) => void;
  setPaymentInstruments: (pis: PaymentInstrumentData[]) => void;
  setPayment: (payment: Payment) => void;
  updatePaymentStatus: (status: Payment['status']) => void;
  addApiLog: (log: ApiLog) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 0,
  entity: null,
  entityId: null,
  accountIds: [],
  accounts: [],
  selectedAccountIds: [],
  webhooks: [],
  subscriptions: [],
  paymentInstruments: [],
  payment: null,
  apiLogs: [],
  isLoading: false,
  error: null,
};

export const useDemoStore = create<DemoStore>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),
  setEntity: (entity) => set({ entity, entityId: entity.id }),
  setEntityId: (id) => set({ entityId: id }),
  setAccountIds: (ids) => set({ accountIds: ids }),
  setAccounts: (accounts) => set({ accounts }),
  toggleSelectedAccount: (id) =>
    set((state) => ({
      selectedAccountIds: state.selectedAccountIds.includes(id)
        ? state.selectedAccountIds.filter((aid) => aid !== id)
        : [...state.selectedAccountIds, id],
    })),
  setSelectedAccountIds: (ids) => set({ selectedAccountIds: ids }),
  addWebhook: (wh) =>
    set((state) => ({ webhooks: [...state.webhooks, wh] })),
  addSubscription: (sub) =>
    set((state) => ({ subscriptions: [...state.subscriptions, sub] })),
  addPaymentInstrument: (pi) =>
    set((state) => ({ paymentInstruments: [...state.paymentInstruments, pi] })),
  setPaymentInstruments: (pis) => set({ paymentInstruments: pis }),
  setPayment: (payment) => set({ payment }),
  updatePaymentStatus: (status) =>
    set((state) =>
      state.payment
        ? { payment: { ...state.payment, status, updated_at: new Date().toISOString() } }
        : {}
    ),
  addApiLog: (log) =>
    set((state) => ({ apiLogs: [...state.apiLogs, log] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
