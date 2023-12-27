export class DrawerListItem {
    public text: string;
    public secondaryText: string;
    public route: string;
    public icon: string;

    constructor(text: string, route: string, icon: string, secondaryText: string = '') {
        this.text = text;
        this.secondaryText = secondaryText;
        this.route = route;
        this.icon = icon;
    }
}