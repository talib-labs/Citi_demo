import {
  ApiLog,
  Account,
  BorrowerFormData,
  ConnectResponse,
  Entity,
  Payment,
  PaymentInstrumentResponse,
  Subscription,
  Webhook,
} from '@/types';

// ─── Utilities ────────────────────────────────────────────────────────────────

const randomDelay = () =>
  new Promise<void>((r) => setTimeout(r, Math.floor(Math.random() * 1000) + 500));

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const MASKED_KEY = 'sk_••••••••••••Vjc';

const DEFAULT_HEADERS: Record<string, string> = {
  Authorization: `Bearer ${MASKED_KEY}`,
  'Content-Type': 'application/json',
  'Method-Version': '2024-07-04',
};

const PI_HEADERS: Record<string, string> = {
  Authorization: `Bearer ${MASKED_KEY}`,
  'Content-Type': 'application/json',
  'Method-Version': '2025-12-01',
};

function makeLog(
  step: number,
  label: string,
  method: ApiLog['method'],
  url: string,
  headers: Record<string, string>,
  body: unknown,
  responseBody: unknown,
  duration: number,
  extra?: Partial<ApiLog>
): ApiLog {
  return {
    id: genId(),
    step,
    method,
    url,
    requestHeaders: headers,
    requestBody: body ?? null,
    responseStatus: 200,
    responseBody,
    duration,
    timestamp: new Date().toISOString(),
    label,
    ...extra,
  };
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ENTITY_RESPONSE: Entity = {
  id: 'ent_BzirqpLEm3BW7',
  type: 'individual',
  individual: {
    first_name: 'Kevin',
    last_name: 'Doyle',
    phone: '+15121231113',
    dob: '1997-03-18',
    email: 'kevin.doyle@gmail.com',
    ssn_4: null,
    ssn: null,
  },
  error: null,
  address: {
    line1: '3300 N Interstate 35',
    line2: null,
    city: 'Austin',
    state: 'TX',
    zip: '78705',
  },
  status: 'incomplete',
  verification: {
    identity: {
      verified: false,
      matched: false,
      latest_verification_session: null,
      methods: ['element', 'kba'],
    },
    phone: {
      verified: true,
      latest_verification_session: 'evf_P4QXNj93Y9J8L',
      methods: [],
    },
  },
  connect: null,
  credit_score: null,
  products: ['identity'],
  restricted_products: ['connect', 'credit_score', 'attribute'],
  subscriptions: [],
  available_subscriptions: ['connect', 'credit_score'],
  restricted_subscriptions: [],
  metadata: null,
  created_at: '2023-10-24T21:50:53.024Z',
  updated_at: '2023-10-24T21:50:53.024Z',
};

const MOCK_CONNECT_RESPONSE: ConnectResponse = {
  id: 'cxn_4ewMmBbjYDMR4',
  entity_id: 'ent_BzirqpLEm3BW7',
  status: 'completed',
  accounts: [
    'acc_eKKmrXDpJBKgw',
    'acc_GV8WbmJW7KGRy',
    'acc_MLPKh9gQDDbT8',
    'acc_LbXE8wVYJLrKt',
    'acc_J3P9fayDFjpAy',
    'acc_eFFRV9zmpLREK',
  ],
  error: null,
  created_at: '2024-04-12T14:56:46.645Z',
  updated_at: '2024-04-12T14:56:46.645Z',
};

const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'acc_eKKmrXDpJBKgw',
    holder_id: 'ent_BzirqpLEm3BW7',
    status: 'active',
    type: 'liability',
    liability: {
      mch_id: 'mch_300284',
      mask: '1234',
      ownership: 'authorized',
      fingerprint: null,
      type: 'student_loans',
      name: 'Aidvantage Student Loans',
    },
    update: {
      id: 'upt_NJK9kfjskTTCJ',
      status: 'completed',
      account_id: 'acc_eKKmrXDpJBKgw',
      source: 'snapshot',
      type: 'student_loans',
      student_loans: {
        balance: 12000000,
        original_loan_amount: 12000000,
        last_payment_amount: 250000,
        last_payment_date: '2024-03-15',
        next_payment_due_date: '2024-05-15',
        next_payment_minimum_amount: 250000,
        opened_at: '2019-08-15',
        sub_type: 'federal',
        term_length: 120,
        interest_rate_percentage: 4.29,
        interest_rate_type: 'fixed',
      },
    },
    products: ['payment'],
    created_at: '2024-02-12T18:57:57.857Z',
    updated_at: '2024-03-20T04:43:21.655Z',
  },
  {
    id: 'acc_GV8WbmJW7KGRy',
    holder_id: 'ent_BzirqpLEm3BW7',
    status: 'active',
    type: 'liability',
    liability: {
      mch_id: 'mch_200145',
      mask: '5678',
      ownership: 'primary',
      fingerprint: null,
      type: 'credit_card',
      name: 'Chase Sapphire Reserve',
    },
    update: {
      id: 'upt_TXDTR7Amyz7Az',
      status: 'completed',
      account_id: 'acc_GV8WbmJW7KGRy',
      source: 'direct',
      type: 'credit_card',
      credit_card: {
        available_credit: 120000,
        balance: 80000,
        closed_at: null,
        credit_limit: 200000,
        interest_rate_percentage_max: 23.5,
        interest_rate_percentage_min: 12.0,
        interest_rate_type: 'variable',
        last_payment_amount: 5000,
        last_payment_date: '2024-04-05',
        next_payment_due_date: '2024-05-01',
        next_payment_minimum_amount: 4000,
        opened_at: '2018-10-30',
        sub_type: 'flexible_spending',
        usage_pattern: 'transactor',
      },
    },
    products: ['payment'],
    created_at: '2024-02-12T18:57:57.857Z',
    updated_at: '2024-03-20T04:43:21.655Z',
  },
  {
    id: 'acc_MLPKh9gQDDbT8',
    holder_id: 'ent_BzirqpLEm3BW7',
    status: 'active',
    type: 'liability',
    liability: {
      mch_id: 'mch_100893',
      mask: '9012',
      ownership: 'primary',
      fingerprint: null,
      type: 'auto_loan',
      name: 'Toyota Financial Services',
    },
    update: {
      id: 'upt_QRz8kfjskTTCJ',
      status: 'completed',
      account_id: 'acc_MLPKh9gQDDbT8',
      source: 'snapshot',
      type: 'auto_loan',
      auto_loan: {
        balance: 1850000,
        original_loan_amount: 3200000,
        last_payment_amount: 45000,
        last_payment_date: '2024-04-01',
        next_payment_due_date: '2024-05-01',
        next_payment_minimum_amount: 45000,
        opened_at: '2021-06-15',
        interest_rate_percentage: 3.9,
        interest_rate_type: 'fixed',
        term_length: 72,
        sub_type: 'loan',
      },
    },
    products: ['payment'],
    created_at: '2024-02-12T18:57:57.857Z',
    updated_at: '2024-03-20T04:43:21.655Z',
  },
  {
    id: 'acc_LbXE8wVYJLrKt',
    holder_id: 'ent_BzirqpLEm3BW7',
    status: 'active',
    type: 'liability',
    liability: {
      mch_id: 'mch_400201',
      mask: '3456',
      ownership: 'primary',
      fingerprint: null,
      type: 'mortgage',
      name: 'Wells Fargo Home Mortgage',
    },
    update: {
      id: 'upt_MNx8kfjskTTCJ',
      status: 'completed',
      account_id: 'acc_LbXE8wVYJLrKt',
      source: 'snapshot',
      type: 'mortgage',
      mortgage: {
        balance: 28500000,
        original_loan_amount: 35000000,
        last_payment_amount: 185000,
        last_payment_date: '2024-04-01',
        next_payment_due_date: '2024-05-01',
        next_payment_minimum_amount: 185000,
        opened_at: '2020-03-15',
        interest_rate_percentage: 3.25,
        interest_rate_type: 'fixed',
        term_length: 360,
        sub_type: 'conventional',
      },
    },
    products: ['payment'],
    created_at: '2024-02-12T18:57:57.857Z',
    updated_at: '2024-03-20T04:43:21.655Z',
  },
  {
    id: 'acc_J3P9fayDFjpAy',
    holder_id: 'ent_BzirqpLEm3BW7',
    status: 'active',
    type: 'liability',
    liability: {
      mch_id: 'mch_500332',
      mask: '7890',
      ownership: 'primary',
      fingerprint: null,
      type: 'personal_loan',
      name: 'SoFi Personal Loan',
    },
    update: {
      id: 'upt_PLw8kfjskTTCJ',
      status: 'completed',
      account_id: 'acc_J3P9fayDFjpAy',
      source: 'snapshot',
      type: 'personal_loan',
      personal_loan: {
        balance: 750000,
        original_loan_amount: 1500000,
        last_payment_amount: 35000,
        last_payment_date: '2024-04-10',
        next_payment_due_date: '2024-05-10',
        next_payment_minimum_amount: 35000,
        opened_at: '2022-01-20',
        interest_rate_percentage: 8.99,
        interest_rate_type: 'fixed',
        term_length: 60,
        sub_type: 'unsecured',
      },
    },
    products: ['payment'],
    created_at: '2024-02-12T18:57:57.857Z',
    updated_at: '2024-03-20T04:43:21.655Z',
  },
  {
    id: 'acc_eFFRV9zmpLREK',
    holder_id: 'ent_BzirqpLEm3BW7',
    status: 'active',
    type: 'liability',
    liability: {
      mch_id: 'mch_600118',
      mask: '2345',
      ownership: 'primary',
      fingerprint: null,
      type: 'credit_card',
      name: 'Amex Gold Card',
    },
    update: {
      id: 'upt_RSv8kfjskTTCJ',
      status: 'completed',
      account_id: 'acc_eFFRV9zmpLREK',
      source: 'direct',
      type: 'credit_card',
      credit_card: {
        available_credit: 250000,
        balance: 150000,
        closed_at: null,
        credit_limit: 400000,
        interest_rate_percentage_max: 29.99,
        interest_rate_percentage_min: 18.24,
        interest_rate_type: 'variable',
        last_payment_amount: 15000,
        last_payment_date: '2024-04-02',
        next_payment_due_date: '2024-05-02',
        next_payment_minimum_amount: 3500,
        opened_at: '2020-07-12',
        sub_type: 'charge',
        usage_pattern: 'revolver',
      },
    },
    products: ['payment'],
    created_at: '2024-02-12T18:57:57.857Z',
    updated_at: '2024-03-20T04:43:21.655Z',
  },
];

