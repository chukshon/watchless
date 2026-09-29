export type UserT = {
  id: string;
  email: string;
  name: string | null;
  isEmailVerified: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthUserResponse = {
  user: UserT;
  token: string;
};
