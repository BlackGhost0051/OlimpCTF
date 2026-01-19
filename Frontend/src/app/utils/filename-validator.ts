export class FilenameValidator {
  static validate(filename: string): { isValid: boolean; error?: string } {
    if (!filename || typeof filename !== 'string') {
      return { isValid: false, error: 'Filename must be a non-empty string' };
    }

    const trimmed = filename.trim();

    if (trimmed.length === 0) {
      return { isValid: false, error: 'Filename cannot be empty' };
    }

    if (trimmed.length > 255) {
      return { isValid: false, error: 'Filename is too long (max 255 characters)' };
    }

    const dangerousPatterns = [
      { pattern: /\.\./, message: 'Filename cannot contain ".." (parent directory)' },
      { pattern: /\\/, message: 'Filename cannot contain backslashes' },
      { pattern: /\//, message: 'Filename cannot contain forward slashes' },
      { pattern: /:/, message: 'Filename cannot contain colons' },
      { pattern: /\x00/, message: 'Filename cannot contain null bytes' },
      { pattern: /[\x00-\x1f]/, message: 'Filename cannot contain control characters' },
      { pattern: /[<>"|?*]/, message: 'Filename contains invalid characters' },
    ];

    for (const { pattern, message } of dangerousPatterns) {
      if (pattern.test(trimmed)) {
        return { isValid: false, error: message };
      }
    }

    const reservedNames = [
      '.', '..', 'CON', 'PRN', 'AUX', 'NUL',
      'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
      'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ];

    if (reservedNames.includes(trimmed.toUpperCase())) {
      return { isValid: false, error: 'Filename is a reserved name' };
    }

    return { isValid: true };
  }

  static sanitize(filename: string): string {
    if (!filename || typeof filename !== 'string') {
      return '';
    }

    let sanitized = filename.trim();

    sanitized = sanitized.replace(/[\/\\]/g, '');

    sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, '');

    sanitized = sanitized.replace(/\.\./g, '');

    return sanitized;
  }
}
