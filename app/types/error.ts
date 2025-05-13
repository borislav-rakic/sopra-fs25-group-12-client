export interface ApplicationError extends Error {
  info: string;
  status: number;
  error: string;
}
