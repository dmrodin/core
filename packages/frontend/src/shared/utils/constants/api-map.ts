export const API_MAP = {
    ANALYTICS: {
        ANALYTICS: '/analytics',
        ANALYTICS_BY_ID: (id: string) => `/analytics/${id}`,
    },
    APPLICATIONS: {
        APPLICATIONS: '/applications',
        APPLICATION_BY_ID: (id: string | number) => `/applications/${id}`,
        APLICATION_STATUS: (id: string | number) => `/applications/${id}/status`,
    },
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        REGISTER: '/auth/register',
    },
    CURRENCIES: {
        CURRENCIES: '/currencies',
    },
    GUIDES: {
        GUIDES: '/guides',
        GUIDE_BY_ID: (id: string) => `/guides/${id}`,
    },
    NETWORKS: {
        NETWORKS: '/networks',
        NETWORK_BY_ID: (id: string) => `/networks/${id}`,
    },
    NETWORK_TYPES: {
        NETWORK_TYPES: '/network-types',
        NETWORK_TYPE_BY_ID: (id: string) => `/network-types/${id}`,
    },
    OPERATIONS: {
        OPERATIONS: '/operations',
        OPERATIONS_BY_ID: (id: string) => `/operations/${id}`,
    },
    OPERATION_TYPES: {
        OPERATION_TYPES: '/operation-types',
        OPERATION_TYPE_BY_ID: (id: string) => `/operation-types/${id}`,
    },
    PLATFORMS: {
        PLATFORMS: '/platforms',
        PLATFORM_BY_ID: (id: string) => `/platforms/${id}`,
    },
    BANKS: {
        BANKS: '/banks',
        BANK_BY_ID: (id: string) => `/banks/${id}`,
    },
    SESSIONS: {
        SESSIONS: '/sessions',
        MY_SESSIONS: '/sessions/my',
        SESSION_BY_ID: (id: string) => `/sessions/${id}`,
        DEACTIVATE_MY_SESSIONS: '/sessions/deactivate-my',
        DEACTIVATE_MY_SESSION_BY_ID: (id: string) => `/sessions/deactivate-my/${id}`,
    },
    USERS: {
        USERS: '/users',
        USER_BY_ID: (id: string) => `/users/${id}`,
        BLOCK_USER: (id: string) => `/users/${id}/block`,
        USER_ROLES: (id: string) => `/users/${id}/roles`,
        COURIERS: '/users/couriers',
        COURIER_BY_ID: (id: string) => `/users/couriers/${id}`,
    },
    WALLETS: {
        WALLETS: '/wallets',
        ANALYTICS: '/wallets/analytics',
        PINNED: '/wallets/pinned',
        WALLET_BY_ID: (id: string) => `/wallets/${id}`,
        WALLET_BALANCE: (id: string) => `/wallets/${id}/balance`,
        WALLET_TRANSACTIONS: (id: string) => `/wallets/${id}/transactions`,
        WALLET_TRANSACTION_BY_ID: (walletId: string, transactionId: string) =>
            `/wallets/${walletId}/transactions/${transactionId}`,
    },

    FEEDBACK: {
        FEEDBACK: '/feedback',
    },
    REGULATIONS: {
        REGULATIONS: '/regulations',
        REGULATION_DOWNLOAD: (id: string) => `/regulations/${id}/download`,
        REGULATION_BY_ID: (id: string) => `/regulations/${id}`,
    },
    LOCKED_PERIODS: {
        LOCKED_PERIODS: '/locked-periods',
        OPEN_LOCKED_PERIOD: (id: string) => `/locked-periods/${id}/open`,
    },
};
