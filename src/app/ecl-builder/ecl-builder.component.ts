import {Component, ElementRef, Input, Output, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {
    Attribute,
    EClAttributeSet,
    ECLConjunctionExpression,
    ECLDisjunctionExpression,
    ECLExpression,
    ECLExpressionWithRefinement, EClRefinement, SubAttributeSet, SubRefinement
} from '../models/ecl';
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
                return this.httpService.getTypeahead(this.apiUrl, term);
            }
        })
    )

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

        console.log('eclString IN: ', this.eclString);

        if (this.eclString) {
            this.eclService.setEclString(this.eclString);

            this.httpService.getStringToModel(this.apiUrl, this.eclString).subscribe( (dataObject: any) => {
                console.log('API eclModel returned: ', dataObject);
                this.eclService.setEclObject(dataObject);
                this.calculateUpdate();
            });
        } else {
            this.eclService.setEclObject(new ECLExpression('descendantof', '', false, '', ''));
        }
    }

    ngOnDestroy(): void {
        this.element.remove();
    }

    getConceptId(eclObject): void {
        eclObject.conceptId = eclObject.fullTerm.replace(/\D/g, '');
        eclObject.term = eclObject.fullTerm.slice(eclObject.fullTerm.indexOf('|') + 1, eclObject.fullTerm.lastIndexOf('|'));

        this.calculateUpdate();
    }

    createShortFormConcept(id, fsn): string {
        return id + ' |' + fsn + '|';
    }

    calculateUpdate(): void {
        if (this.eclObject instanceof ECLExpression) {
            this.updateExpression();
        } else if (this.eclObject instanceof ECLConjunctionExpression) {
            this.updateConjunctionExpression();
        } else if (this.eclObject instanceof ECLDisjunctionExpression) {
            this.updateDisjunctionExpression();
        } else if (this.eclObject instanceof ECLExpressionWithRefinement) {
            this.updateExpressionWithRefinement();
        }
    }

    updateExpression(): void {
        const eclObject = new ECLExpression(
            this.eclObject.operator,
            this.eclObject.conceptId,
            this.eclObject.wildcard,
            this.eclObject.term,
            this.eclObject.fullTerm
        );

        this.httpService.getModelToString(this.apiUrl, eclObject).subscribe((dataString: string) => {
            console.log('API eclString returned: ', dataString);
            this.eclService.setEclString(dataString);
        });
    }

    updateConjunctionExpression(): void {
        const eclObject = new ECLConjunctionExpression([]);

        this.eclObject.conjunctionExpressionConstraints.forEach(item => {
            eclObject.conjunctionExpressionConstraints.push(new ECLExpression(
                item.operator,
                item.conceptId,
                item.wildcard,
                item.term,
                item.fullTerm
            ));
        });

        this.httpService.getModelToString(this.apiUrl, eclObject).subscribe((dataString: string) => {
            console.log('API eclString returned: ', dataString);
            this.eclService.setEclString(dataString);
        });
    }

    updateDisjunctionExpression(): void {
        const eclObject = new ECLDisjunctionExpression([]);

        this.eclObject.disjunctionExpressionConstraints.forEach(item => {
            eclObject.disjunctionExpressionConstraints.push(new ECLExpression(
                item.operator,
                item.conceptId,
                item.wildcard,
                item.term,
                item.fullTerm
            ));
        });

        this.httpService.getModelToString(this.apiUrl, eclObject).subscribe((dataString: string) => {
            console.log('API eclString returned: ', dataString);
            this.eclService.setEclString(dataString);
        });
    }

    updateExpressionWithRefinement(): void {
        const eclObject = new ECLExpressionWithRefinement(
            new ECLExpression(
                this.eclObject.subexpressionConstraint.operator,
                this.eclObject.subexpressionConstraint.conceptId,
                this.eclObject.subexpressionConstraint.wildcard,
                this.eclObject.subexpressionConstraint.term,
                this.eclObject.subexpressionConstraint.conceptId + ' |' + this.eclObject.subexpressionConstraint.term + '|'),
            new EClRefinement(new SubRefinement(new EClAttributeSet(new SubAttributeSet(new Attribute(
                new ECLExpression(
                    this.eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.operator,
                    this.eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.conceptId,
                    this.eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.wildcard,
                    this.eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.term,
                    this.eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.conceptId + ' |'
                    + this.eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.attributeName.term + '|'),
                this.eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.expressionComparisonOperator,
                new ECLExpression(
                    this.eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.value.operator,
                    this.eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.value.conceptId,
                    this.eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.value.wildcard,
                    this.eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.value.term,
                    this.eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.value.conceptId + ' |'
                    + this.eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.value.term + '|'),
                this.eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.reverse,
                this.eclObject.eclRefinement.subRefinement.eclAttributeSet.subAttributeSet.attribute.cardinalityMin
            )))))
        );

        this.httpService.getModelToString(this.apiUrl, eclObject).subscribe((dataString: string) => {
            console.log('API eclString returned: ', dataString);
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

    // newFocusConceptRow(): void {
    //     this.eclObject.focusConceptRows.push(new AttributeSet());
    // }
    //
    // newAttributeGroup(): void {
    //     this.eclObject.attributeGroups.push([new AttributeSet()]);
    // }
    //
    // newAttributeGroupRow(group): void {
    //     group.push(new AttributeSet());
    // }
    //
    // newExclusionGroup(): void {
    //     this.eclObject.exclusionGroups.push([new AttributeSet()]);
    // }
    //
    // newExclusionGroupRow(group): void {
    //     group.push(new AttributeSet());
    // }


    ECLexpressionBuilder(expression: string): any {
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

            response[i] =  '    '.repeat(whitespaceCount) + response[i].trim();
        }

        return response;
    }
}
