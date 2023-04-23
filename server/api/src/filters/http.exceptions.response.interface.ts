export interface HttpExceptionResponse {
    statusCode: number;
    error: string | object;
}

export interface CustomHttpExceptionResponse extends HttpExceptionResponse {
    path: string;
    method: string;
    timeStamp: Date;
}