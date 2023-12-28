import type { OrganizationType } from "../enums/OrganizationType";
import { StringHelper } from "../helpers/StringHelper";

export class Partner {
    public id: string;
    public uid: string;
    public name: string;
    public description: string;
    public organizationType: string;
    public resources: string;
    public email: string;
    public phone: string;
    public address: string;
    public website: string;

    public constructor(
        uid: string,
        name: string,
        description: string,
        organizationType: string,
        resources: string,
        email: string,
        phone: string,
        address: string,
        website: string
    ) {
        this.id = StringHelper.generateRandomId();
        this.uid = uid;
        this.name = name;
        this.description = description;
        this.organizationType = organizationType;
        this.resources = resources;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.website = website;
    }
}