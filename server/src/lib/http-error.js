export class HttpError extends Error {
  constructor(status, message, code = 'REQUEST_ERROR', details = undefined) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function parseBody(schema, body) {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw new HttpError(400, 'Data yang dikirim tidak valid.', 'VALIDATION_ERROR', details);
  }
  return parsed.data;
}
