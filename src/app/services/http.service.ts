import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {ECLConjunctionExpression, ECLDisjunctionExpression, ECLExpression} from '../models/ecl';

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
        return this.http.post(url + '/util/ecl-string-to-model', eclString).pipe(map(response => {

            if (response['conjunctionExpressionConstraints']) {
                const models = new ECLConjunctionExpression([]);

                response['conjunctionExpressionConstraints'].forEach((item) => {
                    models.conjunctionExpressionConstraints.push(new ECLExpression(item.operator,
                        item.conceptId, item.wildcard, item.term, item.conceptId + ' |' + item.term + '|'));
                });

                return models;
            } else if (response['disjunctionExpressionConstraints']) {
                const models = new ECLDisjunctionExpression([]);

                response['disjunctionExpressionConstraints'].forEach((item) => {
                    models.disjunctionExpressionConstraints.push(new ECLExpression(item.operator,
                        item.conceptId, item.wildcard, item.term, item.conceptId + ' |' + item.term + '|'));
                });

                return models;
            } else {
                return new ECLExpression(response['operator'], response['conceptId'], response['wildcard'], response['term'], response['conceptId'] + ' |' + response['term'] + '|');
            }
        }));
    }

    getModelToString(url, eclObject): Observable<any> {
        eclObject = this.removeFullTerms(eclObject);

        return this.http.post(url + '/util/ecl-model-to-string', eclObject).pipe(map(response => {
            return response['eclString'];
        }));
    }

    removeFullTerms(eclObject): any {
        if (eclObject.fullTerm) {
            delete eclObject.fullTerm;
        } else if (eclObject.conjunctionExpressionConstraints) {
            eclObject.conjunctionExpressionConstraints.forEach(item => {
                delete item.fullTerm;
            });
        } else if (eclObject.disjunctionExpressionConstraints) {
            eclObject.disjunctionExpressionConstraints.forEach(item => {
                delete item.fullTerm;
            });
        }
        return eclObject;
    }
}
