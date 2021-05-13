import {Component, ElementRef, Input, Output, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {ECLExpression, SubAttributeSet, Attribute} from '../models/ecl';
import {catchError, debounceTime, distinctUntilChanged, filter, switchMap, tap} from 'rxjs/operators';
import {Observable, of, Subscription} from 'rxjs';
import {HttpService} from '../services/http.service';
import {EclService} from '../services/ecl.service';

@Component({
    selector: 'app-ecl-builder',
    templateUrl: './ecl-builder.component.html',
    styleUrls: ['./ecl-builder.component.scss']
})
export class EclBuilderComponent implements OnInit, OnDestroy {

    element: any;
    @Input() apiUrl: string;
    @Input() branch: string;
    @Output() output = new EventEmitter();

    eclObject: any;
    eclObjectSubscription: Subscription;
    @Input() eclString: string;
    eclStringSubscription: Subscription;

    search(eclObject): (text$: Observable<string>) => Observable<any[]> {
        return (text$: Observable<string>) => text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            filter((text) => text.length > 2),
            switchMap((text) => {
                eclObject.searching = true;
                return this.httpService.getTypeahead(this.apiUrl, this.branch, text).pipe(
                    tap(() => delete eclObject.searching));
            }),
            catchError(tap(() => delete eclObject.searching))
        );
    }

    searchMrcmType(conceptId, eclObject): (text$: Observable<string>) => Observable<any[]> {
        return (text$: Observable<string>) => text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            filter((text) => text.length > 2),
            switchMap((text) => {
                eclObject.searching = true;
                if (!conceptId){
                    return this.httpService.getTypeahead(this.apiUrl, this.branch, text).pipe(
                        tap(() => delete eclObject.searching));
                }
                else{
                    return this.httpService.getMrcmType(this.apiUrl, this.branch, text, conceptId).pipe(
                        tap(() => delete eclObject.searching));
                }
            }),
            catchError(tap(() => delete eclObject.searching))
        );
    }

    searchMrcmTarget(attributeName, value, type?): (text$: Observable<string>) => Observable<any[]> {
        return (text$: Observable<string>) => text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            filter((text) => text.length > 2),
            switchMap(term => {
                if (!attributeName.conceptId) {
                    value.searching = true;
                    return this.httpService.getTypeahead(this.apiUrl, this.branch, term).pipe(
                        tap(() => delete value.searching));
                }
                else if (!type) {
                    value.searching = true;
                    return this.httpService.getMrcmTarget(this.apiUrl, this.branch, term, attributeName.conceptId).pipe(
                        tap(() => delete value.searching));
                }
                else if (type === 'conjunction') {
                    value.searching = true;
                    return this.httpService.getMrcmTarget(this.apiUrl, this.branch, term, attributeName.conceptId).pipe(
                        tap(() => delete value.searching));
                }
                else if (type === 'disjunction') {
                    value.searching = true;
                    return this.httpService.getMrcmTarget(this.apiUrl, this.branch, term, attributeName.conceptId).pipe(
                        tap(() => delete value.searching));
                }
            }),
            catchError(tap(() => delete value.searching))
        );
    }

    constructor(private el: ElementRef, private httpService: HttpService, private eclService: EclService) {
        this.element = el.nativeElement;
        this.eclObjectSubscription = this.eclService.getEclObject().subscribe(data => this.eclObject = data);
        this.eclStringSubscription = this.eclService.getEclString().subscribe(data => this.eclString = data);
    }

    ngOnInit(): void {
        document.body.appendChild(this.element);
        this.element.addEventListener('click', el => {
            if (el.target.className === 'app-modal') {
                this.close();
            }
        });

        // console.log('eclString IN: ', this.eclString);

        if (this.eclString) {
            this.eclService.setEclString(this.eclString);

            this.httpService.getStringToModel(this.apiUrl, this.eclString).subscribe((dataObject: any) => {
                // console.log('API eclModel returned: ', dataObject);
                this.eclService.setEclObject(dataObject);
                this.updateExpression();
            });
        } else {
            this.clear();
        }
    }

    ngOnDestroy(): void {
        this.element.remove();
    }

    isMemberOf(operator): boolean {
        return operator === 'memberOf';
    }

    getConceptId(eclObject): void {
        if (eclObject) {
            if (eclObject.fullTerm === '*') {
                eclObject.wildcard = true;
                delete eclObject.conceptId;
                delete eclObject.term;
            } else {
                eclObject.wildcard = false;
                eclObject.conceptId = eclObject.fullTerm.slice(0, (eclObject.fullTerm.indexOf('|') - 1));
                eclObject.term = eclObject.fullTerm.slice(eclObject.fullTerm.indexOf('|') + 1, eclObject.fullTerm.lastIndexOf('|'));
            }
        }

        // this.updateExpression();
    }

    updateExpression(): void {
        const eclObject = this.cloneObject(this.eclObject);

        this.httpService.getModelToString(this.apiUrl, eclObject).pipe(debounceTime(500)).subscribe((dataString: string) => {
            // console.log('API eclString returned: ', dataString);
            this.eclService.setEclString(dataString);
        });
    }

    close(): void {
        document.querySelector('ecl-builder').remove();
    }

    accept(): void {
        this.output.emit(this.eclString);
        document.querySelector('ecl-builder').remove();
    }

    newFocusConceptRow(): void {
        if (this.eclObject.fullTerm) {
            this.convertExpressionToConjunction();
        }

        if (this.eclObject.conjunctionExpressionConstraints) {
            this.eclObject.conjunctionExpressionConstraints.push(new ECLExpression());
            this.eclService.setEclObject(this.eclObject);
            this.updateExpression();
        } else if (this.eclObject.disjunctionExpressionConstraints) {
            this.eclObject.disjunctionExpressionConstraints.push(new ECLExpression());
            this.eclService.setEclObject(this.eclObject);
            this.updateExpression();
        }
    }

    removeFocusConceptRow(index): void {
        if (this.eclObject.conjunctionExpressionConstraints) {
            this.eclObject.conjunctionExpressionConstraints.splice(index, 1);
            if (this.eclObject.conjunctionExpressionConstraints.length === 1) {
                this.eclService.setEclObject(this.eclObject.conjunctionExpressionConstraints[0]);
            } else {
                this.eclService.setEclObject(this.eclObject);
            }
        } else if (this.eclObject.disjunctionExpressionConstraints) {
            this.eclObject.disjunctionExpressionConstraints.splice(index, 1);
            if (this.eclObject.disjunctionExpressionConstraints.length === 1) {
                this.eclService.setEclObject(this.eclObject.disjunctionExpressionConstraints[0]);
            } else {
                this.eclService.setEclObject(this.eclObject);
            }
        }
        this.updateExpression();
    }

    newAttributeGroup(): void {
        if (this.eclObject.fullTerm) {
            const refinement = this.eclService.convertExpressionToRefinement(this.eclObject);
            this.eclService.setEclObject(refinement);
            this.updateExpression();
        }
    }

    newAttributeGroupRow(): void {
        if (!this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet &&
            !this.eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet) {
            const conjunction = this.eclService.convertRefinementToConjunction(this.eclObject);
            this.eclService.setEclObject(conjunction);
            this.updateExpression();
        } else if (!this.eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet &&
            this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet) {
            this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet.push(new SubAttributeSet(new Attribute(
                new ECLExpression(),
                '=',
                new ECLExpression(),
                false,
                1
            )));
            this.eclService.setEclObject(this.eclObject);
            this.updateExpression();
        } else if (!this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet &&
            this.eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet) {
            this.eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet.push(new SubAttributeSet(new Attribute(
                new ECLExpression(),
                '=',
                new ECLExpression(),
                false,
                1
            )));
            this.eclService.setEclObject(this.eclObject);
            this.updateExpression();
        }
    }

    removeAttributeGroupRow(type?, index?): void {
        if (!this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet &&
            !this.eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet) {
            const expression = this.eclService.convertRefinementToExpression(this.eclObject);
            this.eclService.setEclObject(expression);
            this.updateExpression();
        }
        if (type === 'conjunction') {
            this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet.splice(index, 1);
            if (this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet.length === 0) {
                delete this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet;
            }
            this.eclService.setEclObject(this.eclObject);
            this.updateExpression();
        }
        if (type === 'disjunction') {
            this.eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet.splice(index, 1);
            if (this.eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet.length === 0) {
                delete this.eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet;
            }
            this.eclService.setEclObject(this.eclObject);
            this.updateExpression();
        }
    }

    convertExpressionToConjunction(): void {
        if (this.eclObject.fullTerm) {
            const conjunction = this.eclService.convertExpressionToConjunction(this.eclObject);
            this.eclService.setEclObject(conjunction);
            this.updateExpression();
        }
    }

    convertConjunctionToDisjunction(): void {
        if (this.eclObject.conjunctionExpressionConstraints) {
            const disjunction = this.eclService.convertConjunctionToDisjunction(this.eclObject);
            this.eclService.setEclObject(disjunction);
            this.updateExpression();
        }
    }

    convertDisjunctionToConjunction(): void {
        if (this.eclObject.disjunctionExpressionConstraints) {
            const conjunction = this.eclService.convertDisjunctionToConjunction(this.eclObject);
            this.eclService.setEclObject(conjunction);
            this.updateExpression();
        }
    }

    convertConjunctionRefinementToDisjunctionRefinement(): void {
        if (this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet) {
            const conjunctionRefinement = this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet;
            delete this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet;
            this.eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet = conjunctionRefinement;

            this.eclService.setEclObject(this.eclObject);
            this.updateExpression();
        }
    }

    convertDisjunctionRefinementToConjunctionRefinement(): void {
        if (this.eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet) {
            const disjunctionRefinement = this.eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet;
            delete this.eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet;
            this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet = disjunctionRefinement;

            this.eclService.setEclObject(this.eclObject);
            this.updateExpression();
        }
    }

    clear(): void {
        this.eclService.setEclObject(new ECLExpression('self', '', false, '', ''));
        this.eclService.setEclString('');
    }

    getOpSymbol(operator): string {
        switch (operator) {
            case 'self': return '';
            case 'descendantof': return '<';
            case 'descendantorselfof': return '<<';
            case 'childof': return '<!';
            case 'ancestorof': return '>';
            case 'ancestororselfof': return '>>';
            case 'parentof': return '>!';
            case 'memberOf': return '^';
        }
    }

    cloneObject(object): any {
        return JSON.parse(JSON.stringify(object));
    }
}
