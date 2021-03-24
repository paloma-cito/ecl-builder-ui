import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
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
export class EclService {

    private eclObject = new Subject<any>();
    private eclString = new Subject<any>();


    constructor() {
    }

    // Setters & Getters: ECL Object
    setEclObject(eclObject): void {
        this.eclObject.next(eclObject);
    }

    getEclObject(): Observable<any> {
        return this.eclObject.asObservable();
    }

    // Setters & Getters: ECL String
    setEclString(eclString): void {
        this.eclString.next(eclString);
    }

    getEclString(): Observable<string> {
        return this.eclString.asObservable();
    }

    createShortFormConcept(expression): string {
        if (expression.wildcard) {
            return '*';
        } else {
            return expression.conceptId + ' |' + expression.term + '|';
        }
    }

    convertExpressionToConjunction(expression): ECLConjunctionExpression {
        return new ECLConjunctionExpression([expression]);
    }

    convertDisjunctionToConjunction(disjunction): ECLConjunctionExpression {
        return new ECLConjunctionExpression(disjunction.disjunctionExpressionConstraints);
    }

    convertConjunctionToDisjunction(conjunction): ECLDisjunctionExpression {
        return new ECLDisjunctionExpression(conjunction.conjunctionExpressionConstraints);
    }

    convertExpressionToRefinement(expression): ECLExpressionWithRefinement {
        return new ECLExpressionWithRefinement(
            new ECLExpression(
                expression.operator,
                expression.conceptId,
                expression.wildcard,
                expression.term,
                this.createShortFormConcept(expression)),
            new EClRefinement(new SubRefinement(new EClAttributeSet(new SubAttributeSet(new Attribute(
                new ECLExpression(),
                '=',
                new ECLExpression(),
                false,
                1
            )))))
        );
    }
}
