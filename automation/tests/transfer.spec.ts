import { test, expect } from '@playwright/test';
import { TransferApiClient } from '../utils/api-client.js';
import {
  validTransfer,
  zeroAmount,
  negativeAmount,
  unsupportedCurrency,
  insufficientBalance,
  missingAmount,
  duplicateTransfer,
  requiresApproval,
  aboveMaxLimit,
} from '../fixtures/test-data.js';

declare const process: any;
const BASE_URL = process.env.BASE_URL || 'https://api.fintech-sandbox.com';


test.describe('Fund Transfer API — Mandatory Scenarios', () => {
  test('TC001 — Successful transfer', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer(validTransfer);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.status).toBe('SUCCESS');
    expect(body.amount).toBe(500);
    expect(body.currency).toBe('GBP');
    expect(body.transactionId).toBeTruthy();
  });

  test('TC002 — Reject transfer when amount is zero', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer(zeroAmount);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.error).toMatch(/amount/i);
  });

  test('TC003 — Reject transfer when amount is negative', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer(negativeAmount);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.error).toMatch(/amount/i);
  });

  test('TC004 — Reject transfer with unsupported currency', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer(unsupportedCurrency);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.error).toMatch(/currency/i);
  });

  test('TC005 — Reject transfer when sender has insufficient balance', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer(insufficientBalance);
    const body = await response.json();

    expect(response.status()).toBe(422);
    expect(body.error).toMatch(/balance/i);
  });

  test('TC006 — Reject transfer when required field is missing', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer(missingAmount);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.error).toMatch(/amount/i);
  });

  test('TC007 — Reject transfer when no auth token is provided', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransferWithoutAuth(validTransfer);
    const body = await response.json();

    expect(response.status()).toBe(401);
    expect(body.error).toMatch(/unauthorized|authentication/i);
  });

  test('TC008 — Reject duplicate transfer submission', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);

    const first = await client.createTransfer(duplicateTransfer);
    expect(first.status()).toBe(200);

    const second = await client.createTransfer(duplicateTransfer);
    const body = await second.json();

    expect(second.status()).toBe(409);
    expect(body.error).toMatch(/duplicate/i);
  });

  test('TC009 — Transfer above £5,000 should require approval', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer(requiresApproval);
    const body = await response.json();

    expect(response.status()).toBe(202);
    expect(body.status).toBe('PENDING_APPROVAL');
    expect(body.transactionId).toBeTruthy();
  });

  test('TC010 — Reject transfer above £10,000 maximum limit', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer(aboveMaxLimit);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.error).toMatch(/maximum|limit/i);
  });

});

test.describe('Boundary Value Analysis', () => {

  test('BVA001 — £0 is rejected', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer({
      senderWalletId: 'WALLET001',
      receiverWalletId: 'WALLET002',
      amount: 0,
      currency: 'GBP',
    });

    expect(response.status()).toBe(400);
  });

  test('BVA002 — £1 is accepted', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer({
      senderWalletId: 'WALLET001',
      receiverWalletId: 'WALLET002',
      amount: 1,
      currency: 'GBP',
    });

    expect(response.status()).toBe(200);
  });

  test('BVA003 — £4,999.99 is accepted without approval', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer({
      senderWalletId: 'WALLET001',
      receiverWalletId: 'WALLET002',
      amount: 4999.99,
      currency: 'GBP',
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.status).toBe('SUCCESS');
  });

  test('BVA004 — £5,000 is accepted without approval', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer({
      senderWalletId: 'WALLET001',
      receiverWalletId: 'WALLET002',
      amount: 5000,
      currency: 'GBP',
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.status).toBe('SUCCESS');
  });

  test('BVA005 — £5,000.01 requires approval', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer({
      senderWalletId: 'WALLET001',
      receiverWalletId: 'WALLET002',
      amount: 5000.01,
      currency: 'GBP',
    });
    const body = await response.json();

    expect(response.status()).toBe(202);
    expect(body.status).toBe('PENDING_APPROVAL');
  });

  test('BVA006 — £9,999.99 requires approval', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer({
      senderWalletId: 'WALLET001',
      receiverWalletId: 'WALLET002',
      amount: 9999.99,
      currency: 'GBP',
    });
    const body = await response.json();

    expect(response.status()).toBe(202);
    expect(body.status).toBe('PENDING_APPROVAL');
  });

  test('BVA007 — £10,000 is accepted at maximum limit', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer({
      senderWalletId: 'WALLET001',
      receiverWalletId: 'WALLET002',
      amount: 10000,
      currency: 'GBP',
    });
    const body = await response.json();

    expect(response.status()).toBe(202);
    expect(body.status).toBe('PENDING_APPROVAL');
  });

  test('BVA008 — £10,000.01 is rejected', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer({
      senderWalletId: 'WALLET001',
      receiverWalletId: 'WALLET002',
      amount: 10000.01,
      currency: 'GBP',
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.error).toMatch(/maximum|limit/i);
  });

});