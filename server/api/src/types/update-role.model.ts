import { CreateRoleDto } from "@hotels2023nestjs/shared";
import { PartialType } from "@nestjs/swagger";

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}