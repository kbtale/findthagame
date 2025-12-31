export class TokenManager {
    private static instance: TokenManager;
    
    private accessToken: string | null = null;
    private expiry: number = 0;

    private constructor() {

    }
    
}
