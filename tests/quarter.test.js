import { getQuarterInfo } from '../src/logic.js';

describe('getQuarterInfo', () => {
    test('correctly calculates Q1 (Jan-Mar)', () => {
        const d = new Date('2025-02-15');
        const info = getQuarterInfo(d);
        expect(info.quarter).toBe(1);
        expect(info.year).toBe(2025);
    });

    test('correctly calculates Q2 (Apr-Jun)', () => {
        const d = new Date('2025-05-10');
        const info = getQuarterInfo(d);
        expect(info.quarter).toBe(2);
    });

    test('correctly calculates Q3 (Jul-Sep)', () => {
        const d = new Date('2025-08-20');
        const info = getQuarterInfo(d);
        expect(info.quarter).toBe(3);
    });

    test('correctly calculates Q4 (Oct-Dec)', () => {
        const d = new Date('2025-11-15');
        const info = getQuarterInfo(d);
        expect(info.quarter).toBe(4);
    });

    test('week number increments correctly', () => {
        const d1 = new Date('2025-01-01');
        const d2 = new Date('2025-01-15');
        const q1 = getQuarterInfo(d1);
        const q2 = getQuarterInfo(d2);
        expect(q2.week).toBeGreaterThanOrEqual(q1.week);
    });

    test('returns correct date format for start and end dates', () => {
        const d = new Date('2025-02-15');
        const info = getQuarterInfo(d);
        expect(info.startDate).toMatch(/^\w{3} \d{1,2}$/); // e.g., "Jan 1"
        expect(info.endDate).toMatch(/^\w{3} \d{1,2}$/); // e.g., "Mar 31"
    });

    test('handles year transitions correctly', () => {
        const d = new Date('2024-12-31');
        const info = getQuarterInfo(d);
        expect(info.quarter).toBe(4);
        expect(info.year).toBe(2024);
    });
});