export function formatDate(date: Date = new Date()): string {
    return getPhdTimestamp(date);
}

export function getPhdTimestamp(date: Date = new Date()): string {
    return date.toISOString().replace('T', ' ').replace('Z', '');
}
