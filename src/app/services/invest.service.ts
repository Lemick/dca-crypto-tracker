import {Injectable} from '@angular/core';
import {InvestElement} from '../model/InvestElement';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvestService {

  private readonly LOCAL_STORAGE_KEY = 'investElements';
  private readonly elements: InvestElement[] = [];

  private readonly investPopupOpenRequests$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private readonly investElementsSubject$: BehaviorSubject<InvestElement[]> = new BehaviorSubject<InvestElement[]>(this.elements);

  constructor() {
    if (localStorage.getItem(this.LOCAL_STORAGE_KEY)) {
      this.elements = JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_KEY));
      this.elements.forEach(e => e.dateInvest = new Date(e.dateInvest));
      this.emitsInvestElements();
    }
  }

  addInvestElement(investElement: InvestElement): void {
    console.log('Adding invest element', investElement);
    this.elements.push(investElement);
    this.elements.sort((a, b) => a.dateInvest.getTime() > b.dateInvest.getTime() ? 1 : -1);
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.elements));
    this.emitsInvestElements();
  }

  getInvestElements(): Observable<InvestElement[]> {
    return this.investElementsSubject$.asObservable();
  }

  getInvestPopupChanges(): Observable<boolean> {
    return this.investPopupOpenRequests$.asObservable();
  }

  toggleInvestPopup(value: boolean): void {
    this.investPopupOpenRequests$.next(value);
  }

  emitsInvestElements(): void {
    this.investElementsSubject$.next([...this.elements]);
  }
}
