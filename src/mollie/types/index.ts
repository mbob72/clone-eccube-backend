export interface IMollieTokensResponse {
  token: {
    access_token: string;
    expires_in: number; // 3600
    token_type: string; // bearer
    scope: string;
    refresh_token: string;
    expires_at: string; // date
  };
}

export interface IMollieProfileResponse {
  resource: 'profile';
  id: string;
  mode: 'live' | 'test';
  name: string;
  website: string;
  email: string;
  phone: string;
  businessCategory: string; // TODO: update type - enum
  categoryCode: number;
  status: string;
  createdAt: string; // '2018-03-20T09:28:37+00:00';
  _links: {
    self: {
      href: string; // 'https://api.mollie.com/v2/profiles/pfl_v9hTwCvYqw';
      type: 'application/hal+json';
    };
    dashboard: {
      href: string; // 'https://www.mollie.com/dashboard/org_123456789/settings/profiles/pfl_v9hTwCvYqw';
      type: 'text/html';
    };
    chargebacks: {
      href: string; // 'https://api.mollie.com/v2/chargebacks?profileId=pfl_v9hTwCvYqw';
      type: 'application/hal+json';
    };
    methods: {
      href: string; //  'https://api.mollie.com/v2/methods?profileId=pfl_v9hTwCvYqw';
      type: 'application/hal+json';
    };
    payments: {
      href: string; // 'https://api.mollie.com/v2/payments?profileId=pfl_v9hTwCvYqw';
      type: 'application/hal+json';
    };
    refunds: {
      href: string; // 'https://api.mollie.com/v2/refunds?profileId=pfl_v9hTwCvYqw';
      type: 'application/hal+json';
    };
    checkoutPreviewUrl: {
      href: string; //  'https://www.mollie.com/payscreen/preview/pfl_v9hTwCvYqw';
      type: 'text/html';
    };
    documentation: {
      href: string; //  'https://docs.mollie.com/reference/v2/profiles-api/create-profile';
      type: 'text/html';
    };
  };
}

// TODO: update type - enum
export interface IMollieProfileEnabledPaymentMethodResponse {
  resource: 'method';
  id: string; //'ideal';
  description: string;
  minimumAmount: {
    value: string; // '0.01';
    currency: string; // 'EUR';
  };
  maximumAmount: {
    value: string; // '50000.00';
    currency: string; // 'EUR';
  };
  image: {
    size1x: string; //  'https://www.mollie.com/external/icons/payment-methods/ideal.png';
    size2x: string; //  'https://www.mollie.com/external/icons/payment-methods/ideal%402x.png';
    svg: string; //  'https://www.mollie.com/external/icons/payment-methods/ideal.svg';
  };
  status: string; //  'activated';
  _links: {
    self: {
      href: string; // 'https://api.mollie.com/v2/methods/ideal';
      type: string; //  'application/hal+json';
    };
    documentation: {
      href: string; // 'https://docs.mollie.com/reference/v2/profiles-api/enable-method';
      type: string; //  'text/html';
    };
  };
}

export enum MollieMethodQuery {
  // Include issuer details such as which iDEAL or gift card issuers are available.
  issuers = 'issuers',

  //Include pricing for each payment method.
  pricing = 'pricing',
}

interface IMolliePaymentMethod {
  resource: 'method';
  id: string; // 'creditcard';
  description: string; // 'Credit card';
  minimumAmount: {
    value: string; // '0.01';
    currency: string; // 'EUR';
  };
  maximumAmount: {
    value: string; // '2000.00';
    currency: string; // 'EUR';
  };
  image: {
    size1x: string; //  'https://mollie.com/external/icons/payment-methods/creditcard.png';
    size2x: string; //  'https://mollie.com/external/icons/payment-methods/creditcard%402x.png';
    svg: string; // 'https://mollie.com/external/icons/payment-methods/creditcard.svg';
  };
  status: string; //  'activated';
  pricing: [
    {
      description: string; //  'Commercial & non-European cards';
      fixed: {
        value: string; //  '0.25';
        currency: string; //  'EUR';
      };
      variable: string; //  '2.8';
      feeRegion: string; //  'other';
    },
    {
      description: string; // 'European cards';
      fixed: {
        value: string; //  '0.25';
        currency: string; //  'EUR';
      };
      variable: string; //  '1.8';
      feeRegion: string; // 'eu-cards';
    },
    {
      description: string; //  'American Express';
      fixed: {
        value: string; //  '0.25';
        currency: string; // 'EUR';
      };
      variable: string; //  '2.8';
      feeRegion: string; //  'amex';
    },
  ];
  _links: {
    self: {
      href: string; //  'https://api.mollie.com/v2/methods/creditcard';
      type: string; //  'application/hal+json';
    };
  };
}

export interface IMollieListPaymentMethodsResponse {
  count: number;
  _embedded: {
    methods: IMolliePaymentMethod[];
  };
  _links: {
    self: {
      href: string; //  'https://api.mollie.com/v2/methods';
      type: string; // 'application/hal+json';
    };
    documentation: {
      href: string; // 'https://docs.mollie.com/reference/v2/methods-api/list-methods';
      type: string; // 'text/html';
    };
  };
}
