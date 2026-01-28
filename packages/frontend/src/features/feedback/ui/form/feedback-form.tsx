'use client';

import React, { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Upload, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { CreateHelp, CreateHelpSchema } from '@/entities/help';
import { useCreateHelp } from '@/features/feedback';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared';
import { Button } from '@/shared';
import { Input } from '@/shared';
import { Textarea } from '@/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared';

export function FeedbackForm() {
    const [files, setFiles] = useState<File[]>([]);
    const { mutate: createHelp, isPending } = useCreateHelp();

    const form = useForm<CreateHelp>({
        resolver: zodResolver(CreateHelpSchema),
        defaultValues: {
            title: '',
            description: '',
            files: [],
        },
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (!selectedFiles) return;

        const newFiles = Array.from(selectedFiles);
        if (files.length + newFiles.length > 5) {
            alert('Можно загрузить не более 5 файлов');
            return;
        }

        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);
        form.setValue('files', updatedFiles);
        event.target.value = '';
    };

    const removeFile = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        form.setValue('files', updatedFiles);
    };

    const onSubmit = (data: CreateHelp) => {
        createHelp(data);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Форма обратной связи</CardTitle>
                <CardDescription>Заполните форму ниже и при необходимости прикрепите файлы (до 5 штук)</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Заголовок *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Введите заголовок обращения" {...field} />
                                    </FormControl>
                                    <FormDescription>Кратко опишите суть вашего обращения</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Описание *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Подробно опишите вашу проблему или вопрос"
                                            rows={5}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Опишите проблему максимально подробно для быстрого решения
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <FormLabel>Прикрепленные файлы</FormLabel>

                            {files.length > 0 && (
                                <div className="space-y-2">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <FileText className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm truncate max-w-xs text-gray-500">
                                                    {file.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    ({(file.size / 1024).toFixed(1)} KB)
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {files.length < 5 && (
                                <div>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="*/*"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <Upload className="h-5 w-5" />
                                            <span>Выберите файлы</span>
                                        </div>
                                    </label>
                                    <FormDescription>
                                        Можно загрузить до {5 - files.length} файлов. Максимум 5 файлов всего.
                                    </FormDescription>
                                </div>
                            )}
                        </div>

                        <Button type="submit" disabled={isPending} className="w-full">
                            {isPending ? 'Отправка...' : 'Отправить обращение'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
