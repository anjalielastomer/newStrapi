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