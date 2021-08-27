import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {
    ECLConjunctionExpression,
    ECLDisjunctionExpression,
    ECLExpression,
    ECLExpressionWithRefinement
} from '../models/ecl';
import {EclService} from './ecl.service';

@Injectable({
    providedIn: 'root'
})
export class HttpService {

    constructor(private http: HttpClient, private eclService: EclService) {
    }

    getTypeahead(url, branch, term): Observable<any> {
        return this.http.get(url + '/' + branch + '/concepts?activeFilter=true&termActive=true&limit=20&term=' + term)
            .pipe(map(response => {
                const typeaheads = [];

                response['items'].forEach((item) => {
                    typeaheads.push(item.id + ' |' + item.fsn.term + '|');
                });

                return typeaheads;
            }));
    }

    getMrcmType(url, branch, term, conceptId): Observable<any> {
        return this.http.get(url + '/mrcm/' + branch + '/domain-attributes?expand=pt(),fsn()&limit=50&parentIds=' + conceptId)
            .pipe(map(response => {
                const typeaheads = [];
                const terms = term.split(' ');
                let found = false;
                response['items'].forEach((item) => {
                    terms.forEach((subTerm) => {
                        if (item.fsn.term.toLowerCase().includes(subTerm.toLowerCase())) {
                            found = true;
                        } else {
                            found = false;
                        }
                    });
                    if (found) {
                        typeaheads.push(item.id + ' |' + item.fsn.term + '|');
                    }
                });

                return typeaheads;
            }));
    }

    getMrcmTarget(url, branch, term, conceptId): Observable<any> {
        return this.http.get(url + '/mrcm/' + branch + '/attribute-values/' + conceptId + '?expand=fsn()&limit=50&termPrefix=' + term)
            .pipe(map(response => {
                const typeaheads = [];

                response['items'].forEach((item) => {
                    typeaheads.push(item.id + ' |' + item.fsn.term + '|');
                });

                return typeaheads;
            }));
    }

    getAttributes(url, branch): Observable<any> {
        return this.http.get<any>(url + '/' + branch + '/concepts?ecl=<<762706009');
    }

    getStringToModel(url, eclString): Observable<any> {
        return this.http.post(url + '/util/ecl-string-to-model', eclString).pipe(map(response => {

            if (response['conjunctionExpressionConstraints']) {
                const expression: ECLConjunctionExpression = this.cloneObject(response);

                expression.conjunctionExpressionConstraints.forEach(item => {
                    item.fullTerm = this.eclService.createShortFormConcept(item);
                });


                return this.addSelfOperator(expression);
            } else if (response['disjunctionExpressionConstraints']) {
                const expression: ECLDisjunctionExpression = this.cloneObject(response);

                expression.disjunctionExpressionConstraints.forEach(item => {
                    item.fullTerm = this.eclService.createShortFormConcept(item);
                });


                return this.addSelfOperator(expression);
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


                return this.addSelfOperator(expression);
            } else {
                const expression: ECLExpression = this.cloneObject(response);
                expression.fullTerm = this.eclService.createShortFormConcept(expression);
                return this.addSelfOperator(expression);
            }
        }));
    }

    getModelToString(url, eclObject): Observable<any> {
        eclObject = this.removeFullTerms(eclObject);
        eclObject = this.removeSelfOperator(eclObject);

        return this.http.post(url + '/util/ecl-model-to-string', this.removeSelfOperator(eclObject)).pipe(map(response => {
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

    addSelfOperator(eclObject): any {
        const expression: any = this.cloneObject(eclObject);
        if (!expression.operator) {
            expression.operator = 'self';
        }
        if (expression.conjunctionExpressionConstraints) {
            expression.conjunctionExpressionConstraints.forEach(item => {
                if (!item.operator) {
                    item.operator = 'self';
                }
            });
        } else if (expression.disjunctionExpressionConstraints) {
            expression.disjunctionExpressionConstraints.forEach(item => {
                if (!item.operator) {
                    item.operator = 'self';
                }
            });
        } else if (expression.subexpressionConstraint) {
            if (!expression.subexpressionConstraint.operator) {
                expression.subexpressionConstraint.operator = 'self';
            }

            if (expression.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet) {
                if (!expression.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.operator) {
                    expression.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.operator = 'self';
                }

                if (!expression.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.value.operator) {
                    expression.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.value.operator = 'self';
                }
            }

            if (expression.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet) {
                expression.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet.forEach(item => {
                    if (!item.attribute.attributeName.operator) {
                        item.attribute.attributeName.operator = 'self';
                    }

                    if (!item.attribute.value.operator) {
                        item.attribute.value.operator = 'self';
                    }
                });
            }

            if (expression.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet) {
                expression.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet.forEach(item => {
                    if (!item.attribute.attributeName.operator) {
                        item.attribute.attributeName.operator = 'self';
                    }

                    if (!item.attribute.value.operator) {
                        item.attribute.value.operator = 'self';
                    }
                });
            }
        }
        return expression;
    }

    removeSelfOperator(eclObject): any {
        if (eclObject.operator === 'self') {
            delete eclObject.operator;
        }
        if (eclObject.conjunctionExpressionConstraints) {
            eclObject.conjunctionExpressionConstraints.forEach(item => {
                if (item.operator === 'self') {
                    delete item.operator;
                }
            });
        } else if (eclObject.disjunctionExpressionConstraints) {
            eclObject.disjunctionExpressionConstraints.forEach(item => {
                if (item.operator === 'self') {
                    delete item.operator;
                }
            });
        } else if (eclObject.subexpressionConstraint) {
            if (eclObject.subexpressionConstraint.operator === 'self') {
                delete eclObject.subexpressionConstraint.operator;
            }

            if (eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet) {
                if (eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.operator === 'self') {
                    delete eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.operator;
                }

                if (eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.value.operator === 'self') {
                    delete eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.value.operator;
                }
            }

            if (eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet) {
                eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet.forEach(item => {
                    if (item.attribute.attributeName.operator === 'self') {
                        delete item.attribute.attributeName.operator;
                    }

                    if (item.attribute.value.operator === 'self') {
                        delete item.attribute.value.operator;
                    }
                });
            }

            if (eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet) {
                eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet.forEach(item => {
                    if (item.attribute.attributeName.operator === 'self') {
                        delete item.attribute.attributeName.operator;
                    }

                    if (item.attribute.value.operator === 'self') {
                        delete item.attribute.value.operator;
                    }
                });
            }
        }

        return eclObject;
    }

    cloneObject(object): any {
        return JSON.parse(JSON.stringify(object));
    }
}
