export type ApiErrorResponse = {
  status: number;
  message: string;
  code: string;
  field: string | null;
};

export class ApiError extends Error {
  status: number;
  code: string;
  field: string | null;

  constructor(e: ApiErrorResponse) {
    super(e.message);
    this.status = e.status;
    this.code = e.code;
    this.field = e.field;
  }
}
