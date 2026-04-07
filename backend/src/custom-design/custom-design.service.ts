import { Injectable } from '@nestjs/common';
import { CreateCustomDesignDto } from './dto/create-custom-design.dto';
import { UpdateCustomDesignDto } from './dto/update-custom-design.dto';

@Injectable()
export class CustomDesignService {
  create(createCustomDesignDto: CreateCustomDesignDto) {
    return 'This action adds a new customDesign';
  }

  findAll() {
    return `This action returns all customDesign`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customDesign`;
  }

  update(id: number, updateCustomDesignDto: UpdateCustomDesignDto) {
    return `This action updates a #${id} customDesign`;
  }

  remove(id: number) {
    return `This action removes a #${id} customDesign`;
  }
}
