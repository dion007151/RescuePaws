export interface Report {
  id: string;
  userId: string;
  animalType: "dog" | "cat" | "other";
  condition: "injured" | "hungry" | "sick";
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  status: "pending" | "rescued";
  createdAt: Date;
}

export interface NewReport {
  userId: string;
  animalType: "dog" | "cat" | "other";
  condition: "injured" | "hungry" | "sick";
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  status: "pending";
  createdAt: Date;
}
