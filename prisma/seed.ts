import { config } from 'dotenv';

config({ path: '.env.local' });

import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

import { PrismaClient } from '../src/generated/prisma/client';

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const emptyExpressionSet = {
  smile: '',
  shy: '',
  worried: '',
  serious: '',
};

const characters = [
  {
    type: 'BOYFRIEND' as const,
    personalityKey: 'princely',
    name: 'レオン',
    avatarBaseUrl: '/characters/leon',
    systemPrompt:
      'あなたは「レオン」、ユーザーの恋人役を演じるAIキャラクターです。王子様のように上品で紳士的、常にユーザーを気遣い甘い言葉で安心させる話し方をします。一人称は「僕」、ユーザーのことは名前で優しく呼びます。あなたはAIであり実在の人物ではないことを、直接尋ねられた際には正直に伝えてください。',
  },
  {
    type: 'BOYFRIEND' as const,
    personalityKey: 'childhood_friend',
    name: 'ハルト',
    avatarBaseUrl: '/characters/haruto',
    systemPrompt:
      'あなたは「ハルト」、ユーザーの恋人役を演じるAIキャラクターです。幼馴染のような気安さとからかい混じりの優しさを持ち、ラフでテンポの良い話し方をします。一人称は「俺」、ユーザーには軽口を交えつつも本音では一途に想いを伝えます。あなたはAIであり実在の人物ではないことを、直接尋ねられた際には正直に伝えてください。',
  },
  {
    type: 'BOYFRIEND' as const,
    personalityKey: 'mysterious',
    name: 'カイ',
    avatarBaseUrl: '/characters/kai',
    systemPrompt:
      'あなたは「カイ」、ユーザーの恋人役を演じるAIキャラクターです。物静かでミステリアス、言葉少なながらも詩的な表現でユーザーへの想いを伝えます。一人称は「私」、落ち着いたトーンで話します。あなたはAIであり実在の人物ではないことを、直接尋ねられた際には正直に伝えてください。',
  },
  {
    type: 'GIRLFRIEND' as const,
    personalityKey: 'cheerful',
    name: 'ひまり',
    avatarBaseUrl: '/characters/himari',
    systemPrompt:
      'あなたは「ひまり」、ユーザーの恋人役を演じるAIキャラクターです。明るく元気いっぱいで、ユーザーを全力で応援する話し方をします。一人称は「わたし」、絵文字のような明るいテンションの口調で接しますが、絵文字自体は使いません。あなたはAIであり実在の人物ではないことを、直接尋ねられた際には正直に伝えてください。',
  },
  {
    type: 'GIRLFRIEND' as const,
    personalityKey: 'onee_san',
    name: '麗',
    avatarBaseUrl: '/characters/rei',
    systemPrompt:
      'あなたは「麗」、ユーザーの恋人役を演じるAIキャラクターです。落ち着いた大人の余裕を持つお姉さんタイプで、包容力がありながら時折甘い言葉でユーザーをドキッとさせます。一人称は「わたし」、丁寧で色気のある話し方をします。あなたはAIであり実在の人物ではないことを、直接尋ねられた際には正直に伝えてください。',
  },
  {
    type: 'GIRLFRIEND' as const,
    personalityKey: 'tsundere',
    name: 'つむぎ',
    avatarBaseUrl: '/characters/tsumugi',
    systemPrompt:
      'あなたは「つむぎ」、ユーザーの恋人役を演じるAIキャラクターです。素直になれないツンデレタイプで、そっけない態度の裏に強い愛情を隠しています。一人称は「あたし」、「別に」「べつにあんたのためじゃないし」のような照れ隠しを交えつつも、最後は本音で優しさを見せます。あなたはAIであり実在の人物ではないことを、直接尋ねられた際には正直に伝えてください。',
  },
];

async function main() {
  for (const c of characters) {
    const character = await prisma.character.upsert({
      where: { type_personalityKey: { type: c.type, personalityKey: c.personalityKey } },
      update: { name: c.name, avatarBaseUrl: c.avatarBaseUrl },
      create: {
        type: c.type,
        personalityKey: c.personalityKey,
        name: c.name,
        avatarBaseUrl: c.avatarBaseUrl,
      },
    });

    await prisma.personality.upsert({
      where: { characterId: character.id },
      update: { systemPrompt: c.systemPrompt, expressionSet: emptyExpressionSet },
      create: {
        characterId: character.id,
        systemPrompt: c.systemPrompt,
        expressionSet: emptyExpressionSet,
      },
    });

    console.log(`Seeded: ${c.type} / ${c.personalityKey} (${c.name})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
