import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {ECLConjunctionExpression, ECLDisjunctionExpression} from '../models/ecl';

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

    convertDisjunctionToConjunction(disjunction): ECLConjunctionExpression {
        return new ECLConjunctionExpression(disjunction.disjunctionExpressionConstraints);
    }

    convertConjunctionToDisjunction(conjunction): ECLDisjunctionExpression {
        return new ECLDisjunctionExpression(conjunction.conjunctionExpressionConstraints);
    }
}
