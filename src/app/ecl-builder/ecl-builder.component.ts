import {Component, ElementRef, Input, Output, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {ECLExpression, SubAttributeSet, Attribute} from '../models/ecl';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {Observable, Subscription} from 'rxjs';
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

    search = (text$: Observable<string>) => text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => {
            if (term.length < 3) {
                return [];
            } else {
                return this.httpService.getTypeahead(this.apiUrl, this.branch, term);
            }
        })
    )
    
    searchMrcmType(parentId): (text$: Observable<string>) => Observable<any[]> {
        return (text$: Observable<string>) => text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => {
                if (term.length < 3) {
                    return [];
                } else {
                    return this.httpService.getMrcmType(this.apiUrl, this.branch, term, parentId);
                }
            })
        );
    }
    
    searchMrcmTarget(eclObject, typeId?): (text$: Observable<string>) => Observable<any[]> {
        return (text$: Observable<string>) => text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => {
                if (term.length < 3) {
                    return [];
                } else {
                    if(!typeId){
                        return this.httpService.getMrcmTarget(this.apiUrl, this.branch, term, eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.conceptId);
                    }
                    else if(typeId === 'conjunction'){
                        return this.httpService.getMrcmTarget(this.apiUrl, this.branch, term, eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet.attribute.attributeName.conceptId);
                    }
                    else if(typeId === 'disjunction'){
                        return this.httpService.getMrcmTarget(this.apiUrl, this.branch, term, eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet.attribute.attributeName.conceptId);
                    } 
                }
            })
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

    getConceptId(eclObject): void {
        if (eclObject) {
            if (eclObject.fullTerm === '*') {
                eclObject.wildcard = true;
                delete eclObject.conceptId;
                delete eclObject.term;
                delete eclObject.operator;
            } else {
                eclObject.wildcard = false;
                eclObject.conceptId = eclObject.fullTerm.replace(/\D/g, '');
                eclObject.term = eclObject.fullTerm.slice(eclObject.fullTerm.indexOf('|') + 1, eclObject.fullTerm.lastIndexOf('|'));
            }
        }

        this.updateExpression();
    }

    updateExpression(): void {
        const eclObject = this.cloneObject(this.eclObject);

        this.httpService.getModelToString(this.apiUrl, eclObject).subscribe((dataString: string) => {
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
            this.eclService.setEclObject(this.eclObject);
            this.updateExpression();
        } else if (this.eclObject.disjunctionExpressionConstraints) {
            this.eclObject.disjunctionExpressionConstraints.splice(index, 1);
            this.eclService.setEclObject(this.eclObject);
            this.updateExpression();
        }
    }

    newAttributeGroup(): void {
        if (this.eclObject.fullTerm) {
            const refinement = this.eclService.convertExpressionToRefinement(this.eclObject);
            this.eclService.setEclObject(refinement);
            this.updateExpression();
        }
    }

    newAttributeGroupRow(): void {
        if (!this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet && ! this.eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet) {
            const conjunction = this.eclService.convertRefinementToConjunction(this.eclObject);
            this.eclService.setEclObject(conjunction);
            this.updateExpression();
        }

        else if (!this.eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet && this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet) {
            this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet.push(new SubAttributeSet(new Attribute(
                    new ECLExpression(),
                    '=',
                    new ECLExpression(),
                    false,
                    1
                )));
            this.eclService.setEclObject(this.eclObject);
            this.updateExpression();
        } else if (!this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet && this.eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet) {
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
        if(!this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet && ! this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet){
            const expression = this.eclService.convertRefinementToExpression(this.eclObject);
            this.eclService.setEclObject(expression);
            this.updateExpression();
        }
        if(type === 'conjunction'){
            this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet.splice(index, 1);
            if(this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet.length === 0){
                delete this.eclObject.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet;
            }
            this.eclService.setEclObject(this.eclObject);
            this.updateExpression();
        }
        if(type === 'disjunction'){
            this.eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet.splice(index, 1);
            if(this.eclObject.eclRefinement.subRefinement.eclAttributeSet.disjunctionAttributeSet.length === 0){
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

    ECLexpressionBuilder(expression: string): any {
        if (this.eclString) {
            const response = expression.match(/(?:[^:,](?!OR)(?!\(<<))+(?:[:,\s]| OR)*/g);

            let whitespaceCount = 0;

            for (let i = 0; i < response.length; i++) {
                if (i !== 0) {
                    if (response[i - 1].includes(':')) {
                        whitespaceCount++;
                    }

                    if (response[i].startsWith('<<') && !response[i - 1].includes(':')) {
                        whitespaceCount++;
                    }

                    if (!response[i - 1].includes('OR') && response[i].startsWith('OR')) {
                        whitespaceCount++;
                    }

                    if (response[i - 1].includes('OR') && response[i - 1].trim().endsWith(',')) {
                        whitespaceCount--;
                    }

                    if (response[i].startsWith('R')) {
                        whitespaceCount++;
                    }
                }

                response[i] = '    '.repeat(whitespaceCount) + response[i].trim();
            }

            return response;
        }
    }

    cloneObject(object): any {
        return JSON.parse(JSON.stringify(object));
    }
}
