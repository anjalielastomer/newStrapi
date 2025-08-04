import type { Core } from '@strapi/strapi';
import Mailer from './extensions/mail/mailer';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    setupNotificationPageActions(strapi);
    setupCareerRequestNotificationActions(strapi);
    setupContactUsNotificationActions(strapi);
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) { },
};


function setupNotificationPageActions(strapi: Core.Strapi) {
  const mailingListContentTypes = ['api::project.project', 'api::article.article'];
  strapi.documents.use(async (ctx, next) => {
    if (ctx.action == 'create' && mailingListContentTypes.includes(ctx.uid)) {
      (async () => {
        let subject = "🚀 New {{contentType}} Just Added: {{title}} on Anjali Elastomer!";
        let text = "Hi,\n\nWe\'re excited to let you know that a *new {{contentType}}* titled *\"{{title}}\"* has just been added to *Anjali Elastomer*!\n\nWhether you\'re exploring our work or following our latest updates, this new addition is something we think you\'ll find valuable and interesting.\n\n👉 *Check it out now:* [View \"{{title}}\"](https://anjalielastomer.com/{{documentId}})\n\nThank you for being a part of our growing community.\n\nWarm regards,  \n*Team Anjali Elastomer*\n\n---\n\nYou\'re receiving this email because you subscribed to updates from Anjali Elastomer. If you\'d like to stop receiving emails, you can [unsubscribe](#).";

        if (ctx.uid === 'api::project.project') {
          subject = subject.replace(/{{contentType}}/g, 'Project').replace(/{{title}}/g, ctx.params.data.title);
          text = text.replace(/{{contentType}}/g, 'Project').replace(/{{title}}/g, ctx.params.data.title).replace(/{{documentId}}/g, ctx.params.data.documentId);
        } else if (ctx.uid === 'api::article.article') {
          subject = subject.replace(/{{contentType}}/g, 'Article').replace(/{{title}}/g, ctx.params.data.title);
          text = text.replace(/{{contentType}}/g, 'Article').replace(/{{title}}/g, ctx.params.data.title).replace(/{{documentId}}/g, ctx.params.data.documentId);
        }
        const mailingList = await strapi.documents('api::mailing-list.mailing-list').findMany();
        Mailer.transport.sendMail({
          ...Mailer.defaultParams,
          bcc: mailingList.map(entry => entry.email),
          subject: subject,
          text: text,
        }).then((info) => {
          strapi.log.info(`Email sent to Mailing List. Message ID: ${info.messageId}`);
        }).catch((error) => {
          strapi.log.error(`Failed to send email to Mailing List. Error: ${error.message}`);
        });
      })();
    }
    return next();
  });
}

function setupCareerRequestNotificationActions(strapi: Core.Strapi) {
  strapi.documents.use(async (ctx, next) => {
    if (ctx.action == 'create' && ctx.uid === 'api::career-request.career-request') {
      (async () => {
        const subject = "New Career Request Received";
        const text = `Hi Team,\n\nA new career request has been submitted.\n\nDetails:\n- Name: ${ctx.params.data.name}\n- Email: ${ctx.params.data.email}\n- Mobile: ${ctx.params.data.contact}\n- Position: ${ctx.params.data.position}\n\nPlease review the request at your earliest convenience.\n\nBest regards,\nAnjali Elastomer Team`;
        Mailer.transport.sendMail({
          ...Mailer.defaultParams,
          to: 'careers@anjalielastomer.com',
          subject: subject,
          text: text,
        });
      })();
    }
    return next();
  });
}

function setupContactUsNotificationActions(strapi: Core.Strapi) {
  strapi.documents.use(async (ctx, next) => {
    if (ctx.action == 'create' && ctx.uid === 'api::contact-us-message.contact-us-message') {
      (async () => {
        const subject = "New Contact Us Message Received";
        const text = `Hi Team,\n\nA new message has been received through the Contact Us form.\n\nDetails:\n- Name: ${ctx.params.data.first_name} ${ctx.params.data.last_name}\n- Email: ${ctx.params.data.email}\n- Mobile: ${ctx.params.data.mobile}\n- Company: ${ctx.params.data.company}\n- Project Type: ${ctx.params.data.project_type}\n- Message: ${ctx.params.data.message}\n\nPlease respond to the message at your earliest convenience.\n\nBest regards,\nAnjali Elastomer Team`;
        Mailer.transport.sendMail({
          ...Mailer.defaultParams,
          to: 'info@anjalielastomer.com',
          subject: subject,
          text: text,
        });
      })();
    }
    return next();
  });
}
