import { Controller, UseFilters } from "@nestjs/common";
import { Ctx, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { ExceptionFilter } from "../rpc-exception.filter";
import { CreateRoleDto } from "./dto/create-role.dto";
import { DeleteRoleDto } from "./dto/delete-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
// import { HttpExceptionFilter, SharedService } from "y/shared";
// import { CreateRoleDto } from "y/shared/dto";
// import { DtoValidationPipe } from "y/shared/pipes/dto-validation.pipe";
import { RolesService } from "./roles.service";

@UseFilters(ExceptionFilter)
@Controller('roles')
export class RolesController {

    constructor(
        private readonly rolesService: RolesService,
        // private readonly sharedService: SharedService,
    ) {}

    
    // @UseFilters(new HttpExceptionFilter())
    @MessagePattern({ cmd: 'create-role' })
    async getUser(
        // @Ctx() context: RmqContext,
        @Payload('dto') dto: CreateRoleDto,
        @Payload('maxRoleValue') maxRoleValue: number,
    ) {
        // this.sharedService.acknowledgeMessage(context);
        console.log(`[roles.controller][create-dto] dto: ${JSON.stringify(dto)} maxRoleValue: ${maxRoleValue}`);

        return await this.rolesService.createRole(dto, maxRoleValue);
    }

    // @UseFilters(new HttpExceptionFilter())
    @MessagePattern({ cmd: 'get-role-by-name' })
    getByName(
        // @Ctx() context: RmqContext,
        @Payload() roleName: string
    ) {
        console.log(`[roles.controller][get-role-by-name] name: ${roleName}`);
        return this.rolesService.getRoleByName(roleName);
    }

    // @UseFilters(new HttpExceptionFilter())
    @MessagePattern({ cmd: 'get-all-roles' })
    getAllRoles() {
        return this.rolesService.getAllRoles();
    }

    @MessagePattern({ cmd: 'delete-role-by-name' })
    deleteRoleByName(
        @Payload('name') name: string,
        @Payload('maxRoleValue') maxRoleValue: number
    ) {
        return this.rolesService.deleteByName(name, maxRoleValue);
    }

    @MessagePattern({ cmd: 'update-role-by-name' })
    updateRoleByName(
        @Payload('name') name: string,
        @Payload('maxRoleValue') maxRoleValue: number,
        @Payload('dto') dto: UpdateRoleDto,
    ) {
        return this.rolesService.updateByName(name, dto, maxRoleValue);
    }
}
