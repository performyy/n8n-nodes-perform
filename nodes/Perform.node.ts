import {
    IExecuteFunctions,
    IHttpRequestOptions,
    ILoadOptionsFunctions,
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
                displayName: 'Form',
                name: 'formId',
                type: 'options',
                required: true,
                default: '',
                description: 'Selecione um formulário do Perform',
                typeOptions: {
                    loadOptionsMethod: 'getForms',         // chama o método abaixo
                },
                noDataExpression: true,
            }
        ],
    };

    methods = {
        loadOptions: {
            async getForms(this: ILoadOptionsFunctions) {
                // Lê credenciais Perform API
                const credentials = await this.getCredentials('performApi');
                const baseUrl = credentials.baseUrl as string;
                const apiKey = credentials.apiKey as string;

                const options: IHttpRequestOptions = {
                    method: 'GET',
                    url: `${baseUrl}/api/v1/n8n-integration/find-forms`,   // ajuste conforme sua API
                    json: true,
                    headers: { Authorization: apiKey },
                };

                const res = await this.helpers.httpRequest(options);

                // mapeia para o formato { name, value }
                // ajuste os campos conforme o payload da sua API
                const forms = Array.isArray(res?.data) ? res.data : res; // flexível
                return (forms || []).map((f: any) => ({
                    name: f.title,
                    value: f.id,
                    // opcional: descrição no hover
                    description: f.description ?? undefined,
                }));
            },
        },
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


            if (operation === 'createLink') {

                let options: IHttpRequestOptions = {
                    method: 'POST',
                    json: true,
                    headers: { Authorization: apiKey },
                    body: {
                        formId
                    },
                    url: `${baseUrl}/api/v1/n8n-integration/create-link`,
                };

                const response = await this.helpers.httpRequest(options);
                returnData.push({ json: response });
            }
        }

        return [returnData];
    }
}
