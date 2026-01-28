import { Metadata } from 'next';

import { FeedbackForm } from '@/features/feedback';

export const metadata: Metadata = {
    title: 'Обратная связь',
};

export default function FeedbackPage() {
    return <FeedbackForm />;
}
