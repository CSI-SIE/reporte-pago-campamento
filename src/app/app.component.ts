import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl} from '@angular/forms';
import { map, Observable, startWith, Subscription } from 'rxjs';
//import { CatalogoTipo } from './shared/models/CatalogoPagoCampamento';
import { CatalogosService} from './services/catalogo.service';
import { DatePipe } from '@angular/common';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

//Autor: Ing. Joaquín Santiago González
//Fecha: 2022-05-10
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  //Tabla---------------
  resultadosReportePagoCampamento:any[] = [];
  /*resultadosReportePagoCampamento:any[] = [
    {
      nombre: 'Pedro Pablo León Jaramillo ',
      correo: 'pedro@iest.edu.mx',
      tcasa: '8331234567',
      folio: '00000123',
      costo: '$5000',
      fechahora: '2022-05-03 13:05:10'
    },
    {
      nombre: 'Pablo Emilio E. Gaviria',
      correo: 'pablo@iest.edu.mx',
      tcasa: '8331234567',
      folio: '00000123',
      costo: '$5000',
      fechahora: '2022-05-03 13:05:10'
    },
    {
      nombre: 'Joaquín Santiago González',
      correo: 'joaquin.santiago@iest.edu.mx',
      tcasa: '8331234567',
      folio: '00000123',
      costo: '$5000',
      fechahora: '2022-05-03 13:05:10'
    },
    {
      nombre: 'Verónica Janeth Díaz Gutiérrez',
      correo: 'veronica.diaz@iest.edu.mx',
      tcasa: '8331234567',
      folio: '00000123',
      costo: '$5000',
      fechahora: '2022-05-03 13:05:10'
    },
    {
      nombre: 'Manuel Alejandro Jimenez Quintero',
      correo: 'manuel.jimenez01@iest.edu.mx',
      tcasa: '8331234567',
      folio: '00000123',
      costo: '$5000',
      fechahora: '2022-05-03 13:05:10'
    }
  ];*/



  rutaDelGeneradorDeReportes = "https://sie.iest.edu.mx/app/escolar/GeneraExcel2.php?";

  pageSizeOptions = [5, 10, 20, 30, 40];
  tamanoTabla = "w-sm-90 w-lg-70 w-xl-50";
  //-------------------

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  verSpinner:boolean = false;
  clicBusqueda = false;
  descargaCorrecta = false;
  //AutoCompletar----------------
  myControl = new FormControl();
  //filteredOptions: Observable<CatalogoTipo[]>;
  //----------------------------
  //Para convertir el formato de fecha
  pipe = new DatePipe('en-US');
  //----------------------------------
  private suscripciones: Subscription[];

  public formularioSolicitudReporte: FormGroup;

  title = 'Reporte de adeudos diversos';

    //Catálogos
  //public catalogoTipo: CatalogoTipo[];

  constructor(
    private _snackBar: MatSnackBar,
    private _fb: FormBuilder,
    private _catalogoService: CatalogosService
    ){
      this.suscripciones = [];

      this.formularioSolicitudReporte = this._fb.group({
        FechaInicio: [
          null,
          [
            Validators.required
          ]
        ],
        FechaFin: [
          null,
          [
            Validators.required
          ]
        ]
      });

      const observadorValidadorFormulario$ =
      this.formularioSolicitudReporte.valueChanges.subscribe(
        (datos) => {
          this.dcfSolicitudReporte(datos);
        }
      );

      this.suscripciones.push(observadorValidadorFormulario$);
      this.dcfSolicitudReporte();

      //Catálogos
     // this.catalogoTipo = [];
      this.verSpinner = false;
      this.clicBusqueda = false;
      this.descargaCorrecta = false;

    }//TerminaConstructor :)

    //TABLA-------------------------------
  //Estos nombres cambian respecto a como lo mandan de la consulta
  public displayedColumnsGrupo = {
    columnas: {
      folio: ['FOLIO'],
      nombre: ['NOMBRE'],
      correo: ['CORREO'],
      tcasa: ['TELÉFONO DE CASA'],

      costo: ['COSTO'],
      fechahora: ['FECHA Y HORA'],

      paraMostrar: ['folio','nombre','correo','tcasa', 'costo','fechahora']
    }

  };
