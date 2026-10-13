// Password rules shared by the Profile form (instant feedback) and the API
// (authoritative check).

export const PASSWORD_MIN_LENGTH = 10;

const CLASSES = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/];

/** Returns an error message, or null when the password is acceptable. */
export function checkNewPassword(password, { email = "", name = "" } = {}) {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (password.length > 200) return "Use at most 200 characters.";
  if (CLASSES.filter((re) => re.test(password)).length < 3) {
    return "Mix at least three of: lowercase, uppercase, numbers and symbols.";
  }
  const lower = password.toLowerCase();
  const local = email.split("@")[0]?.toLowerCase();
  const compactName = name.toLowerCase().replace(/\s+/g, "");
  if ((local && local.length > 3 && lower.includes(local)) || (compactName.length > 3 && lower.includes(compactName))) {
    return "Don't include your name or email in the password.";
  }
  return null;
}

/** 0–4 strength score for the meter. */
export function passwordScore(password = "") {
  if (!password) return 0;
  let score = CLASSES.filter((re) => re.test(password)).length - 1;
  if (password.length >= PASSWORD_MIN_LENGTH) score += 1;
  if (password.length >= 16) score += 1;
  return Math.max(0, Math.min(4, score));
}
