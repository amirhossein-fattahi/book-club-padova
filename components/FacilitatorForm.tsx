import RegistrationForm from './RegistrationForm';

export default function FacilitatorForm({ registrationOpen = true, contactEmail }: {
  registrationOpen?: boolean;
  contactEmail?: string | null;
}) {
  return <RegistrationForm kind="facilitator" registrationOpen={registrationOpen} contactEmail={contactEmail} />;
}
