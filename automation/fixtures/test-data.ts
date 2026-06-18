export const validTransfer = {
  senderWalletId: 'WALLET001',
  receiverWalletId: 'WALLET002',
  amount: 500,
  currency: 'GBP',
};

export const zeroAmount = {
  senderWalletId: 'WALLET001',
  receiverWalletId: 'WALLET002',
  amount: 0,
  currency: 'GBP',
};

export const negativeAmount = {
  senderWalletId: 'WALLET001',
  receiverWalletId: 'WALLET002',
  amount: -100,
  currency: 'GBP',
};

export const unsupportedCurrency = {
  senderWalletId: 'WALLET001',
  receiverWalletId: 'WALLET002',
  amount: 500,
  currency: 'JPY',
};

export const insufficientBalance = {
  senderWalletId: 'WALLET_EMPTY',
  receiverWalletId: 'WALLET002',
  amount: 500,
  currency: 'GBP',
};

export const aboveMaxLimit = {
  senderWalletId: 'WALLET001',
  receiverWalletId: 'WALLET002',
  amount: 10000.01,
  currency: 'GBP',
};

export const requiresApproval = {
  senderWalletId: 'WALLET001',
  receiverWalletId: 'WALLET002',
  amount: 5000.01,
  currency: 'GBP',
};

export const missingAmount = {
  senderWalletId: 'WALLET001',
  receiverWalletId: 'WALLET002',
  currency: 'GBP',
};

export const duplicateTransfer = {
  senderWalletId: 'WALLET001',
  receiverWalletId: 'WALLET002',
  amount: 500,
  currency: 'GBP',
};

validTransfer