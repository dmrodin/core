import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { RegulationService } from '../api/regulation-service';

const QUERY_KEY = ['regulations'];

export const useRegulations = () => {
    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: () => RegulationService.getAll(),
    });
};

export const useUploadRegulation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (file: File) => RegulationService.upload(file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            toast.success('Файл загружен');
        },
    });
};

export const useDeleteRegulation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => RegulationService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            toast.success('Регламент удалён');
        },
    });
};

export const useDownloadRegulation = () => {
    return useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) =>
            RegulationService.download(id).then((blob) => ({ blob, name })),
        onSuccess: ({ blob, name }) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        },
    });
};
