<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Character extends Model
{
  private static $job_mappings = [
    // Tanks
    "gladiator" => [
      "shortform" => "GLA",
      "en" => "Gladiator",
      "jp" => "剣術士",
      "fr" => "Gladiateur",
      "de" => "Gladiator",
    ],
    "paladin" => [
      "shortform" => "PLD",
      "en" => "Paladin",
      "jp" => "ナイト",
      "fr" => "Paladin",
      "de" => "Paladin",
    ],
    "marauder" => [
      "shortform" => "MRD",
      "en" => "Marauder",
      "jp" => "斧術士",
      "fr" => "Maraudeur",
      "de" => "Marodeur",
    ],
    "warrior" => [
      "shortform" => "WAR",
      "en" => "Warrior",
      "jp" => "戦士",
      "fr" => "Guerrier",
      "de" => "Krieger",
    ],
    "gunbreaker" => [
      "shortform" => "GNB",
      "en" => "Gunbreaker",
      "jp" => "ガンブレイカー",
      "fr" => "Pistosabreur",
      "de" => "Revolverklinge",
    ],
    "darkknight" => [
      "shortform" => "DRK",
      "en" => "Dark Knight",
      "jp" => "暗黒騎士",
      "fr" => "Chevalier noir",
      "de" => "Dunkelritter",
    ],

    // Heals
    "conjurer" => [
      "shortform" => "CNJ",
      "en" => "Conjurer",
      "jp" => "幻術士",
      "fr" => "Élémentaliste",
      "de" => "Druide",
    ],
    "whitemage" => [
      "shortform" => "WHM",
      "en" => "White Mage",
      "jp" => "白魔道士",
      "fr" => "Mage blanc",
      "de" => "Weißmagier",
    ],
    "scholar" => [
      "shortform" => "SCH",
      "en" => "Scholar",
      "jp" => "学者",
      "fr" => "Érudit",
      "de" => "Gelehrter",
    ],
    "astrologian" => [
      "shortform" => "AST",
      "en" => "Astrologian",
      "jp" => "占星術師",
      "fr" => "Astromancien",
      "de" => "Astrologe",
    ],
    "sage" => [
      "shortform" => "SGE",
      "en" => "Sage",
      "jp" => "賢者",
      "fr" => "Sage",
      "de" => "Weiser",
    ],

    // DPS
    "pugilist" => [
      "shortform" => "PGL",
      "en" => "Pugilist",
      "jp" => "格闘士",
      "fr" => "Pugiliste",
      "de" => "Faustkämpfer",
    ],
    "monk" => [
      "shortform" => "MNK",
      "en" => "Monk",
      "jp" => "モンク",
      "fr" => "Moine",
      "de" => "Mönch",
    ],
    "lancer" => [
      "shortform" => "LNC",
      "en" => "Lancer",
      "jp" => "槍術士",
      "fr" => "Maître d'hast",
      "de" => "Pikenier",
    ],
    "dragoon" => [
      "shortform" => "DRG",
      "en" => "Dragoon",
      "jp" => "竜騎士",
      "fr" => "Chevalier dragon",
      "de" => "Dragoon",
    ],
    "rogue" => [
      "shortform" => "ROG",
      "en" => "Rogue",
      "jp" => "双剣士",
      "fr" => "Surineur",
      "de" => "Schurke",
    ],
    "ninja" => [
      "shortform" => "NIN",
      "en" => "Ninja",
      "jp" => "忍者",
      "fr" => "Ninja",
      "de" => "Ninja",
    ],
    "samurai" => [
      "shortform" => "SAM",
      "en" => "Samurai",
      "jp" => "侍",
      "fr" => "Samouraï",
      "de" => "Samurai",
    ],
    "reaper" => [
      "shortform" => "RPR",
      "en" => "Reaper",
      "jp" => "リーパー",
      "fr" => "Faucheur",
      "de" => "Schnitter",
    ],

    "archer" => [
      "shortform" => "ARC",
      "en" => "Archer",
      "jp" => "弓術士",
      "fr" => "Archer",
      "de" => "Waldläufer",
    ],
    "bard" => [
      "shortform" => "BRD",
      "en" => "Bard",
      "jp" => "吟遊詩人",
      "fr" => "Barde",
      "de" => "Barde",
    ],
    "machinist" => [
      "shortform" => "MCH",
      "en" => "Machinist",
      "jp" => "機工士",
      "fr" => "Machiniste",
      "de" => "Maschinist",
    ],
    "dancer" => [
      "shortform" => "DNC",
      "en" => "Dancer",
      "jp" => "踊り子",
      "fr" => "Danseur",
      "de" => "Tänzer",
    ],

    "thaumaturge" => [
      "shortform" => "THM",
      "en" => "Thaumaturge",
      "jp" => "呪術士",
      "fr" => "Occultiste",
      "de" => "Thaumaturg",
    ],
    "blackmage" => [
      "shortform" => "BLM",
      "en" => "Black Mage",
      "jp" => "黒魔道士",
      "fr" => "Mage noir",
      "de" => "Schwarzmagier",
    ],

    "arcanist" => [
      "shortform" => "ACN",
      "en" => "Arcanist",
      "jp" => "巴術士",
      "fr" => "Arcaniste",
      "de" => "Hermetiker",
    ],
    "summoner" => [
      "shortform" => "SMN",
      "en" => "Summoner",
      "jp" => "召喚士",
      "fr" => "Invocateur",
      "de" => "Beschwörer",
    ],
    "redmage" => [
      "shortform" => "RDM",
      "en" => "Red Mage",
      "jp" => "赤魔道士",
      "fr" => "Mage rouge",
      "de" => "Rotmagier",
    ],
    "bluemage" => [
      "shortform" => "BLU",
      "en" => "Blue Mage",
      "jp" => "青魔道士",
      "fr" => "Mage bleu",
      "de" => "Blaumagier",
    ],

    // DOL
    "miner" => [
      "shortform" => "MIN",
      "en" => "Miner",
      "jp" => "採掘師",
      "fr" => "Mineur",
      "de" => "Minenarbeiter",
    ],
    "botanist" => [
      "shortform" => "BTN",
      "en" => "Botanist",
      "jp" => "園芸師",
      "fr" => "Botaniste",
      "de" => "Gärtner",
    ],
    "fisher" => [
      "shortform" => "FSH",
      "en" => "Fisher",
      "jp" => "漁師",
      "fr" => "Pêcheur",
      "de" => "Fischer",
    ],

    // DOH
    "carpenter" => [
      "shortform" => "CRP",
      "en" => "Carpenter",
      "jp" => "木工師",
      "fr" => "Menuisier",
      "de" => "Zimmerer",
    ],
    "blacksmith" => [
      "shortform" => "BSM",
      "en" => "Blacksmith",
      "jp" => "鍛冶師",
      "fr" => "Forgeron",
      "de" => "Grobschmied",
    ],
    "armorer" => [
      "shortform" => "ARM",
      "en" => "Armorer",
      "jp" => "甲冑師",
      "fr" => "Armurier",
      "de" => "Plattner",
    ],
    "goldsmith" => [
      "shortform" => "GSM",
      "en" => "Goldsmith",
      "jp" => "彫金師",
      "fr" => "Orfèvre",
      "de" => "Goldschmied",
    ],
    "leatherworker" => [
      "shortform" => "LTW",
      "en" => "Leatherworker",
      "jp" => "革細工師",
      "fr" => "Tanneur",
      "de" => "Gerber",
    ],
    "weaver" => [
      "shortform" => "WVR",
      "en" => "Weaver",
      "jp" => "裁縫師",
      "fr" => "Couturier",
      "de" => "Weber",
    ],
    "alchemist" => [
      "shortform" => "ALC",
      "en" => "Alchemist",
      "jp" => "錬金術師",
      "fr" => "Alchimiste",
      "de" => "Alchemist",
    ],
    "culinarian" => [
      "shortform" => "CUL",
      "en" => "Culinarian",
      "jp" => "調理師",
      "fr" => "Cuisinier",
      "de" => "Gourmet",
    ],
  ];

  public function __construct()
  {
    $this->name = "";
    $this->title = "";
    $this->race = "";
    $this->race_type = "";
    $this->gender = 1;
    $this->level = 0;
    $this->server = "";
    $this->datacenter = "";
    $this->fc = "";
    $this->fc_tag = "";
    $this->job = "";
    $this->minions = 0;
    $this->mounts = 0;
    $this->portrait = "";
    $this->avatar = "";
  }

  public static function get_job_mappings() {
    return self::$job_mappings;
  }
}