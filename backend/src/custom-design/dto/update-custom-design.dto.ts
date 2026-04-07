import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomDesignDto } from './create-custom-design.dto';

export class UpdateCustomDesignDto extends PartialType(CreateCustomDesignDto) {}
