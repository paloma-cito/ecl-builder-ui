import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { EclBuilderComponent } from './ecl-builder/ecl-builder.component';

@NgModule({
    declarations: [
        EclBuilderComponent
    ],
    imports: [
        BrowserModule
    ],
    providers: [],
    entryComponents: [EclBuilderComponent]
})
export class AppModule {
    constructor(private injector: Injector) {
        const el = createCustomElement(EclBuilderComponent, { injector });
        customElements.define('ecl-builder', el);
    }

    ngDoBootstrap(): void {

    }
}
