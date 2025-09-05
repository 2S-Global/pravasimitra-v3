// src/utils/phoneValidation.js

// Phone validation rules
const RULES = {
  US: { cc: "1", nsnMin: 10, nsnMax: 10, mobilePattern: /^[2-9]\d{2}[2-9]\d{6}$/ },
  UK: { cc: "44", nsnMin: 10, nsnMax: 10, mobilePattern: /^7\d{9}$/ },
  IN: { cc: "91", nsnMin: 10, nsnMax: 10, mobilePattern: /^[6-9]\d{9}$/ },
  BD: { cc: "880", nsnMin: 10, nsnMax: 10, mobilePattern: /^1[3-9]\d{8}$/ },
};

const EXT_REGEX = /\s*(?:ext\.?|x|#)\s*(\d{1,5})\s*$/i;

export function validatePhone(rawInput) {
  if (!rawInput || !rawInput.trim()) {
    return { ok: false, error: "Phone number is required" };
  }

  let input = rawInput.trim();
  let ext;

  // Extract extension (if any)
  const extMatch = input.match(EXT_REGEX);
  if (extMatch) {
    ext = extMatch[1];
    input = input.replace(EXT_REGEX, "");
  }

  // ✅ Strict check: must start with + and only digits allowed
  if (!/^\+\d+$/.test(input)) {
    return { ok: false, error: "Only numbers allowed, must start with +country code (+1, +44, +91, +880)" };
  }

  // Detect country and validate NSN length
  for (const [country, meta] of Object.entries(RULES)) {
    if (input.startsWith("+" + meta.cc)) {
      const nsn = input.slice(meta.cc.length + 1); // remove + and country code

      // ✅ Check min/max length
      if (nsn.length < meta.nsnMin || nsn.length > meta.nsnMax) {
        return { 
          ok: false, 
          error: `Only numbers allowed, must be between ${meta.nsnMin} and ${meta.nsnMax} digits for ${country}` 
        };
      }

      // ✅ Pattern check
      if (!meta.mobilePattern.test(nsn)) {
        return { ok: false, error: `Only numbers allowed, invalid ${country} mobile number` };
      }

      return { ok: true, e164: `+${meta.cc}${nsn}`, ext, country };
    }
  }

  return { ok: false, error: "Only numbers allowed, unsupported country code (only US, UK, IN, BD allowed)" };
}
