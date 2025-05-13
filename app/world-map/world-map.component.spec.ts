import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WorldMapComponent } from './world-map.component';
import { CountryService } from '../services/country.service';

describe('WorldMapComponent', () => {
  let component: WorldMapComponent;
  let fixture: ComponentFixture<WorldMapComponent>;
  let mockCountryService: jasmine.SpyObj<CountryService>;

  beforeEach(async () => {
    mockCountryService = jasmine.createSpyObj('CountryService', [
      'getCountryByCode',
      'getCountryIndicator'
    ]);

    await TestBed.configureTestingModule({
      imports: [WorldMapComponent],
      providers: [
        { provide: CountryService, useValue: mockCountryService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WorldMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch country info and population', () => {
    const mockEvent = {
      target: { tagName: 'path', id: 'TD' }
    } as unknown as MouseEvent;

    const mockCountryData = [{
      name: 'Chad',
      capitalCity: "N'Djamena",
      region: { value: 'Sub-Saharan Africa' },
      incomeLevel: { value: 'Low income' },
      lendingType: { value: 'IDA' },
      longitude: '15.0557',
      latitude: '12.1348'
    }];

    mockCountryService.getCountryByCode.and.returnValue(of([{}, mockCountryData]));
    mockCountryService.getIndicatorData.and.returnValue(of(17000000));

    component.onCountryClick(mockEvent);

    expect(mockCountryService.getCountryByCode).toHaveBeenCalledWith('TD');
    expect(mockCountryService.getIndicatorData).toHaveBeenCalledWith('TD', 'SP.POP.TOTL');

    expect(component.selectedCountry?.name).toBe('Chad');
    expect(component.selectedCountry?.population).toBe(17000000);
  });
});

