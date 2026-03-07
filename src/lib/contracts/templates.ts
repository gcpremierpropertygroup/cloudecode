import type { ContractType } from "@/types/booking";

export interface ContractTemplate {
  type: ContractType;
  label: string;
  defaultTitle: string;
  body: string;
}

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    type: "property_management",
    label: "Property Management Agreement",
    defaultTitle: "Property Management Agreement",
    body: `PROPERTY MANAGEMENT AGREEMENT

This Property Management Agreement ("Agreement") is entered into as of {{DATE}} by and between:

Property Owner: {{OWNER_NAME}}
Manager: GC Premier Property Group

PROPERTY ADDRESS: {{PROPERTY_ADDRESS}}

1. APPOINTMENT OF MANAGER

The Owner hereby appoints GC Premier Property Group as the exclusive managing agent for the above-described property. The Manager agrees to manage the property in accordance with the terms and conditions set forth in this Agreement.

2. TERM

This Agreement shall commence on {{START_DATE}} and continue for a period of {{TERM_LENGTH}}, unless terminated earlier in accordance with the provisions herein.

3. MANAGEMENT FEES

The Owner agrees to pay the Manager a management fee of {{FEE_PERCENTAGE}} of gross rental income collected, payable monthly. Additional fees for services beyond standard management shall be agreed upon in writing.

4. MANAGER'S RESPONSIBILITIES

The Manager shall:
- Market the property and screen prospective tenants
- Execute lease agreements on behalf of the Owner
- Collect rents and security deposits
- Coordinate maintenance and repairs
- Provide monthly financial statements
- Handle tenant communications and concerns
- Ensure compliance with local regulations

5. OWNER'S RESPONSIBILITIES

The Owner shall:
- Maintain adequate property insurance
- Provide funds for necessary repairs and maintenance
- Disclose all known property defects
- Comply with all applicable laws and regulations

6. TERMINATION

Either party may terminate this Agreement with {{NOTICE_PERIOD}} written notice. Upon termination, the Manager shall provide a final accounting and transfer all records to the Owner.

7. GOVERNING LAW

This Agreement shall be governed by the laws of the State of {{STATE}}.

By signing below, both parties acknowledge and agree to the terms and conditions set forth in this Agreement.`,
  },
  {
    type: "lease_agreement",
    label: "Short-Term Rental Agreement",
    defaultTitle: "Short-Term Rental Agreement",
    body: `SHORT-TERM RENTAL AGREEMENT

This Short-Term Rental Agreement ("Agreement") is entered into as of {{DATE}} by and between:

Host/Manager: GC Premier Property Group
Guest: {{GUEST_NAME}}

PROPERTY ADDRESS: {{PROPERTY_ADDRESS}}

1. RENTAL PERIOD

Check-in: {{CHECK_IN_DATE}} at {{CHECK_IN_TIME}}
Check-out: {{CHECK_OUT_DATE}} at {{CHECK_OUT_TIME}}
Total Nights: {{TOTAL_NIGHTS}}

2. RENTAL RATE AND FEES

- Nightly Rate: {{NIGHTLY_RATE}}
- Cleaning Fee: {{CLEANING_FEE}}
- Service Fee: {{SERVICE_FEE}}
- Taxes: {{TAX_AMOUNT}}
- Total Due: {{TOTAL_AMOUNT}}
- Payment Schedule: {{PAYMENT_SCHEDULE}}

3. SECURITY DEPOSIT

A security deposit of {{SECURITY_DEPOSIT}} is required prior to check-in. The deposit will be returned within {{RETURN_PERIOD}} after check-out, less any deductions for damages, excessive cleaning, or violation of house rules.

4. CANCELLATION POLICY

{{CANCELLATION_POLICY}}

5. OCCUPANCY

Maximum occupancy is {{MAX_GUESTS}} guests. Only registered guests are permitted to stay overnight. The Guest must provide the names of all occupants: {{GUEST_NAMES}}

No events, parties, or gatherings beyond the registered guest count are permitted without prior written approval.

6. HOUSE RULES

- No smoking inside the property
- No pets unless pre-approved in writing
- Quiet hours: 10:00 PM to 8:00 AM
- No unauthorized guests or visitors overnight
- Keep the property in a clean and orderly condition
- No rearranging or removing furniture
- Report any damage or maintenance issues immediately
- Parking: {{PARKING_INSTRUCTIONS}}
- Trash and recycling must be disposed of properly
- {{ADDITIONAL_RULES}}

7. CHECK-IN AND CHECK-OUT

Check-in instructions, access codes, and property details will be provided prior to arrival. The Guest agrees to return all keys, remotes, and access devices at check-out. Late check-out without prior approval will incur a fee of {{LATE_CHECKOUT_FEE}}.

8. PROPERTY CONDITION AND DAMAGES

The Guest agrees to leave the property in substantially the same condition as found, normal wear excepted. The Guest shall be liable for any damage caused during the rental period beyond normal use. Repair or replacement costs will be deducted from the security deposit, and any excess will be billed directly.

9. LIABILITY AND ASSUMPTION OF RISK

GC Premier Property Group shall not be liable for any personal injury, loss, or damage to personal property occurring on the premises. The Guest assumes all risk associated with the use of the property and its amenities, including but not limited to pools, hot tubs, grills, and outdoor areas.

10. EARLY TERMINATION

If the Guest vacates the property before the scheduled check-out date, no refund will be issued for unused nights unless otherwise agreed in writing.

11. GOVERNING LAW

This Agreement shall be governed by the laws of the State of {{STATE}}.

By signing below, the Guest acknowledges having read and agreed to all terms and conditions of this Short-Term Rental Agreement.`,
  },
  {
    type: "service_contract",
    label: "Service Contract",
    defaultTitle: "Service Contract",
    body: `SERVICE CONTRACT

This Service Contract ("Contract") is entered into as of {{DATE}} by and between:

Service Provider: GC Premier Property Group
Client: {{CLIENT_NAME}}

1. SCOPE OF SERVICES

GC Premier Property Group agrees to provide the following services:

{{SERVICE_DESCRIPTION}}

2. SERVICE LOCATION

Services shall be performed at: {{SERVICE_LOCATION}}

3. TERM

This Contract shall commence on {{START_DATE}} and shall continue until {{END_DATE}}, unless terminated earlier in accordance with this Contract.

4. COMPENSATION

The Client agrees to pay the following:
- Service Fee: {{SERVICE_FEE}}
- Payment Schedule: {{PAYMENT_SCHEDULE}}
- Payment Method: {{PAYMENT_METHOD}}

5. ADDITIONAL COSTS

Any additional costs beyond the agreed scope of services must be approved in writing by the Client before being incurred. The Service Provider will provide estimates for any additional work.

6. WARRANTIES

The Service Provider warrants that all services will be performed in a professional and workmanlike manner. The Service Provider will correct any deficiencies at no additional cost within {{WARRANTY_PERIOD}} of service completion.

7. LIABILITY

The Service Provider shall maintain appropriate insurance coverage. Total liability under this Contract shall not exceed the total compensation paid by the Client.

8. TERMINATION

Either party may terminate this Contract with {{NOTICE_PERIOD}} written notice. In the event of termination, the Client shall pay for all services rendered up to the date of termination.

9. CONFIDENTIALITY

Both parties agree to maintain the confidentiality of any proprietary or sensitive information shared during the course of this Contract.

10. GOVERNING LAW

This Contract shall be governed by the laws of the State of {{STATE}}.

By signing below, both parties acknowledge and agree to the terms and conditions set forth in this Service Contract.`,
  },
];
