import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { EclBuilderComponent } from './ecl-builder/ecl-builder.component';
import { FormsModule } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from './services/http.service';
import { HttpClientModule } from '@angular/common/http';
import { EclService } from './services/ecl.service';
import { TypeaheadComponent } from './components/typeahead/typeahead.component';
import { TypeTypeaheadComponent } from './components/type-typeahead/type-typeahead.component';
import { TargetTypeaheadComponent } from './components/target-typeahead/target-typeahead.component';

@NgModule({
  declarations: [
    EclBuilderComponent,
    TypeaheadComponent,
    TypeTypeaheadComponent,
    TargetTypeaheadComponent,
  ],
  imports: [BrowserModule, FormsModule, NgbTypeaheadModule, HttpClientModule],
  providers: [HttpService, EclService],
  //entryComponents: [EclBuilderComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    const el = createCustomElement(EclBuilderComponent, { injector });
    customElements.define('ecl-builder', el);
  }

  ngDoBootstrap(): void {}
}
