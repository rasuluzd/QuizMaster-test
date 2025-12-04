import type { LoginDto, RegisterDto, AuthResponse } from "../types/auth";

// Ensure this matches your backend port (found in api/Properties/launchSettings.json)
const API_URL = "http://localhost:5043/api/Auth";

export const login = async (credentials: LoginDto): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Login failed");
    }

    return response.json();
};

export const register = async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        // The backend Identity framework returns an array of errors
        // We map them to a single string
        const errorMessages = errorData.map((err: any) => err.description).join(", ");
        throw new Error(errorMessages || "Registration failed");
    }

    return response.json();
};