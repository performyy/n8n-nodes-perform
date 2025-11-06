import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class PerformApi implements ICredentialType {
  name = 'performApi';
  displayName = 'Perform API';
  documentationUrl = ''; // opcional (link docs Perform)
  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.performy.dev',
      placeholder: 'https://api.performy.dev',
      description: 'URL base da API do Perform',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      description: 'Bearer token of Perform',
    },
    {
      displayName: 'Webhook Secret (assinatura)',
      name: 'webhookSecret',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      description: 'Secret to validate HMAC of webhooks (optional but recommended)',
    },
  ];
}
