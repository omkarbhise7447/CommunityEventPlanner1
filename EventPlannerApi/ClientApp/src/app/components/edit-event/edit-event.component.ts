import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { CategoryService } from '../../services/category.service';
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
import { forkJoin } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LoaderComponent } from '../loader/loader.component';
import { MapComponent } from '../map/map-component';

declare const L: any;

@Component({
  selector: 'app-edit-event',
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
    MapComponent
  ],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition(':enter', [animate('0.5s ease-out')]),
    ]),
  ],
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.scss'],
})
export class EditEventComponent implements OnInit {
  eventForm: FormGroup;
  today: Date = new Date();
  categories: { id: number; name: string }[] = [];
  isSubmitting: boolean = false;
  showMap: boolean = false;
  isBrowser: boolean = false;
  periods: string[] = ['AM', 'PM'];
  loading: boolean = true;
  tempCoordinates: { latitude: number; longitude: number } | null = null;

  @ViewChild('mapContainer', { read: ViewContainerRef }) mapContainer!: ViewContainerRef;
  private mapInstance: any = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
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
      date: ['', Validators.required],
      time: ['', [Validators.required, Validators.pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9]$/)]],
      period: ['', Validators.required],
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
    const id = +this.route.snapshot.paramMap.get('id')!;

    this.loading = true;
    forkJoin([
      this.categoryService.getCategories(),
      this.eventService.getEventById(id),
    ]).subscribe({
      next: ([categories, event]) => {
        this.categories = categories;

        // Parse date from YYYY-MM-DD format
        let parsedDate: Date;
        try {
          const [year, month, day] = event.date.split('-').map(Number);
          parsedDate = new Date(year, month - 1, day);
          if (isNaN(parsedDate.getTime())) {
            throw new Error('Invalid date');
          }
        } catch (error) {
          console.error('Error parsing date:', event.date, error);
          parsedDate = new Date();
          this.snackBar.open('Warning: Invalid event date. Please select a new date.', 'Close', { duration: 5000 });
        }

        // Parse time (e.g., "12:00:00")
        let time = '';
        let period = 'AM';
        if (event.time) {
          try {
            const [hours, minutes] = event.time.split(':').map(Number);
            const periodHours = hours % 12 || 12;
            time = `${periodHours}:${minutes.toString().padStart(2, '0')}`;
            period = hours >= 12 ? 'PM' : 'AM';
          } catch (error) {
            console.error('Error parsing time:', event.time, error);
            time = '12:00';
            period = 'AM';
            this.snackBar.open('Warning: Invalid event time. Defaulting to 12:00 AM.', 'Close', { duration: 5000 });
          }
        }

        // Map categoryName to categoryId
        const normalizedEventCategoryName = event.categoryName?.trim().toLowerCase();
        const selectedCategory = this.categories.find(cat => cat.name.trim().toLowerCase() === normalizedEventCategoryName);
        const categoryId = selectedCategory ? selectedCategory.id : '';

        this.eventForm.patchValue({
          title: event.title,
          description: event.description || '',
          date: parsedDate,
          time: time,
          period: period,
          categoryId: categoryId,
          locationName: event.location.name,
          addressLine1: event.location.address.addressLine1,
          addressLine2: event.location.address.addressLine2 || '',
          city: event.location.address.city,
          district: event.location.address.district || '',
          state: event.location.address.state,
          zipCode: event.location.address.zipCode || '',
          country: event.location.address.country,
          latitude: event.location.latitude,
          longitude: event.location.longitude,
        });

        if (!selectedCategory && event.categoryName) {
          this.snackBar.open(
            `Warning: The event’s category "${event.categoryName}" is not available in the list. Please select a category.`,
            'Close',
            { duration: 5000 }
          );
        }

        if (this.isBrowser) {
          this.initializeMap(event.location.latitude, event.location.longitude);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.snackBar.open('Failed to load event or categories', 'Close', { duration: 3000 });
        this.router.navigate(['/events']);
        this.loading = false;
      },
    });
  }

  async toggleMap() {
    this.showMap = !this.showMap;
    if (this.showMap && this.isBrowser) {
      await this.initializeMap(
        this.eventForm.get('latitude')?.value || 40.7128,
        this.eventForm.get('longitude')?.value || -74.0060
      );
    } else {
      this.mapContainer.clear();
      this.mapInstance = null;
      this.tempCoordinates = null; // Clear temporary coordinates when hiding the map
    }
  }

  async initializeMap(latitude: number, longitude: number) {
    const { MapComponent } = await import('../map/map-component');
    this.mapContainer.clear();
    const componentRef = this.mapContainer.createComponent(MapComponent);

    componentRef.instance.latitude = latitude;
    componentRef.instance.longitude = longitude;
    componentRef.instance.title = this.eventForm.get('locationName')?.value || 'Event Location';

    componentRef.instance.mapReady.subscribe((map: any) => {
      this.mapInstance = map;
      this.mapInstance.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        // Store coordinates temporarily instead of updating the form
        this.tempCoordinates = {
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
        };

        // Update or add marker on the map
        if (this.mapInstance.marker) {
          this.mapInstance.removeLayer(this.mapInstance.marker);
        }
        this.mapInstance.marker = L.marker([lat, lng])
          .addTo(this.mapInstance)
          .bindPopup('Selected Location')
          .openPopup();
      });

      // Initialize marker with current form coordinates
      this.mapInstance.marker = L.marker([latitude, longitude])
        .addTo(this.mapInstance)
        .bindPopup('Current Location')
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
      const eventId = +this.route.snapshot.paramMap.get('id')!;

      const eventDate = new Date(formValue.date);
      const formattedDate = `${eventDate.getDate().toString().padStart(2, '0')}/${(eventDate.getMonth() + 1).toString().padStart(2, '0')}/${eventDate.getFullYear()}`;

      const formattedTime = `${this.formatTimeToLeadingZeros(formValue.time)} ${formValue.period}`;

      // Use temporary coordinates if available, otherwise use form values
      const finalLatitude = this.tempCoordinates ? this.tempCoordinates.latitude : formValue.latitude;
      const finalLongitude = this.tempCoordinates ? this.tempCoordinates.longitude : formValue.longitude;

      const eventData = {
        id: eventId,
        title: formValue.title,
        description: formValue.description || '',
        eventDate: formattedDate,
        eventTime: formattedTime,
        categoryId: Number(formValue.categoryId),
        location: {
          name: formValue.locationName,
          latitude: Number(finalLatitude),
          longitude: Number(finalLongitude),
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

      this.eventService.updateEvent(eventId, eventData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.loading = false;
          this.snackBar.open('Event updated successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/events']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.loading = false;
          console.error('Error updating event:', err);
          let errorMessage = 'Failed to update event';
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