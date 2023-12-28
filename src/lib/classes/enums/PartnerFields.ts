import { PartnerField } from "../structs/PartnerField";

export const partnerFields = [
    new PartnerField('Name', 'name', 'text', true),
    new PartnerField('Description', 'description', 'text', false),
    new PartnerField('Organization Type', 'organizationType', 'text', true),
    new PartnerField('Resources', 'resources', 'text', false),
    new PartnerField('Email', 'email', 'email', false),
    new PartnerField('Phone', 'phone', 'tel', false),
    new PartnerField('Address', 'address', 'text', false),
    new PartnerField('Website', 'website', 'url', false)
];

export const partnerFieldsBasic = [
    "Name",
    "Description",
    "Organization Type",
    "Resources",
    "Email",
    "Phone",
    "Address",
    "Website"
]