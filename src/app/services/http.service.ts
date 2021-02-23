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
        return this.http.get(url + '/concepts?activeFilter=true&termActive=true&limit=20&term=' + term)
            .pipe(map(responseData => {
                const typeaheads = [];

                responseData['items'].forEach((item) => {
                    typeaheads.push(item.id + ' |' + item.fsn.term + '|');
                });

                return typeaheads;
            }));
    }
}
