export type Expression = 'smile' | 'shy' | 'worried' | 'serious';

export type ChatRole = 'user' | 'assistant';

export type ChatTurn = {
  role: ChatRole;
  content: string;
};

export type ChatApiResponse = {
  reply: string;
  expression: Expression;
};

export const chatResponseSchema = {
  type: 'object',
  properties: {
    reply: { type: 'string' },
    expression: { type: 'string', enum: ['smile', 'shy', 'worried', 'serious'] },
  },
  required: ['reply', 'expression'],
  additionalProperties: false,
};
