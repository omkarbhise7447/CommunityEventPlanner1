export interface RawRSVP {
    id: number;
    eventId: number;
    userId: string; // Added
    eventTitle: string;
    description: string;
    eventDate: string;
    eventTime: string;
    rsvpDate: string;
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
    categoryName: string;
  }