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
        let subject = '';
        let text = '';
        if (ctx.uid === 'api::project.project') {
          subject = 'New Project Created';
          text = `A new project has been created: ${ctx.params.data.title}`;
        } else if (ctx.uid === 'api::article.article') {
          subject = 'New Article Created';
          text = `A new article has been created: ${ctx.params.data.title}`;
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