import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitization configuration for different content types
 */
const SANITIZE_CONFIG = {
  // For rich text with basic formatting (descriptions, messages)
  richText: {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
    ALLOWED_ATTR: [] as string[],
    KEEP_CONTENT: true,
  },
  // For plain text only (names, addresses, titles)
  plainText: {
    ALLOWED_TAGS: [] as string[],
    ALLOWED_ATTR: [] as string[],
    KEEP_CONTENT: true,
  },
  // For URLs
  url: {
    ALLOWED_TAGS: [] as string[],
    ALLOWED_ATTR: [] as string[],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):)/i,
  },
};

/**
 * Sanitizes user input to prevent XSS attacks
 *
 * @param input - The user input to sanitize
 * @param type - The type of content (richText, plainText, url)
 * @returns Sanitized string safe for rendering
 *
 * @example
 * ```ts
 * const safe = sanitize("<script>alert('xss')</script>Hello", "plainText");
 * // Returns: "Hello"
 *
 * const safe = sanitize("<b>Bold</b> text", "richText");
 * // Returns: "<b>Bold</b> text"
 * ```
 */
export function sanitize(
  input: string | null | undefined,
  type: keyof typeof SANITIZE_CONFIG = "plainText"
): string {
  // Handle null/undefined
  if (input === null || input === undefined || input === "") {
    return "";
  }

  // Convert to string if needed
  const stringInput = String(input);

  // Sanitize based on type
  const config = SANITIZE_CONFIG[type];
  const sanitized = DOMPurify.sanitize(stringInput, config);

  return sanitized;
}

/**
 * Sanitizes a plain text string (removes all HTML)
 * Use for: names, addresses, titles, simple text fields
 */
export function sanitizeText(input: string | null | undefined): string {
  return sanitize(input, "plainText");
}

/**
 * Sanitizes rich text (allows basic formatting tags)
 * Use for: descriptions, messages, notes with formatting
 */
export function sanitizeRichText(input: string | null | undefined): string {
  return sanitize(input, "richText");
}

/**
 * Sanitizes and validates a URL
 * Use for: external links, user-provided URLs
 */
export function sanitizeUrl(input: string | null | undefined): string {
  if (!input) return "";

  const sanitized = sanitize(input, "url");

  // Additional validation: must start with allowed protocol
  if (
    !sanitized.match(/^(?:https?|mailto|tel):/i) &&
    !sanitized.startsWith("/")
  ) {
    return "";
  }

  return sanitized;
}

/**
 * Sanitizes an array of strings
 */
export function sanitizeArray(
  items: (string | null | undefined)[] | null | undefined,
  type: keyof typeof SANITIZE_CONFIG = "plainText"
): string[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  return items.map((item) => sanitize(item, type)).filter((item) => item !== "");
}

/**
 * React component wrapper for rendering sanitized HTML
 * Use when you need to render rich text as HTML
 *
 * @example
 * ```tsx
 * <div dangerouslySetInnerHTML={{ __html: sanitizeForReact(userContent, 'richText') }} />
 * ```
 */
export function sanitizeForReact(
  input: string | null | undefined,
  type: keyof typeof SANITIZE_CONFIG = "richText"
): string {
  return sanitize(input, type);
}

/**
 * Validates and sanitizes user input before submitting to API
 * This is a pre-submission check, server should still validate
 */
export function sanitizeFormInput(
  data: Record<string, any>,
  textFields: string[] = [],
  richTextFields: string[] = []
): Record<string, any> {
  const sanitized = { ...data };

  // Sanitize plain text fields
  textFields.forEach((field) => {
    if (sanitized[field] !== undefined) {
      sanitized[field] = sanitizeText(sanitized[field]);
    }
  });

  // Sanitize rich text fields
  richTextFields.forEach((field) => {
    if (sanitized[field] !== undefined) {
      sanitized[field] = sanitizeRichText(sanitized[field]);
    }
  });

  return sanitized;
}

