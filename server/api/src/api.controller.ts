import { Controller, Get } from "@nestjs/common";

@Controller()
export class ApiController {

  constructor() {}

  @Get()
  async helloWorld() {
    return "Hello!";
  }
}