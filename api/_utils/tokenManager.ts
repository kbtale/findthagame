interface TwitchTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

export class TokenManager {
    private static instance: TokenManager;
    
    // Token data and expiration time
    private accessToken: string | null = null;
    private expiry: number = 0;

    private constructor() {}

    // My way to access the manager    
    public static getInstance(): TokenManager {
        if (!TokenManager.instance) {
            TokenManager.instance = new TokenManager();
        }
        return TokenManager.instance;
    }

    // The main function to get a token
    public async getToken(): Promise<string> {
        if (this.accessToken && Date.now() < this.expiry - 60000) {
            return this.accessToken;
        }
        return this.fetchNewToken();
    }
    private async fetchNewToken(): Promise<string> {
        const clientId = process.env.TWITCH_CLIENT_ID;
        const clientSecret = process.env.TWITCH_CLIENT_SECRET;
        
        if (!clientId || !clientSecret) {
            throw new Error('Missing Twitch Credentials.');
        }
        try {
            const response = await fetch(
                `https://api.twitch.tv/helix/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
                { method: 'POST' }
            );

            if (!response.ok) {
                throw new Error('Twitch auth failed');
            }
            const data = await response.json() as TwitchTokenResponse;
            
            this.accessToken = data.access_token

            this.expiry = Date.now() + (data.expires_in * 1000)
            
            return this.accessToken as string
        } catch (error) {
            console.error('Token generation failed: ', error);
            throw error;
        }
    }
}
