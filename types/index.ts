// ─── Entity ──────────────────────────────────────────────────────────────────

export interface Entity {
  id: string;
  type: string;
  individual: {
    first_name: string;
    last_name: string;
    phone: string;
    dob: string;
    email: string;
    ssn_4: string | null;
    ssn: string | null;
  };
  error: null;
  address: {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    zip: string;
  };
  status: string;
  verification: {
    identity: {
      verified: boolean;
      matched: boolean;
      latest_verification_session: string | null;
      methods: string[];
    };
    phone: {
      verified: boolean;
      latest_verification_session: string | null;
      methods: string[];
    };
  };
  connect: null;
  credit_score: null;
  products: string[];
  restricted_products: string[];
  subscriptions: string[];
  available_subscriptions: string[];
  restricted_subscriptions: string[];
  metadata: null;
  created_at: string;
  updated_at: string;
}

// ─── Connect ──────────────────────────────────────────────────────────────────

export interface ConnectResponse {
  id: string;
  entity_id: string;
  status: string;
  accounts: string[];
  error: null;
  created_at: string;
  updated_at: string;
}

// ─── Account ──────────────────────────────────────────────────────────────────

export interface LiabilityUpdate {
  id: string;
  status: string;
  account_id: string;
  source: string;
  type: string;
  // type-specific data lives under the type key
  student_loans?: {
    balance: number;
    original_loan_amount: number;
    last_payment_amount: number;
    last_payment_date: string;
    next_payment_due_date: string;
    next_payment_minimum_amount: number;
    opened_at: string;
    sub_type: string;
    term_length: number;
    interest_rate_percentage: number;
    interest_rate_type: string;
  };
  credit_card?: {
    available_credit: number;
    balance: number;
    closed_at: string | null;
    credit_limit: number;
    interest_rate_percentage_max: number;
    interest_rate_percentage_min: number;
    interest_rate_type: string;
    last_payment_amount: number;
    last_payment_date: string;
    next_payment_due_date: string;
    next_payment_minimum_amount: number;
    opened_at: string;
    sub_type: string;
    usage_pattern: string;
  };
  auto_loan?: {
    balance: number;
    original_loan_amount: number;
    last_payment_amount: number;
    last_payment_date: string;
    next_payment_due_date: string;
    next_payment_minimum_amount: number;
    opened_at: string;
    interest_rate_percentage: number;
    interest_rate_type: string;
    term_length: number;
    sub_type: string;
  };
  mortgage?: {
    balance: number;
    original_loan_amount: number;
    last_payment_amount: number;
    last_payment_date: string;
    next_payment_due_date: string;
    next_payment_minimum_amount: number;
    opened_at: string;
    interest_rate_percentage: number;
    interest_rate_type: string;
    term_length: number;
    sub_type: string;
  };
  personal_loan?: {
    balance: number;
    original_loan_amount: number;
    last_payment_amount: number;
    last_payment_date: string;
    next_payment_due_date: string;
    next_payment_minimum_amount: number;
    opened_at: string;
    interest_rate_percentage: number;
    interest_rate_type: string;
    term_length: number;
    sub_type: string;
  };
}

export interface Account {
  id: string;
  holder_id: string;
  status: string;
  type: string;
  liability: {
    mch_id: string;
    mask: string;
    ownership: string;
    fingerprint: null;
    type: string;
    name: string;
  };
  update: LiabilityUpdate;
  products: string[];
  created_at: string;
  updated_at: string;
}

// Helper to extract common financials regardless of account type
export function getAccountFinancials(account: Account) {
  const u = account.update;
  if (!u) return null;
  const d =
    u.student_loans ??
    u.credit_card ??
    u.auto_loan ??
    u.mortgage ??
    u.personal_loan;
  if (!d) return null;
  return {
    balance: d.balance,
    minPayment: d.next_payment_minimum_amount,
    dueDate: d.next_payment_due_date,
    interestRate:
      (d as { interest_rate_percentage?: number }).interest_rate_percentage ??
      (d as { interest_rate_percentage_max?: number }).interest_rate_percentage_max,
  };
}

// ─── Webhook ──────────────────────────────────────────────────────────────────

export interface Webhook {
  id: string;
  type: string;
  url: string;
  metadata: null;
  created_at: string;
  updated_at: string;
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  name: string;
  status: string;
  latest_request_id: null;
  account_id: string;
  created_at: string;
  updated_at: string;
}

// ─── Payment Instrument ───────────────────────────────────────────────────────

export interface PaymentInstrumentData {
  id: string;
  account_id: string;
  type: string;
  card: null;
  network_token: null;
  inbound_achwire_payment: {
    account_number: string;
    routing_number: string;
  };
  chargeable: boolean;
  status: string;
  error: null;
  created_at: string;
  updated_at: string;
}

export interface PaymentInstrumentResponse {
  success: true;
  data: PaymentInstrumentData;
  message: null;
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'processing' | 'sent' | 'posted';

export interface Payment {
  id: string;
  source: string;
  destination: string;
  amount: number;
  description: string;
  status: PaymentStatus;
  estimated_completion_date: string;
  source_trace_id: null;
  source_settlement_date: string;
  source_status: string;
  destination_trace_id: null;
  destination_settlement_date: string;
  destination_status: string;
  reversal_id: null;
  fee: null;
  error: null;
  metadata: null;
  created_at: string;
  updated_at: string;
}

// ─── API Log ──────────────────────────────────────────────────────────────────

export interface ApiLog {
  id: string;
  step: number;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  requestHeaders: Record<string, string>;
  requestBody: unknown;
  responseStatus: number;
  responseBody: unknown;
  duration: number;
  timestamp: string;
  label: string;
  isWebhook?: boolean;
  webhookEventType?: string;
}

// ─── Form ────────────────────────────────────────────────────────────────────

export interface BorrowerFormData {
  first_name: string;
  last_name: string;
  phone: string;
  dob: string;
  email: string;
  ssn: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
}
