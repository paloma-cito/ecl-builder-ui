import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

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
}
