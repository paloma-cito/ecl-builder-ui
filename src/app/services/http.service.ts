import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
    Attribute,
    EClAttributeSet,
    ECLConjunctionExpression,
    ECLDisjunctionExpression,
    ECLExpression,
    ECLExpressionWithRefinement, EClRefinement, SubAttributeSet, SubRefinement
} from '../models/ecl';

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
            } else  if (response['subexpressionConstraint']) {
                const models = new ECLExpressionWithRefinement(
                    new ECLExpression(
                        response['subexpressionConstraint'].operator,
                        response['subexpressionConstraint'].conceptId,
                        response['subexpressionConstraint'].wildcard,
                        response['subexpressionConstraint'].term,
                        response['subexpressionConstraint'].conceptId + ' |' + response['subexpressionConstraint'].term + '|'),
                    new EClRefinement(new SubRefinement(new EClAttributeSet(new SubAttributeSet(new Attribute(
                            new ECLExpression(
                                response['eclRefinement'].subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.operator,
                                response['eclRefinement'].subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.conceptId,
                                response['eclRefinement'].subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.wildcard,
                                response['eclRefinement'].subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.term,
                                response['eclRefinement'].subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.conceptId + ' |'
                                + response['eclRefinement'].subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.term + '|'),
                            response['eclRefinement'].subRefinement.eclAttributeSet.subAttributeSet.attribute.expressionComparisonOperator,
                            new ECLExpression(
                                response['eclRefinement'].subRefinement.eclAttributeSet.subAttributeSet.attribute.value.operator,
                                response['eclRefinement'].subRefinement.eclAttributeSet.subAttributeSet.attribute.value.conceptId,
                                response['eclRefinement'].subRefinement.eclAttributeSet.subAttributeSet.attribute.value.wildcard,
                                response['eclRefinement'].subRefinement.eclAttributeSet.subAttributeSet.attribute.value.term,
                                response['eclRefinement'].subRefinement.eclAttributeSet.subAttributeSet.attribute.value.conceptId + ' |'
                                + response['eclRefinement'].subRefinement.eclAttributeSet.subAttributeSet.attribute.value.term + '|'),
                            response['eclRefinement'].subRefinement.eclAttributeSet.subAttributeSet.attribute.reverse,
                            response['eclRefinement'].subRefinement.eclAttributeSet.subAttributeSet.attribute.cardinalityMin
                    )))))
                );

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
        if (eclObject instanceof ECLExpression) {
            delete eclObject.fullTerm;
        } else if (eclObject instanceof ECLConjunctionExpression) {
            eclObject.conjunctionExpressionConstraints.forEach(item => {
                delete item.fullTerm;
            });
        } else if (eclObject instanceof ECLDisjunctionExpression) {
            eclObject.disjunctionExpressionConstraints.forEach(item => {
                delete item.fullTerm;
            });
        } else if (eclObject instanceof ECLExpressionWithRefinement) {
            delete eclObject.subexpressionConstraint.fullTerm;
            delete eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.fullTerm;
            delete eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.value.fullTerm;
        }
        return eclObject;
    }
}
