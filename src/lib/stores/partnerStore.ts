/*
 * @author Javier Huang
 */

import { writable } from "svelte/store";

// store for partners so that many components can access it
export const partners = writable([]);
// store for the 3d locations on the sphere
export const partnerNameElements = writable([]);