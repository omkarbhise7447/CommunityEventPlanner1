export interface Event {
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
    categoryName: string;
    user: {
      userId: string;
      userName: string;
      email: string;
    };
    showFullDescription?: boolean; 
  }