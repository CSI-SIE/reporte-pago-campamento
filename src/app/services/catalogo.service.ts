import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { CatalogoPagoCampamento } from '../shered/models/pagoCampamento.model'
import { ServicioBase } from './servicio-base.service';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService extends ServicioBase{
  constructor(
    private _sb: HttpClient
  ) {
    super(_sb);
  }

  /*public recuperarCatalogoTipo(): Observable<CatalogoPagoCampamento[]>{
    const parametros = {
      servicio: 'reportes',
      accion: 'AdeudoDiversoRapido_Catalogo',
      tipoRespuesta: 'json'
    };
    return this.consulta(parametros);
  }*/

  public consultaDelReporte(_fecha_ini:string, _fecha_fin:string): Observable<any>{
    const parametros = {
      servicio: 'campamento',
      accion: 'Camp_ListarFoliosLiga',
      fRegistro: _fecha_ini,
      fRegistroFin: _fecha_fin,

      tipoRespuesta: 'json'
    };
    return this.consulta(parametros);
  }


}
