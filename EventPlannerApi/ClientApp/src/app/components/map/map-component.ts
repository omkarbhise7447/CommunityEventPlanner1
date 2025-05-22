import { Component, Input, OnInit, Inject, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Declare the global L variable from the Leaflet CDN
declare const L: any;

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map-component.html',
  styleUrl: './map-component.scss'
})
export class MapComponent implements OnInit {
  @Input() latitude: number = 0;
  @Input() longitude: number = 0;
  @Input() title: string = '';
  @Output() mapReady = new EventEmitter<any>();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) {
      return;
    }

    if (typeof L === 'undefined') {
      console.error('Leaflet is not loaded. Ensure the Leaflet script is included in index.html.');
      return;
    }

    const map = L.map('map').setView([this.latitude, this.longitude], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.marker([this.latitude, this.longitude]).addTo(map).bindPopup(this.title).openPopup();

    // Emit the map instance to the parent component
    this.mapReady.emit(map);
  }
}