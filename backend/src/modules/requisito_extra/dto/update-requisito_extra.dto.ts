import { PartialType } from '@nestjs/mapped-types';
import { CreateRequisitoExtraDto } from './create-requisito_extra.dto';

export class UpdateRequisitoExtraDto extends PartialType(CreateRequisitoExtraDto) {}