// Per-account payment instrument data
const MOCK_PI_DATA: Record<string, { account_number: string; routing_number: string; id: string }> = {
  acc_eKKmrXDpJBKgw: { id: 'pmt_inst_pd788hPVhLT37', account_number: '57838927', routing_number: '367537407' },
  acc_GV8WbmJW7KGRy: { id: 'pmt_inst_kR9p2hTMqWz81', account_number: '68472913', routing_number: '021000021' },
  acc_MLPKh9gQDDbT8: { id: 'pmt_inst_nB3x7fGqLmK29', account_number: '34918273', routing_number: '111000025' },
  acc_LbXE8wVYJLrKt: { id: 'pmt_inst_jT5m4kWnPxH63', account_number: '91827364', routing_number: '124303065' },
  acc_J3P9fayDFjpAy: { id: 'pmt_inst_cY8q1rZvSdN47', account_number: '45678901', routing_number: '267084131' },
  acc_eFFRV9zmpLREK: { id: 'pmt_inst_wQ2n9bXmFgK85', account_number: '23456789', routing_number: '221172186' },
};

// ─── Mock Functions ───────────────────────────────────────────────────────────

/** Step 1: Create Entity */
export async function mockCreateEntity(
  form: BorrowerFormData
): Promise<{ data: Entity; log: ApiLog }> {
  const requestBody = {
    type: 'individual',
    individual: {
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      email: form.email,
      dob: form.dob,
      ssn: form.ssn || '•••••••••',
    },
    address: {
      line1: form.line1,
      line2: form.line2 || null,
      city: form.city,
      state: form.state,
      zip: form.zip,
    },
  };

  const start = Date.now();
  await randomDelay();
  const duration = Date.now() - start;

  // Reflect user-entered name in response
  const data: Entity = {
    ...MOCK_ENTITY_RESPONSE,
    individual: {
      ...MOCK_ENTITY_RESPONSE.individual,
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      dob: form.dob,
      email: form.email,
    },
    address: {
      line1: form.line1,
      line2: form.line2 || null,
      city: form.city,
      state: form.state,
      zip: form.zip,
    },
  };

  const log = makeLog(
    0,
    'Create Entity',
    'POST',
    'https://dev.methodfi.com/entities',
    DEFAULT_HEADERS,
    requestBody,
    data,
    duration
  );

  return { data, log };
}

