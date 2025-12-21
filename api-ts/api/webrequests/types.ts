export type RouteHandler = (
  anythreads: any,
  request: Request,
  params: Record<string, string>,
) => Promise<Response>;

export type Route = {
  method: string;
  pattern: string;
  handler: RouteHandler;
};

export type SuccessResponse<T> = {
  data: T;
};

export type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};
