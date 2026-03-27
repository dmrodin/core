'use client';

import { useCallback, useRef } from 'react';

import { FileSpreadsheet, FileText, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { RegulationItem, useDeleteRegulation, useRegulations, useUploadRegulation } from '@/entities/regulation';
import { UserRole } from '@/entities/users/model/user-schemas';
import { useAuthStore } from '@/features/users/ui/user-stores/user-store';
import { RegulationService } from '@/entities/regulation';
import { Button, Loading } from '@/shared';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/shared/ui/shadcn/alert-dialog';

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

function isPdf(mimeType: string): boolean {
    return mimeType === 'application/pdf';
}

export default function RegulationsPage() {
    const currentUser = useAuthStore((state) => state.user);
    const isAdmin = currentUser?.roles?.some((r) => r.code === UserRole.ADMIN) ?? false;

    const { data: regulations = [], isLoading } = useRegulations();
    const { mutate: upload, isPending: isUploading } = useUploadRegulation();
    const { mutate: deleteReg } = useDeleteRegulation();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const allowed = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
            ];
            if (!allowed.includes(file.type)) {
                toast.error('Допустимы только PDF и Excel файлы');
                return;
            }
            upload(file);
            e.target.value = '';
        },
        [upload],
    );

    const handleDownload = useCallback(async (regulation: RegulationItem) => {
        const blob = await RegulationService.download(regulation.id);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = regulation.originalName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Регламенты</h1>
                {isAdmin && (
                    <>
                        <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                            {isUploading ? <Loading /> : <><Upload className="w-4 h-4 mr-2" />Загрузить</>}
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.xlsx,.xls"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><Loading /></div>
            ) : regulations.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">Регламенты ещё не загружены</p>
            ) : (
                <div className="space-y-2">
                    {regulations.map((reg) => (
                        <div
                            key={reg.id}
                            className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                            <div className="shrink-0 text-muted-foreground">
                                {isPdf(reg.mimeType) ? (
                                    <FileText className="w-6 h-6 text-red-500" />
                                ) : (
                                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                                )}
                            </div>

                            <button
                                className="flex-1 text-left min-w-0"
                                onClick={() => handleDownload(reg)}
                            >
                                <p className="font-medium truncate">{reg.originalName}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {formatSize(reg.size)} · {new Date(reg.createdAt).toLocaleDateString('ru-RU')}
                                </p>
                            </button>

                            {isAdmin && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Удалить регламент?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                «{reg.originalName}» будет удалён без возможности восстановления.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteReg(reg.id)}>
                                                Удалить
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
