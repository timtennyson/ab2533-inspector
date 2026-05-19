/*
 * PLG-264 (Rev 6/4/25) — Santa Cruz County AB 2533 Substandard Housing Checklist
 * Encoded faithfully to the published form and scoped to HSC § 17920.3.
 *
 * Per-item fields:
 *   id            – form line number
 *   text          – item language (cleaned from the published form)
 *   states        – allowed answers. Sections C/D/E are 2-state; F/G/H add "unconfirmed".
 *   compliantMeans – which answer represents the SAFE condition (handles the
 *                    item-29 inverse-wording quirk so "Compliant" always = safe).
 *   basis         – the HSC 17920.3 subsection (or state housing law cite) this maps to.
 *   safeHarbor    – true if the statute exempts items that were legal when built
 *                    AND have been safely maintained (do NOT over-correct these).
 *   trade         – which contractor owns the corrective scope / sign-off.
 *   recViolation  – recommendation emitted to the design team when marked Violation.
 *   recUnconfirmed– recommendation emitted when marked Unconfirmed (concealed).
 *
 * NOTE: Smoke/CO alarms (C, D) are required RETROACTIVELY by California statute
 * (HSC §§ 13113.8, 17926) — no safe harbor, no grandfathering. The county will
 * enforce these regardless of when the unit was built.
 */
