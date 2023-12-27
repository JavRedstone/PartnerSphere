import type { OrganizationType } from "../enums/OrganizationType";

export class Partner {
    public name: string;
    public description: string;
    public organizationType: OrganizationType;
    public resources: string;
    public email: string;
    public phone: string;
    public address: string;
    public website: string;

    public constructor(
        name: string,
        description: string,
        organizationType: OrganizationType,
        resources: string,
        email: string,
        phone: string,
        address: string,
        website: string
    ) {
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