import { z } from 'zod';

export const CreateHelpSchema = z.object({
    title: z.string().min(1, 'Заголовок обязателен').max(100, 'Заголовок не более 100 символов'),

    description: z.string().min(1, 'Описание обязательно').max(1000, 'Описание не более 1000 символов'),

    files: z.array(z.any()).max(5, 'Максимум 5 файлов').optional(),
});

export type CreateHelp = z.infer<typeof CreateHelpSchema>;
