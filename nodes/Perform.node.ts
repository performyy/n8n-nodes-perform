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
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
                    // { name: 'Create', value: 'create', description: 'Criar formulário' },
                    // { name: 'Send', value: 'send', description: 'Enviar/Disparar formulário' },
                    { name: 'Criar link do formulário', value: 'createLink', description: 'Criar link do formulário' },
                ],
                default: 'createLink',
            },
            {
                displayName: 'Form ID',
                name: 'formId',
                type: 'string',
                default: '',
                description: 'ID do formulário',
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
            const formId = this.getNodeParameter('formId', i) as string;
            const operation = this.getNodeParameter('operation', i) as string;

            console.log('formId', formId);
            console.log('operation', operation);
            console.log('credentials', credentials);

            let options: IHttpRequestOptions = {
                method: 'GET',
                json: true,
                headers: { Authorization: `Bearer ${apiKey}` },
                body: {},
                url: '',
            };

            if (operation === 'createLink') {
                options = {
                    ...options,
                    method: 'GET',
                    url: `${baseUrl}/forms/${formId}/link`,
                };
            }

            const response = await this.helpers.httpRequest(options);
            returnData.push({ json: response });
        }

        return [returnData];
    }
}
