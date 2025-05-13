import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CountryService } from '../services/country.service';

interface CountryInfo {
  name: string;
  capitalCity: string;
  region: { value: string };
  incomeLevel: { value: string };
  lendingType: { value: string };
  population: number | null;
  longitude: string;
  latitude: string;
}

@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './world-map.component.html',
  styleUrls: ['./world-map.component.css']
})
export class WorldMapComponent implements AfterViewInit {
  hoveredCountryName: string | null = null;
tooltipX: number = 0;
tooltipY: number = 0;

onSvgMouseMove(event: MouseEvent): void {
  const target = event.target as SVGElement;
  if (target.tagName.toLowerCase() === 'path' && target.hasAttribute('name')) {
    this.hoveredCountryName = target.getAttribute('name');
    this.tooltipX = event.clientX + 10;
    this.tooltipY = event.clientY + 10;
  } else {
    this.hoveredCountryName = null;
  }
}

  selectedCountry: CountryInfo | null = null;
  lifeExpectancy: number | null = null;
  flagUrl: string | null = null;

  constructor(private countryService: CountryService, private http: HttpClient) {}

  onCountryClick(event: MouseEvent): void {
    const target = event.target as SVGElement;
    if (target.tagName.toLowerCase() !== 'path' || !target.id) return;

    document.querySelectorAll('path.selected').forEach(p => p.classList.remove('selected'));
    target.classList.add('selected');
    const countryCode = target.id;

    this.countryService.getCountryByCode(countryCode).subscribe({
      next: (data: any) => {
        const country = data[1]?.[0];
        const countryName = country.name;
        const countryCode3 = country.iso2Code;

        this.selectedCountry = {
          name: country.name,
          capitalCity: country.capitalCity,
          region: country.region,
          incomeLevel: country.incomeLevel,
          lendingType: country.lendingType,
          population: null,
          longitude: country.longitude,
          latitude: country.latitude
        };

        this.http.get(`https://restcountries.com/v3.1/alpha/${countryCode3.toLowerCase()}`).subscribe({
          next: (data: any) => {
            this.flagUrl = data[0]?.flags?.png ?? null;
            this.placeSelectedLabel(countryName, target);
          },
          error: () => {
            this.flagUrl = null;
            this.placeSelectedLabel(countryName, target);
          }
        });

        this.countryService.getIndicatorData(countryCode, 'SP.POP.TOTL').subscribe(
          (pop) => this.selectedCountry!.population = pop
        );

        this.countryService.getIndicatorData(countryCode, 'SP.DYN.LE00.IN').subscribe(
          (life) => this.lifeExpectancy = life
        );
      },
      error: (err) => {
        console.error('Error fetching country data:', err);
        this.selectedCountry = null;
      }
    });
  }

  placeSelectedLabel(name: string, path: SVGElement): void {
    const oldGroup = document.getElementById('country-label-group');
    if (oldGroup) oldGroup.remove();

    const bbox = (path as any).getBBox();
    if (bbox.width < 5 || bbox.height < 5) return;

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', 'country-label-group');
    group.setAttribute('style', 'opacity: 0; transition: opacity 0.4s ease;');

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '-30');
    rect.setAttribute('y', '-20');
    rect.setAttribute('width', '60');
    rect.setAttribute('height', '24');
    rect.setAttribute('rx', '4');
    rect.setAttribute('fill', '#d9f6ff');
    rect.setAttribute('stroke', '#0099cc');
    rect.setAttribute('stroke-width', '0.5');
    group.appendChild(rect);

    if (this.flagUrl) {
      const flag = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      flag.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.flagUrl);
      flag.setAttribute('x', '-12');
      flag.setAttribute('y', '-28');
      flag.setAttribute('width', '24');
      flag.setAttribute('height', '16');
      flag.setAttribute('rx', '2');
      group.appendChild(flag);
    }

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('y', '-4');
    text.setAttribute('font-size', '10');
    text.setAttribute('fill', 'black');
    text.setAttribute('pointer-events', 'none');
    text.textContent = name;
    group.appendChild(text);

    const svg = document.querySelector('svg');
    const centerX = bbox.x + bbox.width / 2;
    let centerY = bbox.y - 6;
    if (centerY < 10) {
      centerY = bbox.y + bbox.height + 12;
    }

    group.setAttribute('transform', `translate(${centerX}, ${centerY})`);
    svg?.appendChild(group);

    requestAnimationFrame(() => {
      group.style.opacity = '1';
    });
  }

  ngAfterViewInit(): void {
    const svg = document.querySelector('svg');
    const paths = svg?.querySelectorAll('path');
  }
}
