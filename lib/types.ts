export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  isAdmin?: boolean;
  notificationsEnabled?: boolean;
  rescueCount?: number;
  points?: number;
  teamId?: "guardians" | "patrol" | "frontline";
  createdAt: Date;
}

export interface Report {
  id: string;
  userId: string;
  reporterName: string;
  reporterPhone: string;
  animalType: "dog" | "cat" | "other";
  condition: "injured" | "hungry" | "sick";
  category: "stray" | "lost";
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  address?: string;
  status: "pending" | "rescued";
  createdAt: Date;
  sponsorshipCount?: number;
}

export interface NewReport {
  userId: string;
  reporterName: string;
  reporterPhone: string;
  animalType: "dog" | "cat" | "other";
  condition: "injured" | "hungry" | "sick";
  category: "stray" | "lost";
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  address?: string;
  status: "pending";
  createdAt: Date;
}

export interface SuccessStory {
  id: string;
  reportId: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  story: string;
  rescuerName: string;
  createdAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  type: "clinic" | "shelter";
  address: string;
  phone: string;
  lat: number;
  lng: number;
}

export interface ChatMessage {
  id: string;
  reportId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}
