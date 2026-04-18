export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  isAdmin?: boolean;
  createdAt: Date;
}

export interface Report {
  id: string;
  userId: string;
  reporterName: string;
  reporterPhone: string;
  animalType: "dog" | "cat" | "other";
  condition: "injured" | "hungry" | "sick";
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  address?: string;
  status: "pending" | "rescued";
  createdAt: Date;
}

export interface NewReport {
  userId: string;
  reporterName: string;
  reporterPhone: string;
  animalType: "dog" | "cat" | "other";
  condition: "injured" | "hungry" | "sick";
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  address?: string;
  status: "pending";
  createdAt: Date;
}