/** Step 2: Connect Liabilities */
export async function mockConnectLiabilities(
  entityId: string
): Promise<{ data: ConnectResponse; log: ApiLog }> {
  const start = Date.now();
  await randomDelay();
  const duration = Date.now() - start;

  const data = { ...MOCK_CONNECT_RESPONSE, entity_id: entityId };

  const log = makeLog(
    1,
    'Connect Liabilities',
    'POST',
    `https://dev.methodfi.com/entities/${entityId}/connect`,
    { Authorization: `Bearer ${MASKED_KEY}`, 'Method-Version': '2024-07-04' },
    null,
    data,
    duration
  );

  return { data, log };
}

/** Step 3: Retrieve Accounts (with expanded update) */
export async function mockGetAccounts(
  entityId: string
): Promise<{ data: Account[]; log: ApiLog }> {
  const start = Date.now();
  await randomDelay();
  const duration = Date.now() - start;

  const log = makeLog(
    2,
    'Get Accounts',
    'GET',
    `https://dev.methodfi.com/accounts?holder_id=${entityId}&expand[]=update`,
    { Authorization: `Bearer ${MASKED_KEY}`, 'Method-Version': '2024-07-04' },
    null,
    MOCK_ACCOUNTS,
    duration
  );

  return { data: MOCK_ACCOUNTS, log };
}

