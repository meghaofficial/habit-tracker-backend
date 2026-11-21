export interface IRefreshToken {
  token: String;
  createdAt: Date;
  expiresAt: Date;
}

export interface IUser {
  username: string;
  email: string;
  password?: string;
  provider?: "local" | "google" | "github" | "twitter";
  providerId?: string; // id from OAuth provider
  refreshTokens: IRefreshToken[];
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  role?: string;
}