//------------------------------------

    openSnackBar() {
      this._snackBar.open('Reporte descargado correctamente, por favor revisa tus descargas.', '', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: 5000

      });
    }

    //ef = errores - formualrio
    public efSolicitudReporte: any = {
      FechaIncio: '',
      FechaFin: ''
    };

    //mvf - mensajes de validación del formulario
    public mvfSolicitudReporte: any = {
      FechaInicio: {
        required: 'Selecciona una fecha'
      },
      FechaFin: {
        required: 'Selecciona una fecha'
      }
    };

    onSubmit(){
      this.clicBusqueda = true;
      this.descargaCorrecta = false;

      this.verSpinner = true; //SPINNER

      this.resultadosReportePagoCampamento =[];

          let FechaInicial:string= this.pipe.transform(this.formularioSolicitudReporte.value['FechaInicio'], 'yyyyMMdd');
          let FechaFinal:string= this.pipe.transform(this.formularioSolicitudReporte.value['FechaFin'], 'yyyyMMdd');

          //--------------------------------------------------------------------------------------
          const buscarDatos$ = this._catalogoService.consultaDelReporte(FechaInicial, FechaFinal).subscribe(
            {
              next: (resultado) =>{

              this.resultadosReportePagoCampamento = resultado;

              },
              error: (errores) => {
                console.error(errores);
              },
              complete: () =>{
                this.verSpinner = false; //SPINNER
              }
            }
          );

            //Se agrega aquí para después poder matar estas suscripciones
            this.suscripciones.push(buscarDatos$);
          //--------------------------------------------------------------------------------------
    }

    descargarExcel(){

      this.descargaCorrecta = false;

      this.verSpinner = true; //SPINNER

      let accion:number = 2;
      let FechaInicial:string= this.pipe.transform(this.formularioSolicitudReporte.value['FechaInicio'], 'yyyyMMdd');
      let FechaFinal:string= this.pipe.transform(this.formularioSolicitudReporte.value['FechaFin'], 'yyyyMMdd');

      /*var param = "query=exec contralorianew.dbo.Camp_ListarFoliosLiga '"+
                    FechaInicial+"','" + FechaFinal+"'";

                document.location.href = this.rutaDelGeneradorDeReportes + param;*/
      //--------------------------------------------------------------------------------------
      const buscarDatos$ = this._catalogoService.consultaDelReporte(FechaInicial, FechaFinal).subscribe(
        {
          next: (resultado) =>{
            var param = "query=exec contralorianew.dbo.Camp_ListarFoliosLiga '"+
                FechaInicial+"','" + FechaFinal+"'";

                document.location.href = this.rutaDelGeneradorDeReportes + param;

                this.openSnackBar();
          },
          error: (errores) => {
            console.error(errores);
          },
          complete: () =>{
            this.verSpinner = false; //SPINNER
          }
        }
      );

        //Se agrega aquí para después poder matar estas suscripciones
        this.suscripciones.push(buscarDatos$);
      //--------------------------------------------------------------------------------------
    }

    //Autocompletar tipo de adeudo------------------------------------------------------------
    /*displayFn(tipoAdeudo: CatalogoTipo): string {
      return tipoAdeudo && tipoAdeudo.operacion ? tipoAdeudo.operacion : '';
    }

    private _filter(tipoAdeudo: string): CatalogoTipo[] {
      const filterValue = tipoAdeudo.toLowerCase();

      return this.catalogoTipo.filter(option => option.operacion.toLowerCase().includes(filterValue));
    }*/
    //----------------------------------------------------------------------------------------
    /*getSeleccionado(seleccionado: string) {
      return this.catalogoTipo.find(tipo => tipo.operacion === seleccionado).idOperacion;
    }*/

    ngOnInit(): void {
      //Autocompletar tipo de adeudo------------------------------------------------------------
      /*this.filteredOptions = this.myControl.valueChanges.pipe(
        startWith(''),
        map(value => (typeof value === 'string' ? value : value.tipoAdeudo)),
        map(tipoAdeudo => (tipoAdeudo ? this._filter(tipoAdeudo) : this.catalogoTipo.slice())),
      );*/
      //----------------------------------------------------------------------------------------

        //--------------------------------------------------------------------------------------
        /*const recuperarCatalogoTipos$ = this._catalogoService.recuperarCatalogoTipo().subscribe(
          {
            next: (tipos) =>{
              //console.log(tipos);
              this.catalogoTipo = tipos;
            },
            error: (errores) => {
              console.error(errores);
            },
            complete: () =>{

            }
          }
        );*/

          //Se agrega aquí para después poder matar estas suscripciones
          //this.suscripciones.push(recuperarCatalogoTipos$);
        //--------------------------------------------------------------------------------------
    }

    ngOnDestroy(){
      console.info(this.suscripciones.length + ' suscripciones serán destruidas');
      this.suscripciones.forEach((suscripcion) => {
        suscripcion.unsubscribe();
      })
    }


    //dcf = detecta - cambios - formulario-----------------------------
    private dcfSolicitudReporte(datos?: any): void{
      if(!this.formularioSolicitudReporte)
      {return;}
      const formulario = this.formularioSolicitudReporte;

      for(const campo in this.efSolicitudReporte){
        //Limpia mensajes de error previos de existir
        this.efSolicitudReporte[campo] = '';
        const control = formulario.get(campo);

        if(control && control.dirty && control.valid){
          const mensajes = this.mvfSolicitudReporte[campo];

          for(const clave in control.errors){
            if(control.errors.hasOwnProperty(clave)){
              this.efSolicitudReporte[campo] += mensajes[clave] + ' ';
            }
          }
        }
      }
    }
    //--------------------------------------------------------------

    //Es requerido -------------------------------------------------
    public esRequerido(campo:string):boolean{
      const campoFormulario = this.formularioSolicitudReporte.get(campo);
      let validator: any;
      if(campoFormulario){
        validator = (campoFormulario.validator ? campoFormulario.validator({} as AbstractControl): false);
        if(validator && validator.required){
          return true;
        }
      }
      return true;
    }
    //--------------------------------------------------------------



}
