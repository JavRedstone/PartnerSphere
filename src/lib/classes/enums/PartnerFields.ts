/*
 * @author Javier Huang
 */

import { PartnerField } from "../structs/PartnerField";

// fields of Partner object with their display names, html input types, and whether they are required
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

// fields of Partner object with their display names
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