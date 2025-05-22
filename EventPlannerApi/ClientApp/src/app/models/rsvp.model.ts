export interface RSVP {
    id: number;
    userId: string; // Included for logged-in user's RSVPs
    eventId: number;
    rsvpDate: string;
    event: {
      id: number;
      title: string;
      description: string;
      date: string;
      time: string;
      location: {
        name: string;
        address: {
          addressLine1: string;
          addressLine2: string;
          city: string;
          district: string;
          state: string;
          zipCode: string;
          country: string;
        };
        latitude: number;
        longitude: number;
      };
      category: {
        name: string;
      };
    };
  }