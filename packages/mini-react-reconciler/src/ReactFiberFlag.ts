export type Flags = number;

export const NoFlags = /*                   */ 0b00000000;
export const Placement = /*                 */ 0b00000001;
export const Update = /*                    */ 0b00000010;
export const PlacementAndUpdate = /*        */ Placement | Update;
export const Deletion = /*                  */ 0b00000100;
export const ChildDeletion = /*             */ 0b00001000;
export const Passive = /*                   */ 0b00010000;
export const LayoutEffect = /*              */ 0b00100000;


export const Mutation = Placement | Update | ChildDeletion;
export const PassiveMask = Passive | ChildDeletion;