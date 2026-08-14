export function logMachineError(machineName: string, operation: string, error: unknown): void {
    console.error(`[${machineName}] ${operation} failed`, error);
}

export function logMachineDataIssue(
    machineName: string,
    operation: string,
    details: Record<string, unknown>,
): void {
    console.warn(`[${machineName}] ${operation} discarded invalid data`, details);
}
