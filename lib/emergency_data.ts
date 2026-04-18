import { Organization } from "./types";

export const EMERGENCY_CONTACTS: Organization[] = [
  {
    id: "vet-1",
    name: "Antique Veterinary Clinic",
    type: "clinic",
    address: "San Jose de Buenavista, Antique",
    phone: "0912 345 6789",
    lat: 10.7431,
    lng: 121.9421
  },
  {
    id: "vet-2",
    name: "Paws & Whiskers Care",
    type: "clinic",
    address: "Sibalom, Antique",
    phone: "0917 123 4567",
    lat: 10.7831,
    lng: 122.0121
  },
  {
    id: "shelter-1",
    name: "Safe Haven Shelter",
    type: "shelter",
    address: "Hamtic, Antique",
    phone: "0918 999 8888",
    lat: 10.7031,
    lng: 121.9621
  }
];
