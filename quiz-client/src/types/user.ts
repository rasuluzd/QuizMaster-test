export interface User {
    sub: string; // Username (Email)
    nameid: string; // User ID
    jti: string; // Token ID
    exp: number; // Expiration timestamp
    iss: string; // Issuer
    aud: string; // Audience
}