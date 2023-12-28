import type { Vector3 } from "three";
import type { Partner } from "./Partner";

export class PartnerNameElem {
    public position: Vector3;
    public element: HTMLElement;
    public partner: Partner;

    constructor(position: Vector3, element: HTMLElement, partner: Partner) {
        this.position = position;
        this.element = element;
        this.partner = partner;
    }
}