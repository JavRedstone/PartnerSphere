/*
 * @author Javier Huang
 */

// fields for the partner forms
export class PartnerField {
    public name: string;
    public key: string;
    public type: string;
    public required: boolean = false;

    constructor(name: string, key: string, type: string, required: boolean) {
        this.name = name;
        this.key = key;
        this.type = type;
        this.required = required;
    }
}