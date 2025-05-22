import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { CategoryService } from '../../services/category.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { isPlatformBrowser } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LoaderComponent } from '../loader/loader.component';

declare const L: any;

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    LoaderComponent,
  ],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition(':enter', [animate('0.5s ease-out')]),
    ]),
  ],
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss'],
})
export class CreateEventComponent implements OnInit {
  eventForm: FormGroup;
  today: Date = new Date();
  categories: { id: number; name: string }[] = [];
  isSubmitting: boolean = false;
  showMap: boolean = false;
  isBrowser: boolean = false;
  periods: string[] = ['AM', 'PM'];
  loading: boolean = true;

  @ViewChild('mapContainer', { read: ViewContainerRef }) mapContainer!: ViewContainerRef;
  private mapInstance: any = null;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private categoryService: CategoryService,
    private router: Router,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      date: [this.today, Validators.required],
      time: ['', [Validators.required, Validators.pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9]$/)]],
      period: ['AM', Validators.required],
      categoryId: ['', Validators.required],
      locationName: ['', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      district: [''],
      state: ['', Validators.required],
      zipCode: [''],
      country: ['', Validators.required],
      latitude: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.initializeDefaultLocation();
  }

  loadCategories() {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.snackBar.open('Failed to load categories', 'Close', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  initializeDefaultLocation() {
    this.loading = true;
    if (this.isBrowser && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.eventForm.patchValue({
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
          });
          this.loading = false;
        },
        (error) => {
          console.error('Error getting user location:', error);
          this.eventForm.patchValue({
            latitude: 40.7128,
            longitude: -74.0060,
          });
          this.snackBar.open('Unable to get your location. Defaulting to New York.', 'Close', { duration: 3000 });
          this.loading = false;
        }
      );
    } else {
      this.eventForm.patchValue({
        latitude: 40.7128,
        longitude: -74.0060,
      });
      this.loading = false;
    }
  }

  async toggleMap() {
    this.showMap = !this.showMap;
    if (this.showMap && this.isBrowser) {
      this.loading = true;
      await this.initializeMap(
        this.eventForm.get('latitude')?.value || 40.7128,
        this.eventForm.get('longitude')?.value || -74.0060
      );
      this.loading = false;
    } else {
      this.mapContainer.clear();
      this.mapInstance = null;
    }
  }

  async initializeMap(latitude: number, longitude: number) {
    const { MapComponent } = await import('../map/map-component');
    this.mapContainer.clear();
    const componentRef = this.mapContainer.createComponent(MapComponent);

    componentRef.instance.latitude = latitude;
    componentRef.instance.longitude = longitude;
    componentRef.instance.title = this.eventForm.get('locationName')?.value || 'Select Location';

    componentRef.instance.mapReady.subscribe((map: any) => {
      this.mapInstance = map;
      this.mapInstance.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        this.eventForm.patchValue({
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        });

        if (this.mapInstance.marker) {
          this.mapInstance.removeLayer(this.mapInstance.marker);
        }
        this.mapInstance.marker = L.marker([lat, lng])
          .addTo(this.mapInstance)
          .bindPopup('Selected Location')
          .openPopup();
      });

      this.mapInstance.marker = L.marker([latitude, longitude])
        .addTo(this.mapInstance)
        .bindPopup('Selected Location')
        .openPopup();
    });
  }

  private formatTimeToLeadingZeros(time: string): string {
    try {
      let [hours, minutes] = time.split(':').map(Number);
      hours = hours % 12 || 12;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formatting time:', time, error);
      return time;
    }
  }

  onSubmit() {
    if (this.eventForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.loading = true;
      const formValue = this.eventForm.value;

      const eventDate = new Date(formValue.date);
      const formattedDate = `${eventDate.getDate().toString().padStart(2, '0')}/${(eventDate.getMonth() + 1).toString().padStart(2, '0')}/${eventDate.getFullYear()}`;

      const formattedTime = `${this.formatTimeToLeadingZeros(formValue.time)} ${formValue.period}`;

      const eventData = {
        title: formValue.title,
        description: formValue.description || '',
        eventDate: formattedDate,
        eventTime: formattedTime,
        categoryId: Number(formValue.categoryId),
        location: {
          name: formValue.locationName,
          latitude: Number(formValue.latitude),
          longitude: Number(formValue.longitude),
          address: {
            addressLine1: formValue.addressLine1,
            addressLine2: formValue.addressLine2 || '',
            city: formValue.city,
            district: formValue.district || '',
            state: formValue.state,
            zipCode: formValue.zipCode || '',
            country: formValue.country,
          },
        },
      };

      this.eventService.createEvent(eventData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.loading = false;
          this.snackBar.open('Event created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/events']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.loading = false;
          console.error('Error creating event:', err);
          let errorMessage = 'Failed to create event';
          if (err.status === 400) {
            errorMessage = 'Invalid event data. Please check the form and try again.';
            if (err.error && err.error.Message) {
              errorMessage = err.error.Message;
            }
          } else if (err.status === 401) {
            this.snackBar.open('Session expired. Please log in again.', 'Close', { duration: 3000 });
            this.router.navigate(['/login']);
            return;
          }
          this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
        },
      });
    }
  }

  cancel() {
    this.router.navigate(['/events']);
  }
}