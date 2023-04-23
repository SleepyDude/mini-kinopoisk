import { ApiProperty } from "@nestjs/swagger";

export class UserDto {
    @ApiProperty({example: 'name@post.com', description: 'e-mail address'})
    email: string;

    @ApiProperty({example: '1', description: 'Unique user id'})
    id: number;

    @ApiProperty({example: '1', description: 'Unique user id'})
    roles: [any] | [];

    constructor(model) {
        this.email = model.email;
        this.id = model.id;
        this.roles = model.roles;
    }
}