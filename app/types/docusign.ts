export interface DocuSignAuthData {
    tokenData: {
      access_token: string;
      expires_in: number;
    };
    userInfo: {
      accounts: Array<{
        account_id: string;
        is_default: boolean;
        account_name: string;
        base_uri: string;
      }>;
      name: string;
      email: string;
      sub: string;
    };
  }

  