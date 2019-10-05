import { posix } from "path";
import { type } from "os";

const nameof = <T>(name: keyof T) => name;

///

type WeaponEquipmentSlot = "MainHand"

type EquipmentSlot =
    "Head" |
    "Cape" | "Amulet" | "Quiver" |
    WeaponEquipmentSlot | "Body" | "OffHand" |
    "Legs" |
    "Bracelet" | "Boots" | "Ring"

type EquipmentItem = {
    Id: number;
    AttackBonus: CombatBonus;
    DefenceBonus: CombatBonus;
    OtherBonus: OtherBonus;
}

type WeaponEquipmentItem =
    EquipmentItem &
    {
        attackStyles: AttackStyle[]
        activeAttackStyle: AttackStyle;
        attackIntervalInTicks: number;
    }

type AttackStyle =
    "Stab" | "Slash" | "Crush" |
    "Magic" |
    "Range";

type CombatBonus = {
    [P in AttackStyle]: number
}

type OtherBonus = {
    MeleeStrength: number;
    RangedStrength: number;
    MagicDamage: number;
    Prayer: number;
}

type Immunities = {
    poison: boolean;
    venom: boolean;
}

type Equipment =
    { [P in EquipmentSlot]: EquipmentItem } &
    { [P in WeaponEquipmentSlot]: WeaponEquipmentItem } &
    Map<EquipmentSlot, EquipmentItem> &
    Map<WeaponEquipmentSlot, WeaponEquipmentItem>

type CombatStat =
    "ATTACK" | "STRENGTH" | "DEFENCE" |
    "RANGED" | "MAGIC"

type NonCombatStat =
    "HITPOINTS" | "PRAYER"

type CombatStats = {
    [P in CombatStat]: number
}

type PlayerStats = {
    [P in NonCombatStat]: number
} & CombatStats

type PrayerEffect = {
    multiplier: number;
}

type PotionEffect = {
    percentageBoost: number;
    discreteBoost: number;
}

let effectiveLevel = function (skillLevel: number, potionEffect: PotionEffect, prayerEffect: PrayerEffect, attackStyleBonus: number) {
    return Math.floor(
        (Math.floor(skillLevel * potionEffect.percentageBoost) + potionEffect.discreteBoost)
        * prayerEffect.multiplier
    ) + attackStyleBonus + 8;
}

let equipmentAttackBonus = function (equipment: Equipment, attackStyle: AttackStyle) {
    return [...equipment.values()]
        .map(x => x.AttackBonus[attackStyle])
        .reduce((a, b) => a + b);
}

let equipmentDefenceBonus = function (equipment: Equipment, attackStyle: AttackStyle) {
    return [...equipment.values()]
        .map(x => x.DefenceBonus[attackStyle])
        .reduce((a, b) => a + b);
}

let maxHit = function (effectiveLevel: number, equipment: Equipment, attackStyle: AttackStyle) {
    return 0.5 + effectiveLevel * (equipmentAttackBonus(equipment, attackStyle) + 64) / 640;
}

let maxAttackRoll = function (effectiveLevel: number, equipment: Equipment, attackStyle: AttackStyle) {
    return effectiveLevel * (equipmentAttackBonus(equipment, attackStyle) + 64)
}

let maxDefenceRoll = function (effectiveLevel: number, equipment: Equipment, attackStyle: AttackStyle) {
    return effectiveLevel * (equipmentDefenceBonus(equipment, attackStyle) + 64)
}

let hitChance = function (maxAttackRoll: number, maxDefenceRoll: number) {
    if (maxAttackRoll > maxDefenceRoll) {
        return 1 - (maxDefenceRoll + 2) / (2 * (maxAttackRoll + 1))
    } else {
        return maxAttackRoll / (2 * maxDefenceRoll + 1)
    }
}

let dps = function (hitChance: number, maxHit: number, attackInterval: number) {
    return hitChance * (maxHit / 2) / attackInterval
}

console.log()