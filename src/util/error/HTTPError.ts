import type { Response } from 'node-fetch';

export default class HTTPError<JSON> extends Error {
  json: JSON | null;
  response: Response;
  status: number;
  statusText: string;
  url: string;

  constructor({
    message,
    json,
    response,
  }: {
    message?: string | undefined,
    json?: JSON | null,
    response: Response,
  }) {
    super(message ?? response.statusText);
    this.name = 'HTTPError';
    this.json = json ?? null;
    this.response = response;
    this.status = response?.status;
    this.statusText = response?.statusText;
    this.url = response?.url;

    Object.setPrototypeOf(this, HTTPError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}