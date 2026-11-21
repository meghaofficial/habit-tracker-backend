export interface IOtp {
  email: string;
  username?: string;
  password?: string;
  otp: string;
  type: string;
  expiresAt: Date;
}
