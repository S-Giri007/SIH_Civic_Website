export interface User {
  _id?: string;
  username: string;
  password: string;
  role: 'citizen' | 'officer';
  name: string;
  email: string;
  phone?: string;
  createdAt?: Date;
}

export interface Issue {
  _id?: string;
  title: string;
  description: string;
  category: 'road' | 'water' | 'electricity' | 'garbage' | 'park' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  location: string;
  locationCoordinates?: {
    lat: number;
    lng: number;
  };
  images: string[];
  citizenId: string;
  citizenName: string;
  citizenContact: string;
  assignedOfficer?: string;
  createdAt?: Date;
  updatedAt?: Date;
  notes?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}