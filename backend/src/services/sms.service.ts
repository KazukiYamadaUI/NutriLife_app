import { env } from '../config/env';

// In production, use Twilio for real SMS
// In development, codes are logged to console
export class SmsService {
  private twilioClient: any;

  constructor() {
    if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        this.twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
      } catch {
        console.warn('Twilio not configured, using mock SMS');
      }
    }
  }

  generateCode(): string {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  async sendCode(phone: string, code: string): Promise<void> {
    if (this.twilioClient && env.TWILIO_PHONE_NUMBER) {
      try {
        await this.twilioClient.messages.create({
          body: `NutriLifeの認証コード: ${code}`,
          from: env.TWILIO_PHONE_NUMBER,
          to: phone.startsWith('+') ? phone : `+81${phone.slice(1)}`,
        });
        console.log(`SMS sent to ${phone}`);
        return;
      } catch (error) {
        console.error('Twilio SMS failed:', error);
        // Fall through to dev mode
      }
    }

    // Development mode: log code to console
    console.log(`\n=============================`);
    console.log(`  SMS認証コード: ${code}`);
    console.log(`  送信先: ${phone}`);
    console.log(`=============================\n`);
  }
}

export const smsService = new SmsService();
