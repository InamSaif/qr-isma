(() => {
const data = {
CERTIFICATE_NUMBER: "PTS220925322532",
VESSEL_NAME: "HAMDAN AB",
VESSEL_NAME_AR: "حمدان",
VESSEL_NATIONALITY: "PANAMA",
VESSEL_NATIONALITY_AR: "بنما",
FLAG: "PANAMA",
FLAG_AR: "بنما",
VESSEL_AGENT_NAME: "Arabian Sea Petroleum",
VESSEL_AGENT_NAME_AR: "بحر العرب للبترول",
PORT_OF_DEPARTURE: "Shinas Port",
PORT_OF_DEPARTURE_AR: "ميناء شناص",
NEXT_PORT_OF_CALL: "Ajman",
NEXT_PORT_OF_CALL_AR: "عجمان",
VOYAGE_NUMBER: "25831",
CAPTAIN_NAME: "Muhammad Asif",
CAPTAIN_NAME_AR: "محمد اصيف",
ETD: "22/09/2025 13:00",
IMO_NUMBER: "9331103",
ISSUANCE_DATE: "22/09/2025 01:30",
CUSTOMS_REMARKS: "This ship has carried out a food supply operation at sea."
};

const crewMembers = [
{
nameAr: "محمد اصف",
positionEn: "Captain",
positionAr: "قبطان",
nationalityEn: "PAKISTAN",
nationalityAr: "باكستان",
dateOfBirth: "03/10/1955",
travelDocRef: "AS3174333",
dateOfIssue: "15/09/2021",
dateOfExpiry: "14/09/2026",
seamanBook: "AS3174333"
},
{
nameAr: "أحمد علي",
positionEn: "Chief Officer",
positionAr: "الضابط الأول",
nationalityEn: "OMAN",
nationalityAr: "عمان",
dateOfBirth: "12/05/1988",
travelDocRef: "OM998877",
dateOfIssue: "10/01/2022",
dateOfExpiry: "09/01/2027",
seamanBook: "SB998877"
}
];

const trigger = (el) => {
el.dispatchEvent(new Event("input", { bubbles: true }));
el.dispatchEvent(new Event("change", { bubbles: true }));
};

const setValueById = (id, value) => {
const el = document.getElementById(id);
if (!el) {
console.warn("Field not found:", id);
return;
}
el.value = value;
trigger(el);
};

if (typeof window.showCreateForm === "function") {
window.showCreateForm();
}

Object.entries(data).forEach(([id, value]) => setValueById(id, value));

const crewContainer = document.getElementById("crewMembersContainer");
if (crewContainer) {
crewContainer.querySelectorAll(".crew-member").forEach((n) => n.remove());
}

crewMembers.forEach((member) => {
if (typeof window.addCrewMember === "function") {
window.addCrewMember();
} else {
console.warn("addCrewMember() not found");
return;
}const blocks = document.querySelectorAll(".crew-member");
const block = blocks[blocks.length - 1];
if (!block) return;

const map = {
  ".crew-nameAr": member.nameAr,
  ".crew-positionEn": member.positionEn,
  ".crew-positionAr": member.positionAr,
  ".crew-nationalityEn": member.nationalityEn,
  ".crew-nationalityAr": member.nationalityAr,
  ".crew-dateOfBirth": member.dateOfBirth,
  ".crew-travelDocRef": member.travelDocRef,
  ".crew-dateOfIssue": member.dateOfIssue,
  ".crew-dateOfExpiry": member.dateOfExpiry,
  ".crew-seamanBook": member.seamanBook
};

Object.entries(map).forEach(([selector, value]) => {
  const el = block.querySelector(selector);
  if (el) {
    el.value = value || "";
    trigger(el);
  }
});});

console.log("Form filled successfully. Review and click Create Document.");
})();