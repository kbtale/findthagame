export const env = {
    API_URL: import.meta.env.VITE_API_URL || '/api',   
};

if (!env.API_URL) {
    throw new Error('BE CAREFUL! VITE_API_URL is missing in your .env');
}

