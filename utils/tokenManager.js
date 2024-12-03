class TokenManager {
    constructor() {
        this.tokens = new Map();
        this.providers = new Map();
    }

    registerProvider(provider, config) {
        this.providers.set(provider, {
            expiresIn: config.expiresIn || 24 * 60 * 60 * 1000, // 기본 24시간
            refreshThreshold: config.refreshThreshold || 2 * 60 * 60 * 1000, // 기본 2시간
            onTokenExpiring: config.onTokenExpiring || null, // 토큰 만료 임박 시 콜백
            onTokenExpired: config.onTokenExpired || null, // 토큰 만료 시 콜백
        });
    }

    setToken(provider, token, customExpiresIn = null) {
        const providerConfig = this.providers.get(provider);
        if (!providerConfig) {
            throw new Error(`Provider ${provider} not registered`);
        }

        const tokenInfo = {
            token,
            expiresAt: Date.now() + (customExpiresIn || providerConfig.expiresIn),
            createdAt: Date.now(),
        };

        this.tokens.set(provider, tokenInfo);

        this.setupExpirationTimer(provider, tokenInfo);
    }

    setupExpirationTimer(provider, tokenInfo) {
        const providerConfig = this.providers.get(provider);
        const timeUntilExpiry = tokenInfo.expiresAt - Date.now();
        const refreshThreshold = providerConfig.refreshThreshold;

        // 토큰 만료 임박 시 콜백 실행
        if (providerConfig.onTokenExpiring) {
            setTimeout(() => {
                providerConfig.onTokenExpiring(provider, tokenInfo);
            }, timeUntilExpiry - refreshThreshold);
        }

        // 토큰 만료 시 콜백 실행
        if (providerConfig.onTokenExpired) {
            setTimeout(() => {
                providerConfig.onTokenExpired(provider, tokenInfo);
            }, timeUntilExpiry);
        }
    }

    getToken(provider) {
        const tokenInfo = this.tokens.get(provider);
        const providerConfig = this.providers.get(provider);

        if (!tokenInfo || !providerConfig) {
            return null;
        }

        const timeUntilExpiry = tokenInfo.expiresAt - Date.now();

        if (timeUntilExpiry <= providerConfig.refreshThreshold) {
            return null;
        }

        return tokenInfo.token;
    }

    isTokenValid(provider) {
        return this.getToken(provider) !== null;
    }

    removeToken(provider) {
        this.tokens.delete(provider);
    }

    getTokenInfo(provider) {
        const tokenInfo = this.tokens.get(provider);
        const providerConfig = this.providers.get(provider);

        if (!tokenInfo || !providerConfig) {
            return null;
        }
        return {
            token: tokenInfo.token,
            expiresAt: tokenInfo.expiresAt,
            createdAt: tokenInfo.createdAt,
            isValid: this.isTokenValid(provider),
            timeRemaining: tokenInfo.expiresAt - Date.now(),
            shouldRefresh: tokenInfo.expiresAt - Date.now() <= providerConfig.refreshThreshold,
        };
    }

    getAllTokens() {
        const result = {};
        for (const [provider] of this.tokens.entries()) {
            result[provider] = this.getTokenInfo(provider);
        }
        return result;
    }
}

export default new TokenManager(); // 싱글톤 인스턴스 export
