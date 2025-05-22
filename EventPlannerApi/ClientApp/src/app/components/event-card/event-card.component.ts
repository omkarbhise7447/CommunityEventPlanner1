import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Event } from '../../models/event.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.scss'
})
export class EventCardComponent {
  @Input() event!: Event;
  @Input() isCreator: boolean = false;
  @Input() showEditDelete: boolean = true; // Control whether to show edit/delete buttons
  @Output() viewEvent = new EventEmitter<number>();
  @Output() deleteEvent = new EventEmitter<number>();

  formatTime(time: string): string {
    try {
      if (time === '00:00:00') {
        return 'TBD';
      }
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const adjustedHours = hours % 12 || 12;
      return `${adjustedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'TBD';
    }
  }
}