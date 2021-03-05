import {Component, ElementRef, Input, Output, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {EclExpression, EclObject} from '../models/ecl';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {HttpService} from '../services/http.service';

@Component({
    selector: 'app-ecl-builder',
    templateUrl: './ecl-builder.component.html',
    styleUrls: ['./ecl-builder.component.scss']
})
export class EclBuilderComponent implements OnInit, OnDestroy {

    element: any;
    @Input() apiUrl: string;
    @Input() eclString: string;
    @Output() output = new EventEmitter();
    eclObject: any;

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

    constructor(private el: ElementRef, private httpService: HttpService) {
        this.element = el.nativeElement;
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
            this.httpService.getStringToModel(this.apiUrl, this.eclString).subscribe( (dataObject: EclObject) => {
                console.log('API eclModel returned: ', dataObject);
                this.eclObject = dataObject;
                // this.httpService.getModelToString(this.apiUrl, dataObject).subscribe((dataString: string) => {
                //     console.log('API eclString returned: ', dataString);
                //     this.eclString = dataString;
                // });
            });
        } else {
            this.eclObject = new EclObject('descendantof', '', false);
        }
    }

    ngOnDestroy(): void {
        this.element.remove();
    }

    getConceptId(eclObject): void {
        eclObject.conceptId = eclObject.fullTerm.replace(/\D/g, '');
        eclObject.term = eclObject.fullTerm.slice(eclObject.fullTerm.indexOf('|') + 1, eclObject.fullTerm.lastIndexOf('|'));
        this.updateExpression();
    }

    createShortFormConcept(id, fsn): string {
        return id + ' |' + fsn + '|';
    }

    updateExpression(): void {
        this.httpService.getModelToString(this.apiUrl, this.eclObject).subscribe((dataString: string) => {
            this.eclString = dataString;
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
