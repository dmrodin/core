'use client';

import React, { useEffect, useRef, useState } from 'react';

import { HexColorPicker } from 'react-colorful';

type ColorFieldProps = {
    name: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
};

function oklchToHex(oklch: string): string {
    try {
        const temp = document.createElement('div');
        temp.style.color = oklch;
        document.body.appendChild(temp);
        const computed = window.getComputedStyle(temp).color;
        document.body.removeChild(temp);

        const match = computed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
        }
    } catch (e) {
        console.error('Error converting OKLCH to HEX:', e);
    }
    return '#000000';
}

export function ColorField({ label, value, onChange }: ColorFieldProps) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePickerChange = (hexColor: string) => {
        onChange(hexColor);
    };

    const isHexColor = value.startsWith('#');
    const displayColor = isHexColor ? value : oklchToHex(value);

    return (
        <div
            ref={wrapperRef}
            className="relative w-full lg:w-[240px] h-[38px] border rounded-md flex items-center justify-between px-3 cursor-pointer"
            onClick={() => setOpen((prev) => !prev)}
        >
            <span className="select-none text-sm">{label}</span>
            <div
                className="w-5 h-5 border rounded-sm"
                style={{ backgroundColor: value }}
                title="Открыть палитру цветов"
            ></div>

            {open && (
                <div className="absolute top-full left-1/2 mt-2" style={{ transform: 'translateX(-50%)', zIndex: 50 }}>
                    <HexColorPicker
                        className="border-4 border-primary rounded-[12]"
                        color={displayColor}
                        onChange={handlePickerChange}
                    />
                </div>
            )}
        </div>
    );
}
