import { IClient } from "../modules/client/client.interface";
import { IFreelancer } from "../modules/freelancer/freelancer.interface";

export const checkClientProfileComplete = (client: IClient): boolean => {
  if (
    client.bio &&
    client.location &&
    client.designation &&
    client.companySize &&
    client.budgetPreference
  ) {
    return true;
  }
  return false;
};

export const checkFreelancerProfileComplete = (
  freelancer: IFreelancer
): boolean => {
  if (
    freelancer.bio &&
    freelancer.skills &&
    freelancer.skills.length > 0 &&
    freelancer.hourlyRate &&
    freelancer.designation &&
    freelancer.experience &&
    freelancer.languages &&
    freelancer.languages.length > 0 &&
    freelancer.location &&
    (freelancer.portfolio ||
      freelancer.linkedinLink ||
      freelancer.otherWebsiteLink)
  ) {
    return true;
  }
  return false;
};
