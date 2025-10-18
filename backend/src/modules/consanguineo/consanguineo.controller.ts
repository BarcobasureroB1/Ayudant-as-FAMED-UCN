import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConsanguineoService } from './consanguineo.service';
import { CreateConsanguineoDto } from './dto/create-consanguineo.dto';


@Controller('consanguineo')
export class ConsanguineoController {
  constructor(private readonly consanguineoService: ConsanguineoService) {}

  @Post()
  create(@Body() createConsanguineoDto: CreateConsanguineoDto) {
    return this.consanguineoService.create(createConsanguineoDto);
  }

  @Get()
  findAll() {
    return this.consanguineoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consanguineoService.findOne(+id);
  }

 

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consanguineoService.remove(+id);
  }
}
