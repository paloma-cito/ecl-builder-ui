import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {ECLConjunctionExpression, ECLDisjunctionExpression, ECLExpression, ECLExpressionWithRefinement} from '../models/ecl';
import {EclService} from './ecl.service';

@Injectable({
    providedIn: 'root'
})
export class HttpService {

    constructor(private http: HttpClient, private eclService: EclService) {
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
                const expression: ECLConjunctionExpression = this.cloneObject(response);

                expression.conjunctionExpressionConstraints.forEach(item => {
                    item.fullTerm = this.eclService.createShortFormConcept(item);
                });

                return expression;
            } else if (response['disjunctionExpressionConstraints']) {
                const expression: ECLDisjunctionExpression = this.cloneObject(response);

                expression.disjunctionExpressionConstraints.forEach(item => {
                    item.fullTerm = this.eclService.createShortFormConcept(item);
                });

                return expression;
            } else if (response['subexpressionConstraint']) {
                const expression: ECLExpressionWithRefinement = this.cloneObject(response);
                expression.subexpressionConstraint.fullTerm = this.eclService.createShortFormConcept(expression.subexpressionConstraint);
                expression.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.fullTerm = this.eclService.createShortFormConcept(expression.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName);
                expression.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.value.fullTerm = this.eclService.createShortFormConcept(expression.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.value);

                if (expression.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet) {
                    expression.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet.forEach(item => {
                        item.attribute.attributeName.fullTerm = this.eclService.createShortFormConcept(item.attribute.attributeName);
                        item.attribute.value.fullTerm = this.eclService.createShortFormConcept(item.attribute.value);
                    });
                }

                if (expression.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet) {
                    expression.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet.forEach(item => {
                        item.attribute.attributeName.fullTerm = this.eclService.createShortFormConcept(item.attribute.attributeName);
                        item.attribute.value.fullTerm = this.eclService.createShortFormConcept(item.attribute.value);
                    });
                }

                return expression;
            } else {
                const expression: ECLExpression = this.cloneObject(response);
                expression.fullTerm = this.eclService.createShortFormConcept(expression);
                return expression;
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
        } else if (eclObject.subexpressionConstraint) {
            delete eclObject.subexpressionConstraint.fullTerm;

            if (eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet) {
                delete eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.fullTerm;
                delete eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.value.fullTerm;
            }

            if (eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet) {
                eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet.forEach(item => {
                    delete item.attribute.attributeName.fullTerm;
                    delete item.attribute.value.fullTerm;
                });
            }

            if (eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet) {
                eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet.forEach(item => {
                    delete item.attribute.attributeName.fullTerm;
                    delete item.attribute.value.fullTerm;
                });
            }
        }

        return eclObject;
    }

    cloneObject(object): any {
        return JSON.parse(JSON.stringify(object));
    }
}
