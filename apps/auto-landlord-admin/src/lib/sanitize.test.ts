import { describe, it, expect } from "vitest";
import {
  sanitize,
  sanitizeText,
  sanitizeRichText,
  sanitizeUrl,
  sanitizeArray,
  sanitizeFormInput,
} from "./sanitize";

describe("Sanitization Utilities", () => {
  describe("sanitizeText (plain text)", () => {
    it("removes all HTML tags", () => {
      const input = "<script>alert('xss')</script>Hello";
      expect(sanitizeText(input)).toBe("Hello");
    });

    it("removes inline scripts", () => {
      const input = '<img src="x" onerror="alert(1)" />Image';
      expect(sanitizeText(input)).toBe("Image");
    });

    it("removes dangerous tags", () => {
      const input = "<iframe src='evil.com'></iframe>Text";
      expect(sanitizeText(input)).toBe("Text");
    });

    it("handles null and undefined", () => {
      expect(sanitizeText(null)).toBe("");
      expect(sanitizeText(undefined)).toBe("");
      expect(sanitizeText("")).toBe("");
    });

    it("preserves plain text", () => {
      const input = "Hello World!";
      expect(sanitizeText(input)).toBe("Hello World!");
    });

    it("removes event handlers", () => {
      const input = '<div onclick="alert(1)">Click</div>';
      expect(sanitizeText(input)).toBe("Click");
    });
  });

  describe("sanitizeRichText", () => {
    it("allows safe formatting tags", () => {
      const input = "<b>Bold</b> and <i>italic</i>";
      expect(sanitizeRichText(input)).toBe("<b>Bold</b> and <i>italic</i>");
    });

    it("removes script tags but keeps content", () => {
      const input = "<script>alert('xss')</script>Safe text";
      expect(sanitizeRichText(input)).toBe("Safe text");
    });

    it("removes event handlers from allowed tags", () => {
      const input = '<b onclick="alert(1)">Bold</b>';
      expect(sanitizeRichText(input)).toBe("<b>Bold</b>");
    });

    it("allows lists", () => {
      const input = "<ul><li>Item 1</li><li>Item 2</li></ul>";
      expect(sanitizeRichText(input)).toBe(
        "<ul><li>Item 1</li><li>Item 2</li></ul>"
      );
    });

    it("removes disallowed tags", () => {
      const input = '<a href="http://evil.com">Link</a>';
      expect(sanitizeRichText(input)).toBe("Link");
    });

    it("handles line breaks", () => {
      const input = "Line 1<br>Line 2";
      expect(sanitizeRichText(input)).toBe("Line 1<br>Line 2");
    });
  });

  describe("sanitizeUrl", () => {
    it("allows https URLs", () => {
      const input = "https://example.com";
      expect(sanitizeUrl(input)).toBe("https://example.com");
    });

    it("allows http URLs", () => {
      const input = "http://example.com";
      expect(sanitizeUrl(input)).toBe("http://example.com");
    });

    it("allows mailto URLs", () => {
      const input = "mailto:test@example.com";
      expect(sanitizeUrl(input)).toBe("mailto:test@example.com");
    });

    it("allows tel URLs", () => {
      const input = "tel:+1234567890";
      expect(sanitizeUrl(input)).toBe("tel:+1234567890");
    });

    it("allows relative URLs", () => {
      const input = "/path/to/page";
      expect(sanitizeUrl(input)).toBe("/path/to/page");
    });

    it("blocks javascript protocol", () => {
      const input = "javascript:alert(1)";
      expect(sanitizeUrl(input)).toBe("");
    });

    it("blocks data URIs", () => {
      const input = "data:text/html,<script>alert(1)</script>";
      expect(sanitizeUrl(input)).toBe("");
    });

    it("handles null and undefined", () => {
      expect(sanitizeUrl(null)).toBe("");
      expect(sanitizeUrl(undefined)).toBe("");
    });
  });

  describe("sanitizeArray", () => {
    it("sanitizes array of strings", () => {
      const input = ["<script>test</script>", "Safe", "<b>Bold</b>"];
      // DOMPurify removes script tags completely (including content)
      expect(sanitizeArray(input, "plainText")).toEqual(["Safe", "Bold"]);
    });

    it("filters out empty strings after sanitization", () => {
      const input = ["<script></script>", "Text", ""];
      expect(sanitizeArray(input, "plainText")).toEqual(["Text"]);
    });

    it("handles null and undefined items", () => {
      const input = [null, "Text", undefined, "More"];
      expect(sanitizeArray(input, "plainText")).toEqual(["Text", "More"]);
    });

    it("handles null array", () => {
      expect(sanitizeArray(null)).toEqual([]);
      expect(sanitizeArray(undefined)).toEqual([]);
    });

    it("preserves rich text formatting", () => {
      const input = ["<b>Bold</b>", "<script>bad</script>Good"];
      expect(sanitizeArray(input, "richText")).toEqual(["<b>Bold</b>", "Good"]);
    });
  });

  describe("sanitizeFormInput", () => {
    it("sanitizes text fields", () => {
      const input = {
        name: "<script>alert(1)</script>John",
        age: 25,
        description: "<b>Bold</b> text",
      };

      const result = sanitizeFormInput(input, ["name"], ["description"]);

      expect(result.name).toBe("John");
      expect(result.age).toBe(25);
      expect(result.description).toBe("<b>Bold</b> text");
    });

    it("preserves fields not in sanitization list", () => {
      const input = {
        name: "John",
        id: 123,
        active: true,
      };

      const result = sanitizeFormInput(input, ["name"]);

      expect(result).toEqual({
        name: "John",
        id: 123,
        active: true,
      });
    });

    it("handles missing fields gracefully", () => {
      const input = {
        name: "John",
      };

      const result = sanitizeFormInput(
        input,
        ["name", "description"],
        ["bio"]
      );

      expect(result.name).toBe("John");
      expect(result.description).toBeUndefined();
      expect(result.bio).toBeUndefined();
    });

    it("handles nested sanitization", () => {
      const input = {
        title: "<script>bad</script>Title",
        description: "<p>Good paragraph</p>",
        notes: "<b>Important</b> <script>alert(1)</script>",
      };

      const result = sanitizeFormInput(
        input,
        ["title"],
        ["description", "notes"]
      );

      expect(result.title).toBe("Title");
      expect(result.description).toBe("<p>Good paragraph</p>");
      expect(result.notes).toBe("<b>Important</b> ");
    });
  });

  describe("Edge cases and security", () => {
    it("handles encoded scripts", () => {
      const input = "&lt;script&gt;alert(1)&lt;/script&gt;";
      // DOMPurify doesn't decode HTML entities - they remain encoded (safe)
      expect(sanitizeText(input)).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
    });

    it("handles multiple script attempts", () => {
      const input =
        '<script>alert(1)</script><script>alert(2)</script>Safe';
      expect(sanitizeText(input)).toBe("Safe");
    });

    it("handles deeply nested tags", () => {
      const input =
        "<div><div><div><script>alert(1)</script>Text</div></div></div>";
      expect(sanitizeText(input)).toBe("Text");
    });

    it("handles mixed content", () => {
      const input =
        'Normal <b>bold</b> <script>alert(1)</script> <i>italic</i>';
      expect(sanitizeRichText(input)).toBe("Normal <b>bold</b>  <i>italic</i>");
    });

    it("prevents attribute injection", () => {
      const input = '<b style="expression(alert(1))">Text</b>';
      expect(sanitizeRichText(input)).toBe("<b>Text</b>");
    });

    it("handles very long strings", () => {
      const input = "a".repeat(100000) + "<script>alert(1)</script>";
      const result = sanitizeText(input);
      expect(result).not.toContain("<script>");
      expect(result.length).toBeLessThanOrEqual(100000);
    });
  });
});

