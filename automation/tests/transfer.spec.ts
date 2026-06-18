import { test, expect } from '@playwright/test';
import { TransferApiClient } from '../utils/api-client.js';
import {
  validTransfer,
  zeroAmount,
  negativeAmount,
  unsupportedCurrency,
  insufficientBalance,
  duplicateTransfer,
//   missingSenderWallet,
//   aboveApprovalThreshold,
//   aboveMaximumLimit,
//   atMaximumLimit,
//   boundaryValues
} from '../fixtures/test-data.js';

const BASE_URL =
  (globalThis as any).process?.env?.BASE_URL || 'https://api.fintech-sandbox.com';

test.describe('Fund Transfer API — Mandatory Scenarios', () => {

  test('TC001 — Successful transfer with valid payload', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer(validTransfer);

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body).toHaveProperty('transactionId');
    expect(body).toHaveProperty('status', 'SUCCESS');
    expect(body).toHaveProperty('amount', 500);
    expect(body).toHaveProperty('currency', 'GBP');
  });

  test('TC002 — Transfer fails when amount is zero', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer(zeroAmount);

    expect(response.status()).toBe(400);
  });

  test('TC003 — Transfer fails when amount is negative', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer(negativeAmount);

    expect(response.status()).toBe(400);
  });

  test('TC004 — Transfer fails when currency is not supported', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer(unsupportedCurrency);

    expect(response.status()).toBe(400);
  });

  test('TC005 — Insufficient balance', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransfer(insufficientBalance);

    expect(response.status()).toBe(422);
  });

//   test('TC006 — Missing sender wallet', async ({ request }) => {
//     const client = new TransferApiClient(request, BASE_URL);
//     const response = await client.createTransfer(missingSenderWallet);

//     expect(response.status()).toBe(400);
//   });

  test('TC007 — Unauthorized request', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);
    const response = await client.createTransferWithoutAuth(validTransfer);

    expect(response.status()).toBe(401);
  });

  test('TC008 — Duplicate transfer is rejected', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);

    const first = await client.createTransfer(duplicateTransfer);
    expect(first.status()).toBe(200);

    const second = await client.createTransfer(duplicateTransfer);
    expect(second.status()).toBe(409);
  });

//   test('TC009 — Above approval threshold', async ({ request }) => {
//     const client = new TransferApiClient(request, BASE_URL);
//     const response = await client.createTransfer(aboveApprovalThreshold);

//     expect(response.status()).toBe(202);
//   });

//   test('TC010 — Above max limit rejected', async ({ request }) => {
//     const client = new TransferApiClient(request, BASE_URL);
//     const response = await client.createTransfer(aboveMaximumLimit);

//     expect(response.status()).toBe(400);
//   });

});

test.describe('Boundary Value Analysis', () => {

  test('BVA001 — £0 rejected', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);

    const response = await client.createTransfer({
      senderWalletId: 'WALLET001',
      receiverWalletId: 'WALLET002',
      amount: 0,
      currency: 'GBP'
    });

    expect(response.status()).toBe(400);
  });

  test('BVA002 — £1 accepted', async ({ request }) => {
    const client = new TransferApiClient(request, BASE_URL);

    const response = await client.createTransfer({
      senderWalletId: 'WALLET001',
      receiverWalletId: 'WALLET002',
      amount: 1,
      currency: 'GBP'
    });

    expect(response.status()).toBe(200);
  });

});