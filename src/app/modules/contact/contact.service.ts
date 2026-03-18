import config from "src/config/index.js";
import { emailHelper } from "src/helpers.ts/emailHelper.js";
import { emailTemplate } from "../../shared/emailTemplate.js";
import { IContact, IWorkshopContact } from "./contact.interface.js";

const sendContactEmail = async (payload: IContact) => {
  const emailData = emailTemplate.contactAdmin(payload);
  
  // Send email to admin
  await emailHelper.sendEmail({
    to: config.email.user as string, // Assuming config.email.user is the admin email
    subject: emailData.subject,
    html: emailData.html,
  });

  return {
    message: "Contact email sent successfully",
  };
};

const sendWorkshopContactEmail = async (payload: IWorkshopContact) => {
  const emailData = emailTemplate.workshopContactAdmin(payload);

  await emailHelper.sendEmail({
    to: config.email.user as string,
    subject: emailData.subject,
    html: emailData.html,
  });

  return {
    message: "Workshop contact email sent successfully",
  };
};

export const ContactService = {
  sendContactEmail,
  sendWorkshopContactEmail,
};
