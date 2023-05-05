export class PersonsQueryDto {
  page?: number;
  size?: number;
  name?: string;
}

export class StaffQueryDto {
  id: number;
  size?: number;
}

export class PersonsAutosagestGto {
  profession: string;
  name: string;
  size?: number;
}
