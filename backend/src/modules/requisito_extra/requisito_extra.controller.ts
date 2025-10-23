import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RequisitoExtraService } from './requisito_extra.service';
import { CreateRequisitoExtraDto } from './dto/create-requisito_extra.dto';
import { UpdateRequisitoExtraDto } from './dto/update-requisito_extra.dto';

@Controller('requisito-extra')
export class RequisitoExtraController {
  constructor(private readonly requisitoExtraService: RequisitoExtraService) {}

  @Post()
  create(@Body() createRequisitoExtraDto: CreateRequisitoExtraDto) {
    return this.requisitoExtraService.create(createRequisitoExtraDto);
  }

  @Get()
  findAll() {
    return this.requisitoExtraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requisitoExtraService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequisitoExtraDto: UpdateRequisitoExtraDto) {
    return this.requisitoExtraService.update(+id, updateRequisitoExtraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requisitoExtraService.remove(+id);
  }
}
