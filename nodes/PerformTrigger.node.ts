import {
    IWebhookFunctions,
    INodeType,
    INodeTypeDescription,
    IWebhookResponseData,
    IDataObject,
  } from 'n8n-workflow';
  import * as crypto from 'crypto';
  
  export class PerformTrigger implements INodeType {
    description: INodeTypeDescription = {
      displayName: 'Perform Trigger',
      name: 'performTrigger',
      icon: 'file:perform.svg',
      group: ['trigger'],
      version: 1,
      description: 'Dispara ao receber webhooks do Perform',
      defaults: { name: 'Perform Trigger' },
      inputs: [],
      outputs: ['main'],
      credentials: [{ name: 'performApi', required: true }],
      webhooks: [
        {
          name: 'default',
          httpMethod: 'POST',
          responseMode: 'onReceived',
          path: 'perform/webhook',
        },
      ],
      properties: [
        {
          displayName: 'Verify Signature',
          name: 'verify',
          type: 'boolean',
          default: true,
          description: 'Valida HMAC usando o segredo do webhook',
        },
      ],
    };
  
    async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
      const req = this.getRequestObject();
      const res = this.getResponseObject();
  
      const body = req.body as Record<string, unknown>;
      const headers = req.headers as Record<string, string>;
  
      const verify = this.getNodeParameter('verify') as boolean;
      const credentials = await this.getCredentials('performApi');
      const secret = (credentials.webhookSecret as string) || '';
  
      if (verify) {
        const signature = headers['x-perform-signature'] || '';
        const timestamp = headers['x-perform-timestamp'] || '';
        const payload = `${timestamp}.${JSON.stringify(body)}`;
        const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  
        if (!signature || signature !== expected) {
          res.status(401).json({ ok: false, error: 'invalid signature' });
          return { noWebhookResponse: true };
        }
      }
  
      // Responda rápido ao Perform
      res.status(200).json({ ok: true });
  
      // Emite o item para o fluxo
      return {
        workflowData: [[{ json: body as IDataObject }]],
      };
    }
  }
  