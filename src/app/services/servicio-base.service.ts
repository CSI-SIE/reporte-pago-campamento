import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const APIURL = 'api/Caja/caja.php';

export class ServicioBase {
  constructor(
    private _http:HttpClient
  ) {}

  public consulta(params: any, apiUrl: string = APIURL): Observable<any>{
    const formData = new FormData();

    Object.keys(params).forEach(key=>{
      formData.append(key,params[key]);
    });


    return this._http.post<any>(environment.server + apiUrl, formData).pipe(map(res => res.info ? res.info : res));
    //pipe limpia la respuesta quitando .info
  }

}
