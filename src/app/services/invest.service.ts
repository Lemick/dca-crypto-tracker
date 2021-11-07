import {Injectable} from '@angular/core';
import {InvestElement} from '../model/InvestElement';
import {BehaviorSubject, Observable} from 'rxjs';
import {MarketCurrency} from '../model/enum/MarketCurrency';

@Injectable({
  providedIn: 'root'
})
export class InvestService {

  private readonly LOCAL_STORAGE_KEY = 'investElements';
  private elements: InvestElement[] = [];

  private readonly addInvestPopupOpenRequests$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private readonly importInvestPopupOpenRequests$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private readonly investElementsSubject$: BehaviorSubject<InvestElement[]> = new BehaviorSubject<InvestElement[]>(this.elements);

  constructor() {
    if (localStorage.getItem(this.LOCAL_STORAGE_KEY)) {
      this.loadStoredElements(localStorage.getItem(this.LOCAL_STORAGE_KEY));
    } else {
      this.initializeSampleData();
    }
  }

  addInvestElements(...items: InvestElement[]): void {
    this.elements.push(...items);
    this.saveElementsInLocalStorage();
    this.emitsInvestElements();
  }

  removeInvestElement(elementToRemove: InvestElement): void {
    this.elements = this.elements.filter(e => e !== elementToRemove);
    this.saveElementsInLocalStorage();
    this.emitsInvestElements();
  }

  getInvestElements(): Observable<InvestElement[]> {
    return this.investElementsSubject$.asObservable();
  }

  getInvestPopupChanges(): Observable<boolean> {
    return this.addInvestPopupOpenRequests$.asObservable();
  }

  getImportInvestPopupChanges(): Observable<boolean> {
    return this.importInvestPopupOpenRequests$.asObservable();
  }

  toggleAddInvestPopup(value: boolean): void {
    this.addInvestPopupOpenRequests$.next(value);
  }

  toggleImportInvestPopup(value: boolean): void {
    this.importInvestPopupOpenRequests$.next(value);
  }

  emitsInvestElements(): void {
    this.investElementsSubject$.next([...this.elements]);
  }

  private saveElementsInLocalStorage(): void {
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.elements));
  }

  private loadStoredElements(storedData: string): void {
    this.elements = JSON.parse(storedData);
    this.elements.forEach(e => e.investDate = new Date(e.investDate));
    this.emitsInvestElements();
  }

  private initializeSampleData(): void {
    const DAY_MS = 24 * 3600 * 1000;
    this.elements = [
      {
        coinId: 'ethereum',
        investDate: new Date(Date.now() - 20 * DAY_MS),
        conversionRate: 2000,
        valueAcquired: 0.2,
        sourceCurrency: MarketCurrency.usd
      },
      {
        coinId: 'bitcoin',
        investDate: new Date(Date.now() - 15 * DAY_MS),
        conversionRate: 25000,
        valueAcquired: 0.01,
        sourceCurrency: MarketCurrency.usd
      },
      {
        coinId: 'ethereum',
        investDate: new Date(Date.now() - 10 * DAY_MS),
        conversionRate: 2800,
        valueAcquired: 0.12,
        sourceCurrency: MarketCurrency.usd
      },
    ];
    this.saveElementsInLocalStorage();
    this.emitsInvestElements();
  }
}
