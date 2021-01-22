import { Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AttributeSet, Ecl } from '../models/ecl';

@Component({
    selector: 'app-ecl-builder',
    templateUrl: './ecl-builder.component.html',
    styleUrls: ['./ecl-builder.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom
})
export class EclBuilderComponent implements OnInit, OnDestroy {

    private element: any;
    ecl: Ecl;

    constructor(private el: ElementRef) {
        this.element = el.nativeElement;
    }

    ngOnInit(): void {

        document.body.appendChild(this.element);
        // this.element.style.display = 'none';
        this.ecl = new Ecl();

        this.element.addEventListener('click', el => {
            if (el.target.className === 'app-modal') {
                this.close();
            }
        });
    }

    ngOnDestroy(): void {
        this.element.remove();
    }

    open(): void {
        this.element.style.display = 'block';
        document.body.classList.add('app-modal-open');
    }

    close(): void {
        this.element.style.display = 'none';
        document.body.classList.remove('app-modal-open');
    }

    newFocusConceptRow(): void {

    }

    newAttributeGroup(): void {

    }

    newAttributeGroupRow(): void {
        this.ecl.eclRefinement.subRefinement.eclAttributeSet.conjunctionAttributeSet.push(new AttributeSet());
    }

    newExclusionGroup(): void {

    }

    newExclusionGroupRow(): void {
        this.ecl.eclRefinement.conjunctionSubRefinements.push(new AttributeSet());
    }

    accept(): void {
        console.log('accepted');
    }
}
