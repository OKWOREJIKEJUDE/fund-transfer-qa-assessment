export const validTransfer = {
  senderWalletId: 'WALLET001',
  receiverWalletId: 'WALLET002',
  amount: 500,
  currency: 'GBP',
};

export const zeroAmount = {
  ...validTransfer,
  amount: 0,
};

export const negativeAmount = {
  ...validTransfer,
  amount: -100,
};

export const unsupportedCurrency = {
  ...validTransfer,
  currency: 'JPY',
};

export const insufficientBalance = {
  ...validTransfer,
  senderWalletId: 'WALLET_EMPTY',
};

export const aboveMaxLimit = {
  ...validTransfer,
  amount: 10000.01,
};

export const requiresApproval = {
  ...validTransfer,
  amount: 5000.01,
};

export const missingAmount = {
  senderWalletId: 'WALLET001',
  receiverWalletId: 'WALLET002',
  currency: 'GBP',
};

export const duplicateTransfer = {
  ...validTransfer,
};

