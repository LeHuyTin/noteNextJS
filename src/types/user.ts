export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserProfile {
  id: string;
  email: string;
  fullName: string;
}