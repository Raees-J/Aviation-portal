// Temporary in-memory storage for authentication
// In production, this should be replaced with database storage

export const users: any[] = [];
export const pendingVerifications = new Map<string, any>();
