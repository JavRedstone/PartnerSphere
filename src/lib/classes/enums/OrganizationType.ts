/*
 * @author Javier Huang
 */

// types of organization

export class OrganizationType {
    public static readonly NONPROFIT = 'Nonprofit';
    public static readonly FORPROFIT = 'For-profit';
    public static readonly GOVERNMENT = 'Government';
    public static readonly EDUCATIONAL = 'Educational';
    public static readonly RELIGIOUS = 'Religious';
    public static readonly INDIVIDUAL = 'Individual';
}

// list of organization types
export const organizationTypes = [
    OrganizationType.NONPROFIT,
    OrganizationType.FORPROFIT,
    OrganizationType.GOVERNMENT,
    OrganizationType.EDUCATIONAL,
    OrganizationType.RELIGIOUS,
    OrganizationType.INDIVIDUAL
];