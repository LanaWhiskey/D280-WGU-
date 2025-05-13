
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private apiUrl = 'https://api.worldbank.org/v2/country';

  constructor(private http: HttpClient) {}

  // ✅ Get core country metadata (name, capital, region, etc.)
  getCountryByCode(code: string): Observable<any> {
    const url = `${this.apiUrl}/${code}?format=json`;
    return this.http.get<any[]>(url);
  }

  // ✅ Get a country-level indicator (e.g. population, life expectancy)
  getIndicatorData(countryCode: string, indicatorCode: string): Observable<number | null> {
    const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicatorCode}?format=json&per_page=1&date=2022`;
    return this.http.get<any>(url).pipe(
      map((response: any) => {
        const data = response?.[1]?.[0];
        return data?.value ?? null;
      })
    );
  }
}