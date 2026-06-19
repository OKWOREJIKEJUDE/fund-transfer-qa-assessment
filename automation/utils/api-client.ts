import { APIRequestContext } from '@playwright/test';

export class TransferApiClient {
  constructor(
    private request: APIRequestContext,
    private baseUrl: string
  ) {}

  async createTransfer(payload: object) {
    return this.request.post(`${this.baseUrl}/api/v1/transfers`, {
      data: payload,
    });
  }

  async createTransferWithoutAuth(payload: object) {
    return this.request.post(`${this.baseUrl}/api/v1/transfers`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': '',
      },
    });
  }
}