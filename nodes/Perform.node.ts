import {
    IExecuteFunctions,
    IHttpRequestOptions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription
} from 'n8n-workflow';

export class Perform implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Perform',
        name: 'perform',
        icon: 'file:perform.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Cria e envia formulários no Perform',
        defaults: { name: 'Perform' },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [{ name: 'performApi', required: true }],
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                options: [{ name: 'Form', value: 'form' }],
                default: 'form',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
                    { name: 'Create', value: 'create', description: 'Criar formulário' },
                    { name: 'Send', value: 'send', description: 'Enviar/Disparar formulário' },
                ],
                default: 'create',
            },

            // CREATE
            {
                displayName: 'Title',
                name: 'title',
                type: 'string',
                default: '',
                required: true,
                displayOptions: { show: { resource: ['form'], operation: ['create'] } },
            },
            {
                displayName: 'Fields (JSON)',
                name: 'fieldsJson',
                type: 'json',
                default: '[]',
                description: 'Definição dos campos do formulário',
                displayOptions: { show: { resource: ['form'], operation: ['create'] } },
            },

            // SEND
            {
                displayName: 'Form ID',
                name: 'formId',
                type: 'string',
                default: '',
                required: true,
                displayOptions: { show: { resource: ['form'], operation: ['send'] } },
            },
            {
                displayName: 'Recipient Email',
                name: 'recipientEmail',
                type: 'string',
                default: '',
                required: true,
                displayOptions: { show: { resource: ['form'], operation: ['send'] } },
            },
            {
                displayName: 'Payload (JSON)',
                name: 'payloadJson',
                type: 'json',
                default: '{}',
                description: 'Dados adicionais (ex: placeholders, metadata)',
                displayOptions: { show: { resource: ['form'], operation: ['send'] } },
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        const credentials = await this.getCredentials('performApi');
        const baseUrl = credentials.baseUrl as string;
        const apiKey = credentials.apiKey as string;

        for (let i = 0; i < items.length; i++) {
            const resource = this.getNodeParameter('resource', i) as string;
            const operation = this.getNodeParameter('operation', i) as string;

            let options: IHttpRequestOptions = {
                method: 'GET',
                json: true,
                headers: { Authorization: `Bearer ${apiKey}` },
                body: {},
                url: '',
            };

            if (resource === 'form' && operation === 'create') {
                const title = this.getNodeParameter('title', i) as string;
                const fieldsJson = this.getNodeParameter('fieldsJson', i) as object;

                options = {
                    ...options,
                    method: 'POST',
                    url: `${baseUrl}/forms`,
                    body: { title, fields: fieldsJson },
                };
            }

            if (resource === 'form' && operation === 'send') {
                const formId = this.getNodeParameter('formId', i) as string;
                const recipientEmail = this.getNodeParameter('recipientEmail', i) as string;
                const payloadJson = this.getNodeParameter('payloadJson', i) as object;

                options = {
                    ...options,
                    method: 'POST',
                    url: `${baseUrl}/forms/${formId}/send`,
                    body: { recipientEmail, ...payloadJson },
                };
            }

            const response = await this.helpers.httpRequest(options);
            returnData.push({ json: response });
        }

        return [returnData];
    }
}