window.AB2533_CHECKLIST = {
  form: "PLG-264",
  rev: "6/4/25",
  trades: ["General", "Structural", "Electrical", "Plumbing", "Mechanical"],
  sections: [
    {
      id: "C", title: "Smoke Alarms", states: ["compliant", "violation"],
      note: "Required retroactively by HSC § 13113.8 — no grandfathering.",
      items: [
        { id: 1, text: "Operational and installed in every sleeping room.",
          basis: "State Housing Law (HSC § 13113.8); ref. 17920.3", safeHarbor: false, trade: "Electrical",
          recViolation: "Provide listed smoke alarms in every sleeping room, interconnected where feasible. Show alarm locations on the floor plan; note hardwired w/ battery backup vs. 10-yr sealed-battery per CRC R314 as built." },
        { id: 2, text: "Installed outside each separate sleeping area in the immediate vicinity (hallways).",
          basis: "State Housing Law (HSC § 13113.8); ref. 17920.3", safeHarbor: false, trade: "Electrical",
          recViolation: "Add smoke alarm in the hallway/area immediately outside each sleeping area. Reflect on floor plan." },
        { id: 3, text: "Installed on every level of the dwelling unit, including basements.",
          basis: "State Housing Law (HSC § 13113.8); ref. 17920.3", safeHarbor: false, trade: "Electrical",
          recViolation: "Add a smoke alarm on each level including basements/habitable attics. Reflect on plans." },
        { id: 4, text: "Installed not less than 3 feet horizontally from the door or opening of a bathroom containing a bathtub or shower.",
          basis: "State Housing Law; ref. 17920.3", safeHarbor: false, trade: "Electrical",
          recViolation: "Relocate alarm(s) to ≥3 ft horizontally from bath/shower bathroom openings to prevent nuisance trips. Note clearance on plan." },
        { id: 5, text: "Installed in the hallway and in the room open to the hallway where the ceiling of a room open to a hallway serving bedrooms exceeds the hallway ceiling by 24 inches or more.",
          basis: "State Housing Law; ref. 17920.3", safeHarbor: false, trade: "Electrical",
          recViolation: "Add alarm in both the hallway and the open room where the ceiling-height differential ≥24 in. Note condition on plan." }
      ]
    },
    {
      id: "D", title: "Carbon Monoxide Alarms", states: ["compliant", "violation"],
      note: "Required retroactively by HSC § 17926 — no grandfathering.",
      items: [
        { id: 6, text: "Operational and installed outside each separate sleeping area in the immediate vicinity of bedrooms, on every occupiable level including basements, and in bedrooms with fireplaces.",
          basis: "State Housing Law (HSC § 17926); ref. 17920.3", safeHarbor: false, trade: "Electrical",
          recViolation: "Provide listed CO alarms outside each sleeping area, on every occupiable level, and in bedrooms with fireplaces. Show locations on floor plan." },
        { id: 7, text: "If an attached garage opens into the dwelling, or a fuel-fired appliance or fireplace is present, alarms installed at each level of the dwelling.",
          basis: "State Housing Law (HSC § 17926); ref. 17920.3", safeHarbor: false, trade: "Electrical",
          recViolation: "Confirm fuel-fired appliance / attached-garage condition; provide CO alarms at each level. Note triggering condition on plan." }
      ]
    },
    {
      id: "E", title: "Emergency Escape and Rescue Openings — Sleeping Rooms", states: ["compliant", "violation"],
      items: [
        { id: 8, text: "Emergency escape / rescue openings are provided in every sleeping room.",
          basis: "HSC 17920.3(l) — exit facilities", safeHarbor: true, trade: "General",
          recViolation: "Provide a compliant emergency escape and rescue opening in each sleeping room (or remove the room's sleeping designation on the plans); show the egress opening on the floor plan and elevations with sill height.",
          recUnconfirmed: "Operability/size of egress opening could not be confirmed — verify in field; if non-conforming, address per the violation recommendation." },
        { id: 9, text: "Egress window has a minimum clear opening width of 20 in. and clear opening height of 24 in.",
          basis: "HSC 17920.3(l) — exit facilities", safeHarbor: true, trade: "General",
          recViolation: "Provide egress opening meeting min. clear width 20 in / clear height 24 in (and net clear area / sill height per the era it was built or current CRC R310 if altered). Dimension the opening on plans.",
          recUnconfirmed: "Clear-opening dimensions not verified — measure in field; if deficient, address per the violation recommendation." }
      ]
    },
    {
      id: "F", title: "Sanitation", states: ["compliant", "violation", "unconfirmed"],
      basis: "HSC 17920.3(a) — inadequate sanitation",
      items: [
        { id: 10, text: "Proper water closet, lavatory, and bathtub or shower in the dwelling unit.", trade: "Plumbing", safeHarbor: false,
          recViolation: "Provide/repair water closet, lavatory, and bathtub or shower so each is functional and properly connected. Show fixtures on floor plan + plumbing notes.",
          recUnconfirmed: "Fixture concealment/condition unverified — confirm operation; correct if non-functional." },
        { id: 11, text: "Proper kitchen sink.", trade: "Plumbing", safeHarbor: false,
          recViolation: "Provide a functional kitchen sink with proper supply/waste. Show on plan.",
          recUnconfirmed: "Verify kitchen sink supply/waste; correct if deficient." },
        { id: 12, text: "Hot and cold running water to plumbing fixtures.", trade: "Plumbing", safeHarbor: false,
          recViolation: "Provide hot and cold running water to all fixtures (water heater capacity/connection as needed). Note water heater + distribution on plans.",
          recUnconfirmed: "Confirm hot/cold delivery at all fixtures; correct deficiencies." },
        { id: 13, text: "Adequate heating.", trade: "Mechanical", safeHarbor: false,
          recViolation: "Provide a permanent heating source capable of maintaining habitable rooms at the required minimum temperature. Show heating equipment on mechanical plan.",
          recUnconfirmed: "Verify heating capacity/operation; correct if inadequate." },
        { id: 14, text: "Proper operation of required ventilating equipment.", trade: "Mechanical", safeHarbor: false,
          recViolation: "Repair/provide required ventilation (bath/kitchen exhaust ducted to exterior). Show on mechanical plan.",
          recUnconfirmed: "Confirm ventilation equipment operates and ducts to exterior; correct if not." },
        { id: 15, text: "Minimum 8% natural light and 4% ventilation provided based on existing habitable floor area.", trade: "General", safeHarbor: false,
          recViolation: "Provide glazing ≥8% of floor area and openable ventilation ≥4% per habitable room (or compliant mechanical ventilation and artificial light); tabulate the areas per room on the plans.",
          recUnconfirmed: "Window/vent areas not yet tabulated — calculate per room; address shortfalls." },
        { id: 16, text: "Habitable room floor areas ≥70 sq ft and ≥7 ft in any horizontal dimension, except kitchens.", trade: "General", safeHarbor: false,
          recViolation: "Reconfigure or re-designate undersized rooms so each habitable room is ≥70 sq ft and ≥7 ft min dimension. Dimension rooms on plans.",
          recUnconfirmed: "Verify room dimensions on as-builts; address any undersized habitable room." },
        { id: 17, text: "Required electrical lighting is provided.", trade: "Electrical", safeHarbor: false,
          recViolation: "Provide required lighting outlets/fixtures in habitable rooms, kitchen, bath, and at exterior egress. Show on electrical plan.",
          recUnconfirmed: "Confirm lighting outlets present and functional; correct gaps." },
        { id: 18, text: "Habitable rooms have no signs of dampness.", trade: "General", safeHarbor: false,
          recViolation: "Identify and correct the moisture source (grading, drainage, vapor barrier, leaks); remediate damaged finishes. Describe remediation scope in plan notes.",
          recUnconfirmed: "Source of suspected dampness not confirmed — investigate; remediate if present." },
        { id: 19, text: "No infestation of insects, vermin, or rodents.", trade: "General", safeHarbor: false,
          recViolation: "Abate infestation and seal points of entry. Note exclusion/abatement scope.",
          recUnconfirmed: "Confirm presence/absence of infestation; abate if found." },
        { id: 20, text: "No visible mold growth (excluding minor mold on surfaces that accumulate moisture as part of intended use).", trade: "General", safeHarbor: false,
          recViolation: "Remediate visible mold and correct the moisture source per industry guidance. Document scope; note clearance.",
          recUnconfirmed: "Inspect concealed cavities if mold suspected; remediate if confirmed." },
        { id: 21, text: "No general dilapidation or improper maintenance of the unit.", trade: "General", safeHarbor: false,
          recViolation: "Repair the specific dilapidated conditions noted so the unit is restored to a sound, maintained state. List items + scope on plans.",
          recUnconfirmed: "Assess extent of disrepair; scope repairs accordingly." },
        { id: 22, text: "Connection to required sewage disposal system is present.", trade: "Plumbing", safeHarbor: false,
          recViolation: "Provide proper connection to public sewer or approved OWTS. If septic, Environmental Health approval required (county Step 1/eligibility). Show connection on site plan.",
          recUnconfirmed: "Verify sanitary connection (sewer vs. septic) and EH status; correct/obtain approval." },
        { id: 23, text: "Proper garbage and rubbish storage and removal facilities are present.", trade: "General", safeHarbor: false,
          recViolation: "Provide adequate refuse storage/removal. Note provision on plans.",
          recUnconfirmed: "Confirm refuse facilities; provide if absent." }
      ]
    },
    {
      id: "G", title: "Structural Hazards", states: ["compliant", "violation", "unconfirmed"],
      basis: "HSC 17920.3(b) — structural hazards",
      note: "Item 29 is worded inversely on the form; the app normalizes so Compliant = no defective horizontal members.",
      items: [
        { id: 24, text: "Adequate foundations are provided (may require exposing an area to verify).", trade: "Structural", safeHarbor: false,
          recViolation: "Engineer to specify foundation repair/replacement or retrofit. Provide structural plans + calcs; show foundation detail.",
          recUnconfirmed: "Foundation concealed — expose a representative area or provide engineer evaluation before plan submittal." },
        { id: 25, text: "Adequate flooring or floor supports are provided.", trade: "Structural", safeHarbor: false,
          recViolation: "Repair/replace deficient floor framing per engineered design. Show framing plan + details.",
          recUnconfirmed: "Inspect under-floor framing; engineer evaluation if access limited." },
        { id: 26, text: "Flooring/floor supports of sufficient size to carry imposed loads with safety.", trade: "Structural", safeHarbor: false,
          recViolation: "Engineer to verify member sizing; provide reinforcement design + calcs on structural plans.",
          recUnconfirmed: "Member sizes unverified — confirm spans/sizes; engineer if undersized." },
        { id: 27, text: "No present vertical-support members (walls/partitions) that split, lean, list, or buckle from defective material or deterioration.", trade: "Structural", safeHarbor: false,
          recViolation: "Correct/replace distressed vertical supports per engineered repair. Show on structural plans.",
          recUnconfirmed: "Open finishes where distress suspected; engineer evaluation." },
        { id: 28, text: "No apparent vertical-support members of insufficient size to carry imposed loads with safety.", trade: "Structural", safeHarbor: false,
          recViolation: "Engineer to size/reinforce vertical supports; provide calcs + details.",
          recUnconfirmed: "Verify support sizing; engineer if undersized." },
        { id: 29, text: "No ceiling/roof or other horizontal members that sag, split, or buckle from defective material or deterioration.",
          trade: "Structural", safeHarbor: false, compliantMeans: "compliant",
          formQuirk: "Form text reads 'There ARE present...' — answer per the SAFE condition (no distressed members = Compliant).",
          recViolation: "Repair/replace distressed horizontal framing per engineered design. Show on structural plans + details.",
          recUnconfirmed: "Inspect attic/ceiling framing; engineer evaluation if concealed." },
        { id: 30, text: "No apparent ceiling/roof or horizontal members of insufficient size to carry imposed loads with safety.", trade: "Structural", safeHarbor: false,
          recViolation: "Engineer to verify/reinforce horizontal member sizing; provide calcs.",
          recUnconfirmed: "Confirm member sizes/spans; engineer if undersized." },
        { id: 31, text: "No fireplaces or chimneys that list, bulge, or settle from defective material or deterioration.", trade: "Structural", safeHarbor: false,
          recViolation: "Repair/rebuild or remove distressed fireplace/chimney per engineered design. Show detail on plans.",
          recUnconfirmed: "Inspect chimney/flue; engineer evaluation if condition unclear." },
        { id: 32, text: "No fireplaces or chimneys of insufficient size or strength to carry imposed loads with safety.", trade: "Structural", safeHarbor: false,
          recViolation: "Engineer to evaluate fireplace/chimney capacity; provide reinforcement or removal design.",
          recUnconfirmed: "Verify chimney structural adequacy; engineer if questionable." }
      ]
    },
    {
      id: "H", title: "Any Nuisance and the Following", states: ["compliant", "violation", "unconfirmed"],
      basis: "HSC 17920.3(c)–(o)",
      items: [
        { id: 33, text: "All wiring — except wiring that conformed with the laws in effect when installed and is currently in good and safe condition and working properly.",
          basis: "HSC 17920.3(d) — wiring", safeHarbor: true, trade: "Electrical",
          recViolation: "Correct the identified unsafe or hazardous wiring conditions; show the corrective scope on the electrical plan.",
          recUnconfirmed: "Wiring concealed — field-verify, then correct any confirmed unsafe conditions and show the scope on the electrical plan." },
        { id: 34, text: "All plumbing — except plumbing that conformed when installed (or didn't but is now safe), maintained, and free of cross-connections and siphonage.",
          basis: "HSC 17920.3(e) — plumbing", safeHarbor: true, trade: "Plumbing",
          recViolation: "Correct the identified unsafe plumbing, cross-connections, and siphonage; show the corrective scope on the plumbing plan.",
          recUnconfirmed: "Plumbing concealed — field-verify, then correct any confirmed unsafe conditions or cross-connections and show the scope on the plumbing plan." },
        { id: 35, text: "All mechanical equipment incl. vents — except equipment that conformed when installed (or didn't but is now safe) and maintained.",
          basis: "HSC 17920.3(f) — mechanical", safeHarbor: true, trade: "Mechanical",
          recViolation: "Correct the identified unsafe mechanical equipment and venting conditions (combustion air, flue, clearances); show the corrective scope on the mechanical plan.",
          recUnconfirmed: "Equipment/venting not fully verified — field-verify flue and combustion-air, then correct any confirmed unsafe conditions and show the scope on the mechanical plan." },
        { id: 36, text: "No faulty weather protection: deteriorated plaster; ineffective waterproofing of walls/roofs/foundations/floors (incl. broken windows/doors); defective/lacking exterior covering protection; broken, rotted, split, or buckled exterior wall/roof coverings.",
          basis: "HSC 17920.3(g) — weather protection", safeHarbor: false, trade: "General",
          recViolation: "Restore weather-tight envelope: repair/replace defective siding, roofing, waterproofing, broken windows/doors, and protective coatings. Describe scope + materials on plans/elevations.",
          recUnconfirmed: "Inspect suspect envelope areas; scope repairs to confirmed deficiencies." },
        { id: 37, text: "No condition (building, equipment, combustible waste, or vegetation) that, in the inspector's opinion, could cause fire/explosion or provide ready fuel.",
          basis: "HSC 17920.3(h) — fire/explosion hazard", safeHarbor: false, trade: "General",
          recViolation: "Abate the identified fire/explosion hazard or fuel source. Document corrective scope; coordinate with fire authority if directed.",
          recUnconfirmed: "Assess suspected hazard; abate if confirmed." },
        { id: 38, text: "All materials of construction — except those specifically allowed/approved by code and adequately maintained in good and safe condition.",
          basis: "HSC 17920.3(i) — materials", safeHarbor: true, trade: "General",
          recViolation: "Replace the identified unapproved or unsafe materials with approved assemblies; identify the specific materials and replacement detail on the plans.",
          recUnconfirmed: "Identify questionable materials in the field; replace any confirmed unapproved or unsafe materials and show the detail on the plans." },
        { id: 39, text: "No accumulation of weeds, vegetation, junk, dead organic matter, debris, garbage, rodent harborage, stagnant water, or combustibles constituting fire/health/safety hazards.",
          basis: "HSC 17920.3(j) — hazardous premises", safeHarbor: false, trade: "General",
          recViolation: "Clear and dispose of the hazardous accumulation; eliminate standing water/harborage. Note as site clean-up condition (typically pre-inspection, not a plan item).",
          recUnconfirmed: "Confirm extent of accumulation; clear as needed." },
        { id: 40, text: "Not an unsafe building due to inadequate maintenance, per the latest edition of the California Building Code.",
          basis: "HSC 17920.3(k) — inadequate maintenance (refs CBC)", safeHarbor: true, trade: "General",
          recViolation: "Correct the identified maintenance-related unsafe conditions; describe the corrective scope on the plans.",
          recUnconfirmed: "Evaluate the maintenance condition in the field; correct any confirmed unsafe items and describe the scope on the plans." },
        { id: 41, text: "Adequate exit facilities — except those that conformed with the laws when constructed and have been adequately maintained and increased with any added occupant load/alteration/occupancy change.",
          basis: "HSC 17920.3(l) — exits (refs CBC)", safeHarbor: true, trade: "General",
          recViolation: "Provide adequate exit facilities; show the exit configuration and any added exits on the plans.",
          recUnconfirmed: "Verify the exit configuration in the field; address any deficiencies and show the exit configuration on the plans." },
        { id: 42, text: "Provided with fire-resistive construction / fire-extinguishing systems required by code — except those that conformed when constructed and have been maintained/improved with any load/alteration/occupancy change.",
          basis: "HSC 17920.3(m) — fire-resistive (refs CBC)", safeHarbor: true, trade: "General",
          recViolation: "Address the identified fire-resistive construction or fire-extinguishing deficiency; show the required rated assemblies or equipment on the plans.",
          recUnconfirmed: "Confirm the rated-assembly condition in the field; address any deficiencies and show the required assemblies on the plans." },
        { id: 43, text: "Possible inadequate structural resistance to horizontal forces.",
          basis: "HSC 17920.3(o) — lateral resistance", safeHarbor: false, trade: "Structural",
          recViolation: "Engineer to evaluate lateral system and design retrofit if deficient. Provide lateral calcs + details on structural plans.",
          recUnconfirmed: "Lateral system not verified — engineer evaluation recommended before plan submittal." }
      ]
    }
  ],
  // Section I: up to 3 field-added safety items (44–46), authored by the inspector.
  fieldItems: [44, 45, 46]
};
