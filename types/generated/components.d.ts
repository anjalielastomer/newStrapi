import type { Schema, Struct } from '@strapi/strapi';

export interface CommonText extends Struct.ComponentSchema {
  collectionName: 'components_common_texts';
  info: {
    displayName: 'Text';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'common.text': CommonText;
    }
  }
}
