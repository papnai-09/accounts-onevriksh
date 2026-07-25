export async function sendSmsOtp(phone: string, otp: string): Promise<boolean> {
  const cleanPhone = phone.replace(/\D/g, "");

  // 1. Fast2SMS Integration (Popular Indian SMS Gateway)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const response = await fetch(
        `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&variables_values=${otp}&route=otp&numbers=${cleanPhone}`,
        { method: "GET" }
      );
      const data = await response.json();
      console.log(`📱 [Fast2SMS] Response:`, data);
      return data.return === true;
    } catch (error) {
      console.error("❌ [Fast2SMS Error]:", error);
    }
  }

  // 2. Twilio Integration (Global SMS Provider)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const authHeader = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString("base64");

      const body = new URLSearchParams({
        To: phone.startsWith("+") ? phone : `+91${cleanPhone}`,
        From: process.env.TWILIO_PHONE_NUMBER,
        Body: `Your Onevriksh verification code is: ${otp}. Valid for 5 minutes.`,
      });

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        }
      );
      const data = await response.json();
      console.log(`📱 [Twilio SMS] Response:`, data.sid ? "Dispatched" : data);
      return !!data.sid;
    } catch (error) {
      console.error("❌ [Twilio Error]:", error);
    }
  }

  console.log(`📱 [SMS Simulation Log] Mobile: ${phone} | OTP Code: ${otp}`);
  return true;
}