/** Step 4a: Create Webhook */
export async function mockCreateWebhook(
  type: 'update.create' | 'update.update',
  step: number
): Promise<{ data: Webhook; log: ApiLog }> {
  const start = Date.now();
  await randomDelay();
  const duration = Date.now() - start;

  const id = type === 'update.create' ? 'whk_cSGjA6d9N8y8R' : 'whk_cSGjA6d9N8y8L';
  const data: Webhook = {
    id,
    type,
    url: 'https://reference.example.app/webhook',
    metadata: null,
    created_at: '2020-12-09T00:41:05.647Z',
    updated_at: '2020-12-09T00:41:05.647Z',
  };

  const requestBody = {
    type,
    url: 'https://reference.example.app/webhook',
    auth_token: 'md7UqcTSmvXCBzPORDwOkE',
  };

  const log = makeLog(
    step,
    `Create Webhook (${type})`,
    'POST',
    'https://dev.methodfi.com/webhooks',
    DEFAULT_HEADERS,
    requestBody,
    data,
    duration
  );

  return { data, log };
}

/** Step 4b: Subscribe Account to Updates */
export async function mockCreateSubscription(
  accountId: string,
  step: number
): Promise<{ data: Subscription; log: ApiLog }> {
  const start = Date.now();
  await randomDelay();
  const duration = Date.now() - start;

  const data: Subscription = {
    id: `sub_${genId().slice(0, 13)}`,
    name: 'update',
    status: 'active',
    latest_request_id: null,
    account_id: accountId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const log = makeLog(
    step,
    `Subscribe Account (${accountId.slice(-6)})`,
    'POST',
    `https://dev.methodfi.com/accounts/${accountId}/subscriptions`,
    DEFAULT_HEADERS,
    { enroll: 'update' },
    { id: data.id, name: data.name, status: data.status, latest_request_id: null, created_at: data.created_at, updated_at: data.updated_at },
    duration
  );

  return { data, log };
}

/** Step 5: Create Payment Instrument */
export async function mockCreatePaymentInstrument(
  accountId: string,
  step: number
): Promise<{ data: PaymentInstrumentResponse; log: ApiLog }> {
  const start = Date.now();
  await randomDelay();
  const duration = Date.now() - start;

  const piData = MOCK_PI_DATA[accountId] ?? {
    id: `pmt_inst_${genId().slice(0, 13)}`,
    account_number: String(Math.floor(Math.random() * 90000000) + 10000000),
    routing_number: '367537407',
  };

  const data: PaymentInstrumentResponse = {
    success: true,
    data: {
      id: piData.id,
      account_id: accountId,
      type: 'inbound_achwire_payment',
      card: null,
      network_token: null,
      inbound_achwire_payment: {
        account_number: piData.account_number,
        routing_number: piData.routing_number,
      },
      chargeable: true,
      status: 'completed',
      error: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    message: null,
  };

  const log = makeLog(
    step,
    `Create Payment Instrument (${accountId.slice(-6)})`,
    'POST',
    `https://dev.methodfi.com/accounts/${accountId}/payment_instruments`,
    PI_HEADERS,
    { type: 'inbound_achwire_payment' },
    data,
    duration
  );

  return { data, log };
}

/** Step 6: Create Payment */
export async function mockCreatePayment(
  sourceAccountId: string,
  destinationAccountId: string,
  amountCents: number,
  step: number
): Promise<{ data: Payment; log: ApiLog }> {
  const start = Date.now();
  await randomDelay();
  const duration = Date.now() - start;

  const data: Payment = {
    id: 'pmt_VeCfmkwGKb',
    source: sourceAccountId,
    destination: destinationAccountId,
    amount: amountCents,
    description: 'Loan Pmt',
    status: 'pending',
    estimated_completion_date: '2024-03-21',
    source_trace_id: null,
    source_settlement_date: '2024-03-15',
    source_status: 'pending',
    destination_trace_id: null,
    destination_settlement_date: '2024-03-21',
    destination_status: 'pending',
    reversal_id: null,
    fee: null,
    error: null,
    metadata: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const requestBody = {
    amount: amountCents,
    source: sourceAccountId,
    destination: destinationAccountId,
    description: 'Loan Pmt',
  };

  const log = makeLog(
    step,
    'Create Payment',
    'POST',
    'https://dev.methodfi.com/payments',
    DEFAULT_HEADERS,
    requestBody,
    data,
    duration
  );

  return { data, log };
}

/** Step 6: Webhook Event log (incoming) */
export function mockWebhookEventLog(
  paymentId: string,
  status: Payment['status'],
  step: number,
  eventType: 'payment.create' | 'payment.update'
): ApiLog {
  const payload = {
    id: `whk_evt_${genId().slice(0, 10)}`,
    type: eventType,
    data: {
      id: paymentId,
      status,
      source_status: status,
      destination_status: status,
      updated_at: new Date().toISOString(),
    },
  };

  return makeLog(
    step,
    `Webhook ← ${eventType}`,
    'POST',
    'https://reference.example.app/webhook',
    { 'Content-Type': 'application/json', 'X-Method-Signature': 'sha256=mock_sig' },
    payload,
    { received: true },
    0,
    { isWebhook: true, webhookEventType: eventType }
  );
}
