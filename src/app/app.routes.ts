import { Routes } from '@angular/router';
import { WorldMapComponent } from './world-map/world-map.component';

export const routes: Routes = [
  { path: '', redirectTo: '/map', pathMatch: 'full' },
  { path: 'map', component: WorldMapComponent },
];



