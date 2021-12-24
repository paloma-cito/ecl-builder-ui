import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {Observable} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, filter, switchMap, tap} from 'rxjs/operators';
import {HttpService} from '../../services/http.service';

@Component({
    selector: 'app-type-typeahead',
    templateUrl: './type-typeahead.component.html',
    styleUrls: ['./type-typeahead.component.scss']
})
export class TypeTypeaheadComponent implements OnInit {

    @Input() model: any;
    @Input() apiUrl: string;
    @Input() branch: string;
    @Input() typeId: string;

    @Output() updateExpression = new EventEmitter();

    spinner = document.createElement('div');

    searchMrcmType = (text$: Observable<string>) => text$.pipe(
        debounceTime(300),
        filter((text) => text.length > 2),
        distinctUntilChanged(),
        tap(() => document.activeElement.parentElement.appendChild(this.spinner)),
        switchMap(term => this.httpService.getMrcmType(this.apiUrl, this.branch, term, this.typeId)
            .pipe(tap(() => document.getElementById('spinner').remove()))
        ),
        catchError(tap(() => document.getElementById('spinner').remove()))
    )

    constructor(private httpService: HttpService) {
        this.spinner.id = 'spinner';
        this.spinner.classList.add('ecl-spinner', 'spinner-border-sm', 'position-absolute');
        this.spinner.style.top = '7px';
        this.spinner.style.right = '7px';
    }

    ngOnInit(): void {
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
    }
}
