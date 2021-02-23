import {Component, ElementRef, Input, Output, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {EclObject} from '../models/ecl';
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
    @Output() output = new EventEmitter();
    eclObject: EclObject;

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

        this.eclObject = new EclObject();
    }

    ngOnDestroy(): void {
        this.element.remove();
    }

    close(): void {
        document.querySelector('ecl-builder').remove();
    }

    accept(): void {
        this.output.emit(this.eclObject);
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


}
