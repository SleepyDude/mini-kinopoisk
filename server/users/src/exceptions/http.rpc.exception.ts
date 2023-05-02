import { RpcException } from "@nestjs/microservices";

export class HttpRpcException extends RpcException {
    statusCode: number;

    constructor(response: string, statusCode: number) {
        super(response);
        this.statusCode = statusCode;
    }
    // toJSON() {
    //     return {
    //         statusCode: this.statusCode,
    //         error: this.getError(),
    //     }
    // }
}