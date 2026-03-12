import { Metadata } from 'next';

import { GuidesPageContent } from '@/features/guides/ui/guides-page-content/guides-page-content';

export const metadata: Metadata = {
    title: 'Гайды',
};

export default function GuidesPage() {
    return (
        <div className="space-y-6">
            <GuidesPageContent />
        </div>
    );
}
