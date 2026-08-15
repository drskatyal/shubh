export {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from './config';
export { supabaseRequest } from './client';
export { sendPhoneOtp, toIndiaE164, verifyPhoneOtp } from './phone';
export {
  getAuthSession,
  getAuthUser,
  setAuthSession,
  signOut,
  type AuthSession,
  type AuthUser,
} from './session';
