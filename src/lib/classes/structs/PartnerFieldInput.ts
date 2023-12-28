export class PartnerFieldInput {
    public key: string;
    public value: string;
    public errorMessage: string;

    constructor(key: string, value: string, errorMessage: string) {
        this.key = key;
        this.value = value;
        this.errorMessage = errorMessage;
    }
}