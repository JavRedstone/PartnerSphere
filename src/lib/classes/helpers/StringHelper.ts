export class StringHelper {
    public static generateRandomId(): string {
        return Math.random().toString(36).substring(2, 9);
    }
}