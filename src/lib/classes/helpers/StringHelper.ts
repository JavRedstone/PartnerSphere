/*
 * @author Javier Huang
 */

// helper class for string related methods
export class StringHelper {
    // generate id's for firebase insertion
    public static generateRandomId(): string {
        return Math.random().toString(36).substring(2, 9);
    }
}