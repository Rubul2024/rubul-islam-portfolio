// Shared contact-form validation. Used by the client form for instant
// feedback and by the API route as the authoritative server-side check.

import { budgetRanges, contactTopics, timelineOptions } from "@/data/services";

// Topics come from data/services.js so the form always matches the services.
export const PROJECT_TYPES = contactTopics;
export const BUDGET_RANGES = budgetRanges;
export const TIMELINE_OPTIONS = timelineOptions;

export const LIMITS = {
  name: { min: 2, max: 80 },
  phone: { max: 20 },
  message: { min: 10, max: 4000 },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Optional phone: digits with spaces, dashes, dots, brackets and a leading +.
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * @param {Record<string, unknown>} input
 * @returns {{ data: {name:string,email:string,phone:string,projectType:string,budget:string,timeline:string,message:string}, errors: Record<string,string>, valid: boolean }}
 */
export function validateContact(input = {}) {
  const data = {
    name: clean(input.name).replace(/\s+/g, " "),
    email: clean(input.email).toLowerCase(),
    phone: clean(input.phone).replace(/\s+/g, " "),
    projectType: clean(input.projectType),
    budget: clean(input.budget),
    timeline: clean(input.timeline),
    message: clean(input.message),
  };

  const errors = {};

  if (!data.name) {
    errors.name = "Please enter your name.";
  } else if (data.name.length < LIMITS.name.min) {
    errors.name = `Name should be at least ${LIMITS.name.min} characters.`;
  } else if (data.name.length > LIMITS.name.max) {
    errors.name = `Name should be under ${LIMITS.name.max} characters.`;
  }

  if (!data.email) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_RE.test(data.email) || data.email.length > 254) {
    errors.email = "Please enter a valid email address, like name@example.com.";
  }

  if (data.phone && (!PHONE_RE.test(data.phone) || data.phone.replace(/\D/g, "").length < 7)) {
    errors.phone = "Please enter a valid phone number, or leave it empty.";
  }

  if (!PROJECT_TYPES.includes(data.projectType)) {
    errors.projectType = "Please choose what you'd like to discuss.";
  }

  // Optional fields: empty is fine, otherwise it must be one of the offered choices.
  if (data.budget && !BUDGET_RANGES.includes(data.budget)) errors.budget = "Please choose a budget range from the list.";
  if (data.timeline && !TIMELINE_OPTIONS.includes(data.timeline)) errors.timeline = "Please choose a timeline from the list.";

  if (!data.message) {
    errors.message = "Please write a short message.";
  } else if (data.message.length < LIMITS.message.min) {
    errors.message = `Please add a little more detail (at least ${LIMITS.message.min} characters).`;
  } else if (data.message.length > LIMITS.message.max) {
    errors.message = `Please keep your message under ${LIMITS.message.max} characters.`;
  }

  return { data, errors, valid: Object.keys(errors).length === 0 };
}

/** Builds a mailto: link carrying the visitor's message, used as a fallback. */
export function buildMailto(to, { name = "", projectType = "", budget = "", timeline = "", message = "" } = {}) {
  const subject = projectType ? `Portfolio enquiry: ${projectType}` : "Portfolio enquiry";
  const details = [budget && `Budget: ${budget}`, timeline && `Timeline: ${timeline}`].filter(Boolean);
  const body = [message, ...(details.length ? ["", ...details] : []), "", name ? `— ${name}` : ""].join("\n").trim();
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
