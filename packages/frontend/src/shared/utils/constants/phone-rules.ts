export type PhoneRule = {
    code: string;
    example: string;
    total: number;
    groups: number[];
    type: 'space' | 'ru' | 'us';
};

export const PHONE_RULES: PhoneRule[] = [
    {
        code: '380',
        example: '+380 99 123 45 67',
        total: 12,
        groups: [2, 3, 2, 2],
        type: 'space',
    },
    {
        code: '375',
        example: '+375 29 123 45 67',
        total: 12,
        groups: [2, 3, 2, 2],
        type: 'space',
    },
    {
        code: '7',
        example: '+7 (999) 123-45-67',
        total: 11,
        groups: [3, 3, 2, 2],
        type: 'ru',
    },
    {
        code: '1',
        example: '+1 (999) 123-4567',
        total: 11,
        groups: [3, 3, 4],
        type: 'us',
    },
    {
        code: '44',
        example: '+44 1234 567890',
        total: 12,
        groups: [4, 6],
        type: 'space',
    },
    {
        code: '49',
        example: '+49 123 4567890',
        total: 12,
        groups: [3, 7],
        type: 'space',
    },
];
