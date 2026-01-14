import path from 'path';

export function sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') {
        throw new Error('Filename must be a non-empty string');
    }

    filename = filename.trim();

    if (filename.length === 0) {
        throw new Error('Filename cannot be empty');
    }

    if (filename.length > 255) {
        throw new Error('Filename is too long (max 255 characters)');
    }

    const dangerousPatterns = [
        /\.\./,
        /\\/,
        /\//,
        /:/,
        /\x00/,
        /[\x00-\x1f]/,
        /[<>:"|?*]/,
    ];

    for (const pattern of dangerousPatterns) {
        if (pattern.test(filename)) {
            throw new Error('Filename contains invalid characters or path traversal sequences');
        }
    }

    const basename = path.basename(filename);

    if (basename !== filename) {
        throw new Error('Filename contains path separators');
    }

    const specialNames = ['.', '..', 'CON', 'PRN', 'AUX', 'NUL',
                          'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
                          'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];

    if (specialNames.includes(basename.toUpperCase())) {
        throw new Error('Filename is a reserved name');
    }

    return basename;
}

export function validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
    if (!filename || !allowedExtensions || allowedExtensions.length === 0) {
        return false;
    }

    const ext = path.extname(filename).toLowerCase();
    return allowedExtensions.map(e => e.toLowerCase()).includes(ext);
}

export function createSafePath(baseDir: string, filename: string): string {
    const sanitized = sanitizeFilename(filename);
    const safePath = path.join(baseDir, sanitized);

    const resolvedPath = path.resolve(safePath);
    const resolvedBase = path.resolve(baseDir);

    if (!resolvedPath.startsWith(resolvedBase)) {
        throw new Error('Path traversal detected: resolved path is outside base directory');
    }

    return resolvedPath;
}
