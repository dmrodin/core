'use client';

import * as React from 'react';

import { Locale, format, parse, setHours, setMinutes, setSeconds } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/shadcn/button';
import { Calendar } from '@/shared/ui/shadcn/calendar';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/popover';

interface DateTimePickerProps {
    value?: string;
    onChange: (value: string) => void;
    className?: string;
    label?: string;
}

function formatDate(date: Date | undefined, locale: Locale = ru) {
    if (!date) {
        return '';
    }
    return format(date, 'dd.MM.yyyy', { locale });
}

function formatTime(date: Date | undefined) {
    if (!date) {
        return '00:00';
    }
    return format(date, 'HH:mm');
}

function isValidDate(date: Date | undefined) {
    if (!date) {
        return false;
    }
    return !isNaN(date.getTime());
}

export function DateTimePicker({ value, onChange, className, label }: DateTimePickerProps) {
    const lastEmittedValueRef = React.useRef<string | undefined>(value);
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined);
    const [month, setMonth] = React.useState<Date | undefined>(date);
    const [dateValue, setDateValue] = React.useState(formatDate(date));
    const [timeValue, setTimeValue] = React.useState(formatTime(date));

    React.useEffect(() => {
        if (value === lastEmittedValueRef.current) {
            return;
        }

        const nextDate = value ? new Date(value) : undefined;
        const isNextDateValid = isValidDate(nextDate);
        const normalizedDate = isNextDateValid ? nextDate : undefined;

        setDate(normalizedDate);
        setMonth(normalizedDate);
        setDateValue(formatDate(normalizedDate));
        setTimeValue(formatTime(normalizedDate));
    }, [value]);

    React.useEffect(() => {
        if (!date) return;

        const matched = timeValue.match(/^(\d{2}):(\d{2})$/);
        if (!matched) return;

        const hours = Math.min(23, Number(matched[1]));
        const minutes = Math.min(59, Number(matched[2]));

        let newDate = setHours(date, hours);
        newDate = setMinutes(newDate, minutes);
        newDate = setSeconds(newDate, 0);

        const nextValue = newDate.toISOString();
        lastEmittedValueRef.current = nextValue;
        onChange(nextValue);
    }, [date, timeValue, onChange]);

    const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^\d]/g, '').slice(0, 8);
        let formatted = raw;

        if (raw.length > 4) {
            formatted = `${raw.slice(0, 2)}.${raw.slice(2, 4)}.${raw.slice(4)}`;
        } else if (raw.length > 2) {
            formatted = `${raw.slice(0, 2)}.${raw.slice(2)}`;
        }

        setDateValue(formatted);

        if (raw.length !== 8) return;

        const parsedDate = parse(formatted, 'dd.MM.yyyy', new Date(), { locale: ru });
        if (!isValidDate(parsedDate)) return;
        if (format(parsedDate, 'dd.MM.yyyy') !== formatted) return;

        setDate(parsedDate);
        setMonth(parsedDate);
    };

    const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value.replace(/[^\d]/g, '').slice(0, 4);

        if (input.length >= 2) {
            const hours = input.slice(0, 2);
            const minutes = input.slice(2, 4);
            input = minutes ? `${hours}:${minutes}` : hours;
        }

        setTimeValue(input);
    };

    const handleDateSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        if (selectedDate) {
            setDateValue(formatDate(selectedDate));
            setMonth(selectedDate);
        }
        setOpen(false);
    };

    return (
        <div className={cn('flex flex-col gap-3', className)}>
            {label && (
                <Label htmlFor="date" className="px-1">
                    {label}
                </Label>
            )}

            <div className="flex gap-3">
                <div className="flex-1">
                    <div className="relative flex gap-2">
                        <Input
                            id="date"
                            value={dateValue}
                            placeholder="дд.мм.гггг"
                            className="bg-background pr-10"
                            maxLength={10}
                            inputMode="numeric"
                            onChange={handleDateInputChange}
                            onKeyDown={(e) => {
                                if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setOpen(true);
                                }
                            }}
                        />
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date-picker"
                                    variant="ghost"
                                    className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                                >
                                    <CalendarIcon className="size-3.5" />
                                    <span className="sr-only">Выбрать дату</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="end"
                                alignOffset={-8}
                                sideOffset={10}
                            >
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    month={month}
                                    onMonthChange={setMonth}
                                    onSelect={handleDateSelect}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="w-32">
                    <Input
                        type="text"
                        value={timeValue}
                        onChange={handleTimeInputChange}
                        placeholder="00:00"
                        className="w-full"
                        maxLength={5}
                        inputMode="numeric"
                        onFocus={(e) => {
                            e.currentTarget.select();
                        }}
                        onKeyDown={(e) => {
                            const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                            if (allowedKeys.includes(e.key)) return;
                            if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        onBlur={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            if (value.length >= 1) {
                                const hours = Math.min(23, parseInt(value.slice(0, 2), 10) || 0);
                                const minutes = Math.min(59, parseInt(value.slice(2, 4), 10) || 0);
                                setTimeValue(
                                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
                                );
                            } else {
                                setTimeValue('00:00');
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
