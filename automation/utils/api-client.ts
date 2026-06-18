import { APIRequestContext } from '@playwright/test';

export class TransferApiClient {
  private request: APIRequestContext;
  private baseUrl: string;

  constructor(request: APIRequestContext, baseUrl: string) {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  async createTransfer(payload: object) {
    const response = await this.request.post(`${this.baseUrl}/api/v1/transfers`, {
      data: payload,
    });
    return response;
  }

  async createTransferWithoutAuth(payload: object) {
    const response = await this.request.post(`${this.baseUrl}/api/v1/transfers`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': '',
      },
    });
    return response;
  }
}