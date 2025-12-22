import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AsignaturaService } from './asignatura.service';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';



@Controller('asignatura')
export class AsignaturaController {
  constructor(private readonly asignaturaService: AsignaturaService) {}

  @Post()
  create(@Body() createAsignaturaDto: CreateAsignaturaDto) {
    return this.asignaturaService.create(createAsignaturaDto);
  }
  @Get()
  async findall(){
    return await this.asignaturaService.findAll()
  }
  @Get('available/:rut_alumno')
  async findAvaibleAsignaturas(@Param('rut_alumno') rut_alumno: string){
    return await this.asignaturaService.findAvaibleAsignaturas(rut_alumno)
  }
  @Get(':rut_alumno')
  findOne(@Param('rut_alumno') rut_alumno: string) {
    return this.asignaturaService.findpostulablesByRut(rut_alumno);
  }

  @Get('por-departamento/:id_departamento')
  findByDepartamento(@Param('id_departamento') id_departamento: string) {
    return this.asignaturaService.findByDepartamentoId(+id_departamento);
  }

  @Patch('estado/:id')
  estadoAsignatura(@Param('id') id: string) {
    return this.asignaturaService.estadoAsignatura(+id);
  }

  @Patch('cerrar/:id')
  cerrarAsignatura(@Param('id') id: string) {
    return this.asignaturaService.cerrarAsignatura(+id);
  }
  @Get('coordinadores/:id_departamento')
  findwithcoordinador(@Param('id_departamento') id_departamento: string) {
    return this.asignaturaService.findwithcoordinador(+id_departamento);
  }
  @Get('coordinadores/sinfiltro/dif')
  findallwithcoordinador() {
    return this.asignaturaService.findallwithcoordinador();
  }

  @Get('concursoPendiente/false')
  findAsignaturasPendientes() {
    return this.asignaturaService.getAsignaturaPendientes();

  }

  @Patch('autorizarConcurso/:id')
  autorizarConcurso(@Param('id') id: string) {
    return this.asignaturaService.changeabiertaPostulacion(+id);
  }
  @Patch('denegarConcurso/:id')
  denegarConcurso(@Param('id') id: string){
    return this.asignaturaService.denegarConcurso(+id);
  }

  
}
