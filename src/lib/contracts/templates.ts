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
    label: "Lease Agreement",
    defaultTitle: "Residential Lease Agreement",
    body: `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement ("Lease") is entered into as of {{DATE}} by and between:

Landlord: GC Premier Property Group
Tenant: {{TENANT_NAME}}

PROPERTY ADDRESS: {{PROPERTY_ADDRESS}}

1. LEASE TERM

The lease term shall begin on {{START_DATE}} and end on {{END_DATE}}. This is a {{LEASE_TYPE}} lease.

2. RENT

Monthly rent shall be {{MONTHLY_RENT}}, due on the {{DUE_DAY}} of each month. Late payments will incur a fee of {{LATE_FEE}} after a {{GRACE_PERIOD}} grace period.

3. SECURITY DEPOSIT

A security deposit of {{SECURITY_DEPOSIT}} is required prior to move-in. The deposit will be returned within {{RETURN_PERIOD}} after lease termination, less any deductions for damages or unpaid rent.

4. UTILITIES

The following utilities are included in the rent: {{INCLUDED_UTILITIES}}
The Tenant is responsible for: {{TENANT_UTILITIES}}

5. OCCUPANCY

The premises shall be occupied solely by the named Tenant(s) and the following authorized occupants: {{OCCUPANTS}}. Maximum occupancy shall not exceed {{MAX_OCCUPANTS}} persons.

6. MAINTENANCE AND REPAIRS

The Tenant shall maintain the premises in clean and good condition. The Tenant shall promptly notify the Landlord of any needed repairs. The Landlord shall be responsible for structural repairs and major systems maintenance.

7. RULES AND REGULATIONS

- No smoking on the premises
- Pets: {{PET_POLICY}}
- Quiet hours: {{QUIET_HOURS}}
- Parking: {{PARKING_RULES}}
- No alterations without written consent

8. TERMINATION

Either party must provide {{NOTICE_PERIOD}} written notice prior to lease termination. Early termination by the Tenant may result in forfeiture of the security deposit and liability for remaining rent.

9. GOVERNING LAW

This Lease shall be governed by the laws of the State of {{STATE}}.

By signing below, the Tenant acknowledges having read and agreed to all terms and conditions of this Lease Agreement.`,
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
