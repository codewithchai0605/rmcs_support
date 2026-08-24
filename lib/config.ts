function requiredString(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const config = {
  mongoUri: requiredString("MONGODB_URI", process.env.MONGODB_URI),
  postbackSecret: process.env.POSTBACK_SECRET ?? "",
  dailyAdLimit: Number(process.env.DAILY_AD_LIMIT) || 5,
  attemptTtlMinutes: Number(process.env.ATTEMPT_TTL_MINUTES) || 20
};
