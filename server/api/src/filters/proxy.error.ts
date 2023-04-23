import { HttpException, HttpStatus } from "@nestjs/common";
import { catchError, throwError } from "rxjs";

export const rpcToHttp = () => catchError(val => (
    throwError( () => new HttpException(val.message, HttpStatus.BAD_REQUEST))
))