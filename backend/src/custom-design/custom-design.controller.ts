import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomDesignService } from './custom-design.service';
import { CreateCustomDesignDto } from './dto/create-custom-design.dto';
import { UpdateCustomDesignDto } from './dto/update-custom-design.dto';

@Controller('custom-design')
export class CustomDesignController {
  constructor(private readonly customDesignService: CustomDesignService) {}

  @Post()
  create(@Body() createCustomDesignDto: CreateCustomDesignDto) {
    return this.customDesignService.create(createCustomDesignDto);
  }

  @Get()
  findAll() {
    return this.customDesignService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customDesignService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomDesignDto: UpdateCustomDesignDto) {
    return this.customDesignService.update(+id, updateCustomDesignDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customDesignService.remove(+id);
  }
}
