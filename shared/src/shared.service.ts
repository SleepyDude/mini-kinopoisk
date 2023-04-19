import { Injectable, Inject } from '@nestjs/common';
import { SharedOptionsDto } from './dto/shared-options.dto';

@Injectable()
export class SharedService {

	constructor(@Inject('GLADIATOR_OPTIONS') private gladiatorOptions: SharedOptionsDto) {}

	// async IsUsingSword(): Promise<boolean> {
	// 	return this.gladiatorOptions.weapon == 'Sword'
	// }
}