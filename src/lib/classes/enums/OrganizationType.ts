export class OrganizationType {
    public static readonly NONPROFIT = 'Nonprofit';
    public static readonly FORPROFIT = 'For-profit';
    public static readonly GOVERNMENT = 'Government';
    public static readonly EDUCATIONAL = 'Educational';
    public static readonly RELIGIOUS = 'Religious';
    public static readonly INDIVIDUAL = 'Individual';
}

export const organizationTypes = [
    OrganizationType.NONPROFIT,
    OrganizationType.FORPROFIT,
    OrganizationType.GOVERNMENT,
    OrganizationType.EDUCATIONAL,
    OrganizationType.RELIGIOUS,
    OrganizationType.INDIVIDUAL
];