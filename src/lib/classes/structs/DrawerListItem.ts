/*
 * @author Javier Huang
 */

// item representing a list item in the drawer and the header of the page
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