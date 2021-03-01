import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HttpService {

    constructor(private http: HttpClient) {
    }

    getTypeahead(url, term): Observable<any> {
        return this.http.get(url + '/MAIN/concepts?activeFilter=true&termActive=true&limit=20&term=' + term)
            .pipe(map(response => {
                const typeaheads = [];

                response['items'].forEach((item) => {
                    typeaheads.push(item.id + ' |' + item.fsn.term + '|');
                });

                return typeaheads;
            }));
    }

    getStringToModel(url, eclString): Observable<any> {
        return this.http.get(url + '/util/ecl-string-to-model?ecl=' + eclString);
    }

    getModelToString(url, eclObject): Observable<any> {
        if (eclObject.fullTerm) {
            delete eclObject.fullTerm;
        }
        return this.http.post(url + '/util/ecl-model-to-string', eclObject).pipe(map(response => {
            return response['eclString'];
        }));
    }
}
