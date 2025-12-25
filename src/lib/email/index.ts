/**
 * Exportaciones del módulo de email
 */
export { resend, EMAIL_FROM, EMAIL_FROM_DEV } from './resend';
export { 
  sendInterestNotificationEmail,
  hasEmailBeenSent,
  getProviderEmailNotifications,
} from './emailNotificationService';
export {
  generateInterestEmailHTML,
  generateInterestEmailText,
  generateInterestEmailSubject,
  type InterestEmailData,
} from './interestEmailTemplate';


